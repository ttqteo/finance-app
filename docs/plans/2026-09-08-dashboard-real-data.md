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
3. `index.tsx:107-109` ghép `<CardTitle>Spending Breakdown</CardTitle>` tiếng Anh viết cứng với phần mô tả đã dịch — bản vi thành card nửa Anh nửa Việt. Đưa nốt tiêu đề qua next-intl.

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

## Nợ kỹ thuật phát hiện trong lúc làm — không xử lý ở plan này

| Vấn đề | Vị trí | Vì sao hoãn |
|---|---|---|
| Gộp tháng theo giờ máy người xem | `lib/dashboard/aggregate-by-month.ts` | Hiện **đúng** vì đường ghi lưu nửa đêm giờ UTC+7. Sửa thật cần timezone cố định (`date-fns-tz`) hoặc đổi cột sang `date`, tức đụng đường ghi/schema — vượt ranh giới plan |
| `.find()` làm mất dòng trùng ngày | `lib/utils.ts:65-88` + `summary.ts:143` | Mất dữ liệu thật, nhưng nằm trong `app/api/` |
| `outputFormat = "yyyyy-MM-dd"` (5 chữ y) → `"02025-02-03"`; `"HH:mm:sss"` thừa một `s` | `components/dashboard/transactions/import-card.tsx:8-9` | Bug có sẵn ở luồng import CSV, không liên quan overview |
| Tháng trống bị bỏ khỏi trục X thay vì điền 0 | `lib/dashboard/aggregate-by-month.ts` | Jan/Feb/May sẽ hiện cách đều nhau như ba tháng liên tiếp. Đáng sửa nhưng đổi hợp đồng đang có test |
| Nhãn tháng luôn tiếng Anh | `lib/dashboard/aggregate-by-month.ts` | `getLocale()` đã có sẵn; cách sạch là trả về `month` rồi để component tự dịch — cũng đổi hợp đồng đang có test |
| `messages/en.json` thiếu newline cuối file; `ExpensesDesc` có double space ở cả hai locale | `messages/*.json` | Công cụ nào format lại sẽ tạo diff nhiễu |
| **Biểu đồ danh mục loại bỏ giao dịch chưa phân loại, còn ô KPI phía trên thì tính** — `innerJoin` với bảng `categories` bỏ qua 63/68 dòng, nên tổng các cột nhỏ hơn hẳn số Expenses ngay bên trên cùng trang | `summary.ts` (`categories` vs `expensesAmount`) | Nằm trong `app/api/`. **Đây là món nợ duy nhất không nên để lâu** — sau khi copy card đã ghi trung thực "kỳ đã chọn", đây là thứ gây hiểu nhầm cuối cùng còn lại trên card đó |
| Nhãn bucket `"Other"` viết cứng tiếng Anh, hiện nguyên tiếng Anh trong bản vi | `summary.ts:124` | Nằm trong `app/api/`; map ở component sẽ phải bám vào magic string |
| Không có cột `icon`/`color` cho `categories` — mọi bản đồ tên→icon viết cứng đều vỡ vì tên danh mục do người dùng tự đặt | `db/schema.ts` | Cần đổi schema và `app/api/`; để làm cùng đợt migrate Supabase |
| `PALETTE` trùng ý đồ với `COLORS` trong `pie-variant.tsx`, và bộ token `--chart-1…5` trong `globals.css` **không nơi nào dùng** | `spending-breakdown.tsx`, `pie-variant.tsx:12`, `globals.css:33-37` | Gom một lượt ở đợt Material 3, vì đợt đó vốn đã sửa markup mấy file này. Lưu ý: hex cố định không đổi theo theme, `--chart-N` thì có |
| Cookie `currency` ghi trong `useEffect` sau khi `useGetSettings()` xong, còn `formatCurrency` đọc đồng bộ lúc render và ghi cookie không kích hoạt re-render → số tiền có thể hiện USD rồi **không bao giờ tự sửa** | `header.tsx` + `lib/utils.ts:35` | Lỗi có sẵn toàn repo (`columns.tsx`, data grid), không phải do plan này |
| `getLocale()`/`formatDateRange()` chỉ chạy được ở browser. Hiện an toàn nhờ **hai** điều kiện cùng lúc: repo không có `prefetchQuery`/`HydrationBoundary` nào, **và** TanStack bật `isFetching` trong SSR qua đường optimistic result (`useBaseQuery.js:43` không có guard `isServer`) | `transaction-list.tsx`, `spending-breakdown.tsx` | Chưa vỡ. Nhưng thêm SSR prefetch cho dashboard — bước tối ưu tự nhiên tiếp theo — là **vỡ ngay**. `date-filter.tsx:80` đã phải có cờ `mounted` đúng vì lý do này |
| Khối dựng khoảng thời gian bị lặp 3 lần và cả 3 cùng sai giống nhau: `new Date("2025-05-13")` parse thành nửa đêm UTC nên người ở phía tây UTC thấy lùi một ngày | `date-filter.tsx:39-44`, `transaction-list.tsx:47-52`, `spending-breakdown.tsx:55-60` | Sai giống hệt nhau nên chip và chữ vẫn khớp. **Đừng sửa lẻ một bản** — tách helper rồi sửa cả ba cùng lúc |

## Thứ tự so với các đợt việc khác

| Đợt | Đụng file nào | Xung đột với plan này |
|---|---|---|
| Migrate Clerk → Supabase | `app/api/**`, `middleware.ts`, `db/drizze.ts`, trang auth | **Không** — plan này không sửa file nào trong `app/api/` |
| Redesign Material 3 | JSX và class của chính 6 component này | **Có** — cùng file, khác vùng |

Plan này chỉ đổi **luồng dữ liệu**, đợt M3 đổi **markup**. Làm plan này trước thì đợt M3 sẽ restyle component đã có dữ liệu thật, dễ đánh giá thiết kế hơn nhiều so với restyle trên số liệu bịa.

## Định nghĩa hoàn thành

- [ ] `/dashboard` không còn con số bịa nào
- [ ] `pnpm test` xanh, tối thiểu 9 test cho 2 pure function
- [ ] `npx tsc --noEmit` vẫn đúng 11 lỗi có sẵn, không phát sinh lỗi mới
- [ ] Mỗi khối đều có trạng thái loading và trạng thái rỗng đúng nghĩa, chữ lấy từ `messages/en.json` và `vi.json` chứ không hardcode
- [ ] Mọi số tiền hiển thị qua `formatCurrency`, không hardcode ký hiệu tiền tệ
