# Dashboard Real Data Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Thay toàn bộ mock data ở trang `/dashboard` (overview) bằng dữ liệu thật từ các API Hono đã có sẵn.

**Architecture:** Tách logic biến đổi dữ liệu thành pure function trong `lib/dashboard/`, TDD từng hàm bằng Vitest, rồi cho component gọi hook TanStack Query và đẩy dữ liệu qua các hàm đó. **Không sửa bất kỳ file nào trong `app/api/`** — mọi thứ cần thiết đã có ở endpoint hiện tại. Ràng buộc này là cố ý: đợt migrate Clerk→Supabase sắp tới sẽ viết lại 6 file route, nên plan này tránh chạm vào để hai việc không giẫm chân nhau.

**Tech Stack:** Next 15.3.1, React 19, TanStack Query v5, Hono RPC client (`lib/hono`), Recharts, date-fns, Vitest (thêm mới).

---

## Bối cảnh: mock nằm ở đâu

Trang `/dashboard` render 3 khối (`app/(site)/dashboard/(overview)/page.tsx`):

| Khối | Nguồn dữ liệu |
|---|---|
| `<DataGrid />` | ✅ thật — `useGetSummary()` |
| `<DataChart />` | ✅ thật — `useGetSummary()` |
| `<NewOverview />` | ❌ **toàn bộ mock** — `components/dashboard/overview/index.tsx` |

`NewOverview` (498 dòng) render 9 component con, tất cả đều hardcode mảng dữ liệu.

## Phân loại 9 component

**Nhóm A — có dữ liệu thật, chỉ cần đấu dây (6 component, phạm vi của plan này):**

| Component | Nguồn thật |
|---|---|
| `transaction-list.tsx` | `GET /api/transactions` |
| `spending-breakdown.tsx` | `GET /api/summary` → `categories[]` |
| `expense-chart.tsx` | `GET /api/transactions` gộp theo tháng |
| `subscription-list.tsx` | `GET /api/subscriptions` |
| `upcoming-payments.tsx` | suy ra từ `subscriptions` |
| `monthly-calendar.tsx` | `GET /api/summary` → `days[]` |

**Nhóm B — không có nguồn dữ liệu nào (3 component, gỡ khỏi overview):**

`asset-allocation.tsx`, `stock-table.tsx` cần dữ liệu đầu tư mà DB **chưa có bảng nào** (schema chỉ có accounts, categories, transactions, subscriptions, user_settings). `chat-assistant.tsx` là tính năng AI chưa làm, không phải mock cần thay.

**Ngoài phạm vi:** toàn bộ `/dashboard/investing` (8 component mock). Nó cần schema mới cộng nguồn dữ liệu thị trường, mà `vnstock-js@0.5.1` đang lỗi `Invalid response structure: missing data`. Đó là plan riêng.

## Hình dạng dữ liệu thật

`GET /api/summary` qua `useGetSummary()` (`features/summary/api/use-get-summary.ts`), đã đổi từ miliunits:

```ts
{
  remainingAmount: number; remainingChange: number;
  incomeAmount: number;    incomeChange: number;
  expensesAmount: number;  expensesChange: number;
  categories: { name: string; value: number }[];
  days: { date: string; income: number; expenses: number }[];
}
```

`GET /api/transactions` qua `useGetTransactions()`:

```ts
{ id, date, category, categoryId, payee, amount, notes, accountId, account }[]
```

`GET /api/subscriptions` trả thẳng row Drizzle, **chưa có hook**:

```ts
{ id, userId, name, amount, frequency, startDate, currency, hasFreeTrial, categoryId, notes, createdAt, updatedAt }[]
```

**Quy ước dấu:** `amount < 0` là chi, `amount >= 0` là thu (theo cách `summary.ts` tính). Tiền lưu dạng **miliunits** trong DB, hook phải gọi `convertAmountFromMiliunits`. `/api/subscriptions` trả raw nên hook mới phải tự đổi.

## Về TDD trong plan này

Project **chưa có hạ tầng test nào** — không vitest, không jest, không playwright, `package.json` không có script `test`. Task 0 dựng Vitest.

Chỗ TDD là các **pure function biến đổi dữ liệu**, đó mới là nơi có logic sai được. Phần đấu dây component (đổi `const data = [...]` thành `const { data } = useX()`) verify bằng cách mở app xem, không viết test component: chi phí dựng provider TanStack Query trong test không tương xứng giá trị ở giai đoạn này.

---

### Task 0: Dựng Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `lib/dashboard/__tests__/setup.test.ts`

**Step 1: Cài dependency**

```bash
cd D:/ttqspace/finance-app
pnpm add -D vitest
```

Không cài `@vitejs/plugin-react`: `environment` là `node`, glob chỉ khớp `.test.ts`, và plan này không test component React nên plugin không có việc gì để làm.

**Step 2: Tạo `vitest.config.ts`**

Giữ đuôi `.ts` — đừng đổi sang `.mts`, vì `include` trong `tsconfig.json` là `**/*.ts` nên `.mts` sẽ lặng lẽ rơi ra ngoài phạm vi type-check.

```ts
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./") },
  },
});
```

**Step 3: Thêm script vào `package.json`**

```json
"test": "vitest run",
"test:watch": "vitest"
```

Đồng thời khai báo sàn Node — `vitest@5` yêu cầu `^22.12.0 || ^24.0.0 || >=26.0.0` mà repo chưa khai báo gì:

```json
"engines": { "node": ">=22.12" }
```

Và tạo `.nvmrc` chứa đúng một dòng `24` (Node đang dùng là v24.19.0).

`vitest@5` cũng khai peer `@types/node: "^22.0.0 || >=24.0.0"`, trong khi repo ghim `^20`. Nâng `@types/node` lên `^24` để lockfile không ghi nhận vi phạm peer. Chạy `npx tsc --noEmit` trước và sau khi nâng: baseline là 11 lỗi có sẵn (trong `app/` và `components/homepage/gold-price-table.tsx`). Nếu số lỗi tăng thì hoàn tác việc nâng và báo lại, đừng sửa các lỗi đó — chúng ngoài phạm vi.

**Step 4: Test khói để xác nhận hạ tầng chạy**

`lib/dashboard/__tests__/setup.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("vitest setup", () => {
  it("chạy được", () => {
    expect(1 + 1).toBe(2);
  });
});
```

**Step 5: Chạy**

Run: `pnpm test`
Expected: PASS, 1 test.

**Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml .nvmrc vitest.config.ts lib/dashboard/__tests__/setup.test.ts
git commit -m "chore: add vitest for dashboard data transforms"
```

> Test khói này chỉ là cổng kiểm tra hạ tầng. Task 1 sẽ xoá nó ngay khi có test thật.

---

### Task 1: Hàm gộp giao dịch theo tháng

`expense-chart.tsx` cần thu/chi/tiết kiệm theo từng tháng. `useGetSummary()` chỉ trả `days[]` trong khoảng lọc hiện tại nên không đủ, phải gộp từ danh sách giao dịch.

**Files:**
- Create: `lib/dashboard/aggregate-by-month.ts`
- Create: `lib/dashboard/__tests__/aggregate-by-month.test.ts`

**Step 1: Viết test thất bại**

```ts
import { describe, expect, it } from "vitest";
import { aggregateByMonth } from "@/lib/dashboard/aggregate-by-month";

describe("aggregateByMonth", () => {
  it("gộp thu và chi theo tháng, chi trả về số dương", () => {
    const result = aggregateByMonth([
      { date: "2026-01-05", amount: 5000 },
      { date: "2026-01-20", amount: -1200 },
      { date: "2026-02-03", amount: -800 },
    ]);

    expect(result).toEqual([
      { month: "2026-01", name: "Jan", Income: 5000, Expenses: 1200, Savings: 3800 },
      { month: "2026-02", name: "Feb", Income: 0, Expenses: 800, Savings: -800 },
    ]);
  });

  it("trả mảng rỗng khi không có giao dịch", () => {
    expect(aggregateByMonth([])).toEqual([]);
  });

  it("sắp xếp theo tháng tăng dần bất kể thứ tự đầu vào", () => {
    const result = aggregateByMonth([
      { date: "2026-03-01", amount: 100 },
      { date: "2026-01-01", amount: 100 },
    ]);
    expect(result.map((r) => r.month)).toEqual(["2026-01", "2026-03"]);
  });
});
```

**Step 2: Chạy để xác nhận fail**

Run: `pnpm test aggregate-by-month`
Expected: FAIL với `Failed to resolve import "@/lib/dashboard/aggregate-by-month"`

**Step 3: Cài đặt tối thiểu**

```ts
import { format, parseISO } from "date-fns";

export type MonthlyPoint = {
  month: string;
  name: string;
  Income: number;
  Expenses: number;
  Savings: number;
};

type Input = { date: string | Date; amount: number };

export function aggregateByMonth(transactions: Input[]): MonthlyPoint[] {
  const buckets = new Map<string, { Income: number; Expenses: number }>();

  for (const t of transactions) {
    const d = typeof t.date === "string" ? parseISO(t.date) : t.date;
    const key = format(d, "yyyy-MM");
    const bucket = buckets.get(key) ?? { Income: 0, Expenses: 0 };

    if (t.amount >= 0) bucket.Income += t.amount;
    else bucket.Expenses += Math.abs(t.amount);

    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      name: format(parseISO(`${month}-01`), "MMM"),
      Income: v.Income,
      Expenses: v.Expenses,
      Savings: v.Income - v.Expenses,
    }));
}
```

**Step 4: Chạy lại**

Run: `pnpm test aggregate-by-month`
Expected: PASS, 3 tests.

**Step 5: Gỡ test khói của Task 0**

`lib/dashboard/__tests__/setup.test.ts` chỉ khẳng định `1 + 1 === 2`. Nó là cổng hợp lệ để nghiệm thu hạ tầng ở Task 0, nhưng khi đã có test thật thì chỉ còn là nhiễu. Xoá và stage luôn:

```bash
git rm lib/dashboard/__tests__/setup.test.ts
```

Run: `pnpm test`
Expected: PASS, 3 tests — chỉ còn `aggregate-by-month`.

**Step 6: Commit**

```bash
git add lib/dashboard/aggregate-by-month.ts lib/dashboard/__tests__/aggregate-by-month.test.ts
git commit -m "feat: add aggregateByMonth transform for expense chart"
```

---

### Task 2: Hook lấy giao dịch theo khoảng thời gian tuỳ ý

`useGetTransactions()` đọc `from`/`to` từ URL nên chỉ lấy khoảng đang lọc. Biểu đồ 12 tháng cần khoảng riêng, độc lập với bộ lọc.

**Files:**
- Create: `features/transactions/api/use-get-transactions-range.ts`

**Step 1: Cài đặt**

```ts
import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, subMonths } from "date-fns";

export const useGetTransactionsRange = (months = 12) => {
  const to = new Date();
  const from = startOfMonth(subMonths(to, months - 1));

  const fromStr = format(from, "yyyy-MM-dd");
  const toStr = format(to, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["transactions", "range", { fromStr, toStr }],
    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: { from: fromStr, to: toStr, accountId: "" },
      });

      if (!response.ok) throw new Error("Failed to fetch transactions");

      const { data } = await response.json();
      return data.map((t) => ({ ...t, amount: convertAmountFromMiliunits(t.amount) }));
    },
  });
};
```

**Step 2: Verify bằng app**

Run: `pnpm dev -p 3005`, mở `http://localhost:3005/dashboard`, mở DevTools → Network, xác nhận có request `/api/transactions?from=...&to=...` trả 200.

**Step 3: Commit**

```bash
git add features/transactions/api/use-get-transactions-range.ts
git commit -m "feat: add transactions range hook independent of URL filters"
```

---

### Task 3: Đấu dây ExpenseChart

**Files:**
- Modify: `components/dashboard/overview/expense-chart.tsx` (xoá mảng `data` mock ở dòng 14)

**Step 1: Thay mock bằng hook**

Xoá toàn bộ `const data = [...]`. Trong component:

```tsx
const { data: transactions, isLoading } = useGetTransactionsRange(12);
const data = useMemo(() => aggregateByMonth(transactions ?? []), [transactions]);

if (isLoading) {
  return <Skeleton className="h-[300px] w-full" />;
}

if (data.length === 0) {
  return (
    <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
      Chưa có giao dịch nào trong 12 tháng qua
    </div>
  );
}
```

Giữ nguyên phần `<ResponsiveContainer>` bên dưới — khoá `name`, `Income`, `Expenses`, `Savings` đã khớp với output của `aggregateByMonth` nên JSX biểu đồ không phải sửa.

**Lưu ý:** mock cũ có `incomeBreakdown`/`expenseBreakdown` cho tooltip. Dữ liệu thật chưa có mức chi tiết đó. Nếu tooltip đang dùng, hãy đơn giản hoá tooltip thay vì bịa thêm dữ liệu.

**Step 2: Verify**

Mở `/dashboard`, biểu đồ hiển thị số khớp dữ liệu thật. DB có 68 giao dịch, mới nhất `2025-05-13`, nên khoảng 12 tháng gần đây **có thể rỗng**. Nếu vậy phải thấy đúng thông báo rỗng, không phải biểu đồ trắng hay crash.

**Step 3: Commit**

```bash
git add components/dashboard/overview/expense-chart.tsx
git commit -m "feat: wire ExpenseChart to real transaction data"
```

---

### Task 4: Đấu dây SpendingBreakdown

**Files:**
- Modify: `components/dashboard/overview/spending-breakdown.tsx` (xoá `spendingData` dòng 15)

**Step 1: Dùng summary có sẵn**

```tsx
const { data: summary, isLoading } = useGetSummary();

const PALETTE = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#6b7280"];

const spendingData = useMemo(
  () =>
    (summary?.categories ?? []).map((c, i) => ({
      category: c.name,
      amount: Math.abs(c.value),
      color: PALETTE[i % PALETTE.length],
    })),
  [summary]
);
```

Thêm nhánh loading và rỗng như Task 3.

**Step 2: Verify**

Số trong biểu đồ nên gần khớp với `<DataChart />` phía trên cùng trang, vì cùng nguồn `/api/summary`.

**Đừng coi `<DataChart />` là chuẩn đúng.** Bản plan đầu dùng phép đối chứng này làm tiêu chí đúng/sai; điều đó sai và đã được review bác bỏ. `summary.ts:143` gộp bằng `.groupBy(transactions.date)` — theo **timestamp đầy đủ**, không `date_trunc` — nên cùng một ngày lịch có thể sinh nhiều dòng (import CSV cho `00:00:00Z`, date picker cho `17:00:00Z`). Sau đó `fillMissingDays` (`lib/utils.ts:65-88`) khớp bằng `.find()`, lấy dòng đầu và **âm thầm bỏ phần còn lại**. Đó là mất dữ liệu thật, không phải giả thuyết.

Nên hai khối lệch nhau **không** chứng minh biến đổi của bạn sai — có thể `<DataChart />` mới là bên sai. Dùng nó như một tín hiệu để đi tìm hiểu, không phải như bằng chứng.

**Step 3: Commit**

```bash
git add components/dashboard/overview/spending-breakdown.tsx
git commit -m "feat: wire SpendingBreakdown to summary categories"
```

---

### Task 5: Đấu dây TransactionList

**Files:**
- Modify: `components/dashboard/overview/transaction-list.tsx` (xoá `transactions` mock dòng 14)

**Step 1: Thay bằng dữ liệu thật**

```tsx
const { data: transactions, isLoading } = useGetTransactions();
const recent = (transactions ?? []).slice(0, 5);
```

Mock cũ gắn sẵn `icon` và `iconBg` cho từng dòng. Dữ liệu thật không có icon, chọn theo `category`:

```tsx
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Food: Utensils,
  Transport: Car,
  Housing: Home,
  Utilities: Zap,
  Internet: Wifi,
};

const iconFor = (category: string | null) => CATEGORY_ICONS[category ?? ""] ?? CreditCard;
```

Phân biệt thu/chi bằng `amount >= 0`, đừng dựa vào trường `type` — dữ liệu thật không có trường đó.

**Step 2: Verify**

5 dòng hiển thị phải trùng 5 dòng đầu ở `/dashboard/transactions`.

**Step 3: Commit**

```bash
git add components/dashboard/overview/transaction-list.tsx
git commit -m "feat: wire TransactionList to real transactions"
```

---

### Task 6: Hook subscriptions

**Files:**
- Create: `features/subscriptions/api/use-get-subscriptions.ts`

```ts
import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetSubscriptions = () =>
  useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const response = await client.api.subscriptions.$get();
      if (!response.ok) throw new Error("Failed to fetch subscriptions");

      const data = await response.json();
      return data.map((s) => ({ ...s, amount: convertAmountFromMiliunits(s.amount) }));
    },
  });
```

**Lưu ý:** `/api/subscriptions` trả thẳng mảng (`c.json(data)`), **không bọc trong `{ data }`** như các endpoint khác. Đừng destructure nhầm.

**Commit:** `feat: add subscriptions query hook`

---

### Task 7: Hàm tính kỳ thanh toán kế tiếp

**Files:**
- Create: `lib/dashboard/next-payment-date.ts`
- Create: `lib/dashboard/__tests__/next-payment-date.test.ts`

**Step 1: Test thất bại**

```ts
import { describe, expect, it } from "vitest";
import { nextPaymentDate } from "@/lib/dashboard/next-payment-date";

describe("nextPaymentDate", () => {
  it("cộng tháng cho gói monthly cho tới khi vượt mốc hiện tại", () => {
    const result = nextPaymentDate(new Date("2026-01-15"), "monthly", new Date("2026-03-20"));
    expect(result.toISOString().slice(0, 10)).toBe("2026-04-15");
  });

  it("cộng năm cho gói yearly", () => {
    const result = nextPaymentDate(new Date("2024-06-10"), "yearly", new Date("2026-03-20"));
    expect(result.toISOString().slice(0, 10)).toBe("2026-06-10");
  });

  it("trả chính startDate khi kỳ đầu còn ở tương lai", () => {
    const result = nextPaymentDate(new Date("2026-12-01"), "monthly", new Date("2026-03-20"));
    expect(result.toISOString().slice(0, 10)).toBe("2026-12-01");
  });
});
```

**Step 2:** Run `pnpm test next-payment-date` → FAIL

**Step 3: Cài đặt**

```ts
import { addMonths, addYears, isAfter } from "date-fns";

export function nextPaymentDate(
  startDate: Date,
  frequency: string,
  now: Date = new Date()
): Date {
  const step = frequency === "yearly" ? addYears : addMonths;
  let next = startDate;
  let guard = 0;

  while (!isAfter(next, now) && guard < 1000) {
    next = step(next, 1);
    guard++;
  }

  return next;
}
```

**Step 4:** Run `pnpm test next-payment-date` → PASS, 3 tests

**Step 5: Commit** — `feat: add nextPaymentDate for subscription billing cycles`

---

### Task 8: Đấu dây SubscriptionList

**Files:**
- Modify: `components/dashboard/overview/subscription-list.tsx` (xoá mock dòng 18)

Dùng `useGetSubscriptions()`. Cột "next billing" tính bằng `nextPaymentDate(new Date(s.startDate), s.frequency)`.

Xử lý rỗng cẩn thận: DB hiện chỉ có **1 subscription**, đây là chỗ dễ lộ lỗi layout khi danh sách ngắn.

**Commit:** `feat: wire SubscriptionList to real subscriptions`

---

### Task 9: Đấu dây UpcomingPayments

**Files:**
- Modify: `components/dashboard/overview/upcoming-payments.tsx` (xoá mock dòng 6)

Suy ra từ chính `useGetSubscriptions()`, không có bảng "payments" riêng:

```tsx
const upcoming = useMemo(
  () =>
    (subscriptions ?? [])
      .map((s) => ({ ...s, dueDate: nextPaymentDate(new Date(s.startDate), s.frequency) }))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5),
  [subscriptions]
);
```

**Commit:** `feat: derive UpcomingPayments from subscription cycles`

---

### Task 10: Đấu dây MonthlyCalendar

**Files:**
- Modify: `components/dashboard/overview/monthly-calendar.tsx`

Mảng `days` dòng 7 là nhãn thứ trong tuần (`["SUN","MON",...]`) — **giữ nguyên, đó không phải mock data**. Phần cần thay là số tiền mỗi ngày: lấy `useGetSummary().days` (`{ date, income, expenses }`) rồi map vào từng ô lịch theo `date`.

**Commit:** `feat: wire MonthlyCalendar to summary days`

---

### Task 11: Gỡ các component không có nguồn dữ liệu

**Files:**
- Modify: `components/dashboard/overview/index.tsx`

Gỡ khỏi JSX: `<AssetAllocation />` (dòng 56 và 202), `<StockTable />` (dòng 213), `<ChatAssistant />` (dòng 99). Xoá import tương ứng ở dòng 3, 4, 8.

**Không xoá file component** — chúng sẽ dùng lại khi làm phần investing. Việc gỡ chỉ nhằm đảm bảo mọi con số người dùng nhìn thấy trên `/dashboard` đều là số thật.

**Thêm một việc nữa: `<ExpenseChart />` đang được render hai lần.** Ở `index.tsx:47` dưới mục "Cash Flow" — đúng chỗ. Nhưng còn ở `index.tsx:191` dưới mục **"Portfolio Performance / Your investment growth over time"** — sai hoàn toàn: đó là biểu đồ thu-chi, không phải hiệu suất đầu tư. Hồi cả hai còn mock thì cùng vô nghĩa như nhau nên không ai để ý; sau Task 3 nó thành dữ liệu thật bị gắn nhãn sai, và sẽ hiện "chưa có giao dịch nào trong 12 tháng" ngay dưới tiêu đề danh mục đầu tư. Gỡ lần render ở dòng 191 cùng với ba component kia.

Kiểm tra lại layout grid sau khi gỡ: các ô còn lại phải lấp đầy chỗ trống, không để lỗ hổng.

**Dọn nốt ba chỗ chưa nhất quán do làm rải rác qua nhiều nhóm:**

1. `expense-chart.tsx` là widget duy nhất **chưa có nhánh `isError`**, và chữ empty state của nó (`NoTransactions12m`) không nêu khoảng thời gian trong khi hai widget kia đã nêu. Sửa hai widget mà bỏ cái thứ ba thì chính việc sửa lại tạo ra sự thiếu nhất quán.
2. `AlertTriangleIcon` ở cả hai widget đang dùng `text-muted-foreground` — trùng màu với icon của empty state. Phân biệt được bằng chữ nhưng liếc qua thì giống hệt. Đổi sang `text-destructive` để kênh màu cũng mang thông tin.
3. **Tiêu đề card còn viết cứng tiếng Anh ở nhiều chỗ**, không chỉ một: `index.tsx:107-109` (`Spending Breakdown` ghép với mô tả đã dịch → card nửa Anh nửa Việt), và `:121` `Active Subscriptions`, `:132` `Coming Up`, `:133` `Upcoming bills and payments`. Đưa hết qua next-intl.
4. `components/ui/progress.tsx` gắn `className` lên `Root` còn indicator thì hardcode `bg-primary`. Nên `bg-green-500` ở `upcoming-payments.tsx` **tô rãnh nền chứ không tô phần fill**: với gói cách 35 ngày, `value` clamp về 0, indicator dịch hết ra ngoài, kết quả là một viên thuốc xanh đặc kín không có fill — đọc ra thành "đã trả xong", ngược hẳn ý định. Cần một prop cho class ở tầng indicator. Đây là sửa component dùng chung nên kiểm tra mọi nơi đang dùng `Progress` trước khi đổi.

**Commit:** `refactor: remove dashboard widgets that have no data source`

---

### Task 12: Dọn mã chết

**Step 1: Xác nhận không còn mock nào trong phạm vi**

```bash
grep -rniE "mock|dummy|fake" components/dashboard/overview/
```

Expected: chỉ còn kết quả ở `asset-allocation.tsx`, `stock-table.tsx`, `chat-assistant.tsx` — 3 file đã gỡ khỏi overview, giữ lại cho phần investing.

**Step 2:** Run `pnpm test` → toàn bộ PASS
**Step 3:** Run `npx tsc --noEmit` → phải ra **đúng 11 lỗi**, toàn bộ nằm ở `app/(site)/(public)/page.tsx`, `app/(site)/(public)/stocks/page.tsx` và `components/homepage/gold-price-table.tsx`. Không được có lỗi nào trong file plan này đụng tới.

> Bản plan đầu ghi "`pnpm build` không lỗi". Tiêu chí đó **không thể đạt** trên repo này: 11 lỗi type nói trên đã tồn tại từ trước (mảng `vnstock-js`), và `next.config.mjs` không bật `typescript.ignoreBuildErrors`, nên build fail bất kể plan này làm gì. Sửa chúng nằm ngoài phạm vi. Vì vậy cổng kiểm tra là "không phát sinh lỗi mới", không phải "build sạch".
**Step 4: Commit** — `chore: clean up dashboard mock data remnants`

---

### Task 13: Gộp một mối logic tính kỳ thanh toán

**Files:**
- Modify: `app/(site)/dashboard/subscriptions/page.tsx`

Task 7 đã tạo `nextPaymentDate` tính đúng bằng phép số học. Nhưng trang quản lý vẫn giữ `calculateNextRenewal` riêng ở dòng 198, và bản đó **vẫn cộng dồn** — tức là vẫn trôi ngày với gói bắt đầu ngày 29-31.

**Vì sao việc này không hoãn được, dù nó nằm ngoài phạm vi ban đầu:** trước Task 7, cả hai bản đều sai **giống hệt nhau nên chúng khớp**. Sau Task 7, overview đúng còn trang quản lý sai — cùng một gói hiện **hai ngày trừ tiền khác nhau ở hai trang** (`2026-05-31` với `2026-05-28` cho gói bắt đầu 31/01). Mâu thuẫn này do chính việc sửa một nửa gây ra, nên nó là trách nhiệm của plan này chứ không phải nợ có sẵn.

Hai bản còn **fallback ngược nhau**: `calculateNextRenewal` cho giá trị lạ rơi về YEARLY (nhánh `else`), còn `isYearly()` cho rơi về monthly.

**Việc cần làm:** xoá `calculateNextRenewal`, cho trang quản lý dùng `nextPaymentDate` và `isYearly` từ `lib/dashboard/next-payment-date.ts`. Đồng thời trang này còn `useQuery` riêng trên đúng key `["subscriptions"]` — chuyển sang `useGetSubscriptions()` để chỉ còn một queryFn, tránh hai bản khác nhau cùng ghi vào một ô cache.

Kiểm tra kỹ: trang quản lý đọc `amount` **không** qua `convertAmountFromMiliunits` (đúng), nên hook dùng chung phải giữ nguyên hành vi đó.

**Commit:** `refactor: single source of truth for billing period math`

---

## Ghi chú môi trường

**Thí nghiệm phụ thuộc múi giờ phải chạy qua PowerShell, không qua Bash tool.** MSYS nuốt biến môi trường có dấu `/`, nên `TZ="America/New_York"` không bao giờ tới được Node và nó lặng lẽ rơi về múi hệ thống — cho ra một loạt PASS giả. Đã kiểm chứng:

```
qua Bash tool  → TZ = undefined            resolved = Asia/Saigon        offset = -420
qua PowerShell → TZ = "America/New_York"   resolved = America/New_York   offset = 300
```

Luôn in `Intl.DateTimeFormat().resolvedOptions().timeZone` và từ chối tin một lần chạy không phản hồi đúng múi giờ đã đặt.

---

## Nợ kỹ thuật phát hiện trong lúc làm — không xử lý ở plan này

| Vấn đề | Vị trí | Vì sao hoãn |
|---|---|---|
| Gộp tháng theo giờ máy người xem | `lib/dashboard/aggregate-by-month.ts` | Hiện **đúng** vì đường ghi lưu nửa đêm giờ UTC+7. Sửa thật cần timezone cố định (`date-fns-tz`) hoặc đổi cột sang `date`, tức đụng đường ghi/schema — vượt ranh giới plan |
| `.find()` làm mất dòng trùng ngày | `lib/utils.ts:65-88` + `summary.ts:143` | Mất dữ liệu thật, nhưng nằm trong `app/api/` |
| `outputFormat = "yyyyy-MM-dd"` (5 chữ y) → `"02025-02-03"`; `"HH:mm:sss"` thừa một `s` | `components/dashboard/transactions/import-card.tsx:8-9` | Bug có sẵn ở luồng import CSV, không liên quan overview |
| Tháng trống bị bỏ khỏi trục X thay vì điền 0 | `lib/dashboard/aggregate-by-month.ts` | Jan/Feb/May sẽ hiện cách đều nhau như ba tháng liên tiếp. Đáng sửa nhưng đổi hợp đồng đang có test |
| Nhãn tháng luôn tiếng Anh | `lib/dashboard/aggregate-by-month.ts` | `getLocale()` đã có sẵn; cách sạch là trả về `month` rồi để component tự dịch — cũng đổi hợp đồng đang có test |
| ~~`messages/en.json` thiếu newline cuối file~~ — **ĐÃ SỬA**. Không tìm thấy khoá `ExpensesDesc` ở cả hai locale, có thể đã đổi tên | `messages/*.json` | — |
| ~~**Biểu đồ danh mục loại bỏ giao dịch chưa phân loại**~~ — **ĐÃ SỬA**, xem "Đợt bổ sung". Đo lại trên dữ liệu thật: 34/39 dòng chi bị bỏ, tức **99,7%** số tiền chi biến mất khỏi biểu đồ (17.550.091,53 / 17.608.171,53) | `summary.ts` (`categories` vs `expensesAmount`) | ~~Nằm trong `app/api/`~~ — sau khi copy card đã ghi trung thực "kỳ đã chọn", đây là thứ gây hiểu nhầm cuối cùng còn lại trên card đó |
| ~~Nhãn bucket `"Other"` viết cứng tiếng Anh~~ — **ĐÃ SỬA** cùng "Đợt bổ sung 2": route không còn đặt tên rổ nào, `topCategories` nhận nhãn đã dịch | ~~`summary.ts:124`~~ | — |
| Không có cột `icon`/`color` cho `categories` — mọi bản đồ tên→icon viết cứng đều vỡ vì tên danh mục do người dùng tự đặt | `db/schema.ts` | Cần đổi schema và `app/api/`; để làm cùng đợt migrate Supabase |
| ~~`PALETTE` trùng `COLORS`, `--chart-1…5` không nơi nào dùng~~ — **ĐÃ SỬA** ở đợt Midday: `lib/dashboard/chart-colors.ts` là nguồn duy nhất, cả 10 biểu đồ đọc token nên đổi theo theme | ~~`spending-breakdown.tsx`, `pie-variant.tsx`, `globals.css`~~ | — |
| Cookie `currency` ghi trong `useEffect` sau khi `useGetSettings()` xong, còn `formatCurrency` đọc đồng bộ lúc render và ghi cookie không kích hoạt re-render → số tiền có thể hiện USD rồi **không bao giờ tự sửa** | `header.tsx` + `lib/utils.ts:35` | Lỗi có sẵn toàn repo (`columns.tsx`, data grid), không phải do plan này |
| `getLocale()`/`formatDateRange()` chỉ chạy được ở browser. Hiện an toàn nhờ **hai** điều kiện cùng lúc: repo không có `prefetchQuery`/`HydrationBoundary` nào, **và** TanStack bật `isFetching` trong SSR qua đường optimistic result (`useBaseQuery.js:43` không có guard `isServer`) | `transaction-list.tsx`, `spending-breakdown.tsx` | Chưa vỡ. Nhưng thêm SSR prefetch cho dashboard — bước tối ưu tự nhiên tiếp theo — là **vỡ ngay**. `date-filter.tsx:80` đã phải có cờ `mounted` đúng vì lý do này |
| `formatCurrency` sẽ **ném lỗi** với mã tiền tệ lạ: `currencyConfig[currency].locale` không có guard, mà `currency` là `text` tự do trong schema | `lib/utils.ts:41` | Hiện an toàn vì nơi ghi duy nhất dùng `z.enum(["VND","USD"])`. Nhưng đây là code đầu tiên truyền giá trị theo từng dòng vào hàm đó |
| `frequency` lạ bị **âm thầm** gắn nhãn "mỗi tháng" và tính đủ trọng số vào tổng hàng tháng | `subscription-list.tsx` | Hướng fallback thì hợp lý; vấn đề là nó im lặng, không cảnh báo gì |
| `HORIZON_DAYS` chỉ điều khiển thanh bar, **không lọc danh sách** — gói năm cách 340 ngày vẫn nằm trong mục "Sắp tới" với thanh 0% | `upcoming-payments.tsx` | Quyết định sản phẩm: lọc lại, hay nới horizon cho gói năm có nghĩa |
| Trang `app/(site)/subscriptions/page.tsx` (khác trang trong dashboard) **hỏng hoàn toàn**: mong `/api/subscriptions` trả object `{plan, status,...}` và gọi `/api/subscriptions/cancel`, `/renew` — **hai endpoint không tồn tại** trong route Hono | `app/(site)/subscriptions/page.tsx` | Hỏng sẵn từ trước, không liên quan overview. Nhưng là trang chết chứ không phải trang lỗi nhẹ |
| ~~Khối dựng khoảng thời gian lặp 3 lần~~ — **ĐÃ SỬA từ trước** ở commit `17393c7`, tách thành `lib/dashboard/filter-period.ts`; nay có 4 nơi gọi chung | ~~`date-filter.tsx`, `transaction-list.tsx`, `spending-breakdown.tsx`~~ | — |

## Thứ tự so với các đợt việc khác

| Đợt | Đụng file nào | Xung đột với plan này |
|---|---|---|
| Migrate Clerk → Supabase | `app/api/**`, `middleware.ts`, `db/drizze.ts`, trang auth | **Không** — plan này không sửa file nào trong `app/api/` |
| Redesign Material 3 | JSX và class của chính 6 component này | **Có** — cùng file, khác vùng |

Plan này chỉ đổi **luồng dữ liệu**, đợt M3 đổi **markup**. Làm plan này trước thì đợt M3 sẽ restyle component đã có dữ liệu thật, dễ đánh giá thiết kế hơn nhiều so với restyle trên số liệu bịa.

## Định nghĩa hoàn thành

- [x] **Tab Overview** của `/dashboard` không còn con số bịa nào — 6/6 widget đọc dữ liệu thật
- [x] **Toàn bộ `/dashboard` không còn con số bịa** — đạt ở đợt sau, xem "Đợt bổ sung" bên dưới
- [x] `pnpm test` xanh — 26 test / 5 file (`aggregate-by-month`, `daily-totals`, `next-payment-date`, `top-categories`, `get-settings`)
- [x] `npx tsc --noEmit` vẫn đúng 11 lỗi có sẵn, không phát sinh lỗi mới
- [ ] Mỗi khối đều có trạng thái loading và trạng thái rỗng đúng nghĩa, chữ lấy từ `messages/en.json` và `vi.json` chứ không hardcode
- [ ] Mọi số tiền hiển thị qua `formatCurrency`, không hardcode ký hiệu tiền tệ

### Đợt bổ sung: đóng nốt ô thứ hai

Làm theo đúng "Đề xuất khi làm tiếp" ở dưới, không phát sinh quyết định mới:

| Việc | Kết quả |
|---|---|
| Tab **Budget** | Gỡ. Schema không có bảng budget nào, nên không có gì thật để đặt vào và cũng không có trang để trỏ tới |
| Tab **Settings** | Gỡ. Đây là món tệ nhất: giao diện điều khiển giả, gõ vào ô rồi bấm "Save Changes" mà không có gì xảy ra |
| Tab **Accounts** / **Categories** | Thành link tới `/dashboard/accounts` và `/dashboard/categories`. Panel cũ là bản dựng lại của chính hai trang đó bằng số bịa |
| Ô KPI **"Đầu Tư"** | Gỡ khỏi `data-grid.tsx`. `value={12580000} percentageChange={10}` viết cứng, nằm ngay hàng đầu `/dashboard` — con số bịa dễ thấy nhất trên trang mà plan gốc không nhắc tới. Lưới còn 3 cột |
| `AccountsList` / `CategoriesList` / `SettingsPanel` | Xoá; không còn nơi nào tham chiếu |
| Chữ "All Transactions" viết cứng | Chuyển sang `OverviewPage.AllTransactions{,Desc}`, thêm ở cả `en.json` và `vi.json` |

Link Settings vẫn giữ vì `/dashboard/settings` là trang thật; chỉ *tab* giả bị gỡ.

Kiểm chứng: `npx tsc --noEmit` đúng 11 lỗi có sẵn, `npx vitest run` 18 pass / 1 todo, `next lint` sạch trên các file đã sửa.

Ngoài phạm vi mock data, cùng đợt còn sửa ba thứ về tốc độ và trạng thái lỗi — ghi ở đây vì chúng đụng cùng file:

- `lib/hono.ts` lấy base URL từ `window.location.origin` thay vì `NEXT_PUBLIC_APP_URL`. Env ghi `:3000` còn `next dev` chạy `:3001` (cổng 3000 bị server cũ giữ), nên mọi request rời origin, mất cookie Clerk, và react-query ngồi retry — skeleton quay mãi trông y như "tải chậm"
- `summary.ts` gộp 4 truy vấn độc lập vào một `Promise.all`. Đo được: Neon `ap-southeast-1`, 73-190ms mỗi round-trip khi nóng, 583ms khi nguội
- `DataGrid`/`DataChart` có nhánh `isError`. Trước đó request hỏng rơi thẳng vào markup thành công với `data` undefined, tức hiện số 0 chắc nịch — chính điều làm lỗi mạng trông như "bạn không có giao dịch nào"

### Đợt bổ sung 2: biểu đồ danh mục khớp lại với ô KPI

Món nợ được đánh dấu "duy nhất không nên để lâu" ở bảng trên. Đo lại trước khi sửa cho thấy nặng hơn ước tính trong plan:

```
chi (amount < 0)          : 39 dòng
  trong đó category NULL  : 34 dòng
biểu đồ hiện (innerJoin)  :         58.080
ô KPI hiện (mọi dòng)     : 17.608.171,53
bị giấu khỏi biểu đồ      : 17.550.091,53  (99,7%)
```

Không phải "tổng nhỏ hơn một chút" — biểu đồ gần như không hiển thị gì, ngay cạnh một ô KPI đếm đủ.

| Việc | Nơi |
|---|---|
| `innerJoin(categories)` → `leftJoin` | `summary.ts` |
| Bỏ gộp top-3 + `"Other"` khỏi route; route trả về **mọi** danh mục chi, dòng chưa phân loại mang `name: null` | `summary.ts` |
| Gộp top-N và đặt tên hai rổ chuyển thành hàm thuần, TDD 7 test | `lib/dashboard/top-categories.ts` |
| Gọi hàm đó trong `select` chứ không phải `queryFn` — query key không chứa locale, làm ở `queryFn` sẽ đóng băng nhãn theo ngôn ngữ lúc cache | `use-get-summary.ts` |
| Thêm khoá `OverviewPage.Other` (`Other` / `Khác`); `Uncategorized` đã có sẵn | `messages/*.json` |

Việc này cũng đóng luôn dòng nợ "nhãn `Other` viết cứng tiếng Anh" ở bảng trên: route không còn đặt tên rổ nào nữa.

Kiểm chứng chạy thẳng trên DB thật, áp `topCategories` vào kết quả `leftJoin` rồi so với tổng chi: **lệch 0**.

**Phát hiện thêm, chưa sửa:** cột thật trong DB tên là `category__id` (hai gạch dưới) — `db/schema.ts:43` ánh xạ `categoryId` sang đúng tên đó nên mọi thứ chạy, nhưng bất kỳ SQL viết tay nào cũng sẽ vấp. Đổi tên cột cần migration, để cùng đợt Supabase. Cùng chỗ đó, `transactionsRelations` khai `fields: [transactions.id]` cho **cả hai** quan hệ, đáng lẽ là `accountId` và `categoryId`; hiện vô hại vì không truy vấn nào dùng relations API.

### Vì sao ô thứ hai không tick được

> Ghi chú lịch sử: phần dưới mô tả trạng thái **trước** đợt bổ sung ở trên. Giữ nguyên vì nó giải thích vì sao các tab đó từng tồn tại.

Plan này phạm vi hoá quanh 9 widget của **tab Overview**, và không ai kiểm tra các tab còn lại cho tới tận nhóm cuối. `components/dashboard/overview/index.tsx` vẫn render bốn tab nữa, cách một cú bấm trên chính `/dashboard`:

| Tab | Thực trạng | Có trang thật không |
|---|---|---|
| **Budget** | Số bịa hoàn toàn: `$1,500 / $1,500`, `$420 / $500`, thanh tiến độ giả | **Không** — schema chưa có bảng budget nào |
| **Settings** | Ô nhập điền sẵn `John Doe` / `john.doe@example.com`, hai công tắc giả, dropdown tiền tệ chào cả GBP (mà `currencyConfig` không định nghĩa), và **nút "Save Changes" bấm vào không làm gì** | Có, `/dashboard/settings` |
| **Accounts** | `$8,245.32`, `Chase Checking`, `$4,317.68` | Có, `/dashboard/accounts` |
| **Categories** | Danh mục bịa | Có, `/dashboard/categories` |

Tab Settings đáng lưu ý riêng: nó không chỉ hiện số sai mà là **giao diện điều khiển giả** — người dùng gõ vào ô, bấm Save, và tin rằng mình vừa đổi được gì đó.

**Đề xuất khi làm tiếp:** gỡ tab Budget và Settings (cùng lý do đã gỡ tab Investments — không có gì thật để đặt vào), biến Accounts/Categories thành link tới trang thật đã tồn tại. Đó là cùng một quyết định nhánh này đã ra ba lần, không phải quyết định mới.

Ô này để trống có chủ đích. Commit `850746b` mang tiêu đề "clean up dashboard mock data remnants" — **tiêu đề đó nói quá so với thực tế**, và ghi chú này tồn tại để không ai đọc lịch sử git rồi tưởng `/dashboard` đã sạch hoàn toàn.

### Hai việc một dòng nên làm sớm

- `components/ui/progress.tsx` — cân nhắc `variant` ngữ nghĩa thay cho `bg-red-500`/`bg-orange-500`/`bg-green-500` truyền tay, để màu theo được theme
- `monthly-calendar.tsx` — ngày ngoài kỳ đang dùng `text-muted-foreground/40`. Ở dark mode độ tương phản có thể tụt dưới ngưỡng WCAG 1.4.11, khiến dấu hiệu duy nhất phân biệt "đã hỏi, không có gì" với "chưa hỏi tới" trở nên vô hình. Nếu vậy nên dùng dấu hiệu **cấu trúc** (viền đứt, gạch chéo) thay vì sắc độ — thứ sống sót qua tương phản thấp, dark mode và ảnh xám
