# Thiết kế: Migrate Clerk + Neon → Supabase

> **For Claude:** Đây là DESIGN, chưa phải plan thực thi. Trước khi code, dùng
> superpowers:writing-plans để bẻ thành plan task-by-task, rồi
> superpowers:executing-plans để chạy.

**Goal:** Bỏ Clerk (auth) và Neon (database), chuyển cả hai sang một project
Supabase duy nhất. Dữ liệu hiện tại ít nên **làm lại từ đầu, không migrate data**
— user đăng ký lại, bảng bắt đầu rỗng.

**Architecture:** Supabase Auth cấp danh tính, Supabase Postgres giữ dữ liệu, và
**RLS trong database là nơi quyết định ai đọc được hàng nào**. Tầng API Hono giữ
nguyên: chỉ ruột từng handler đổi từ Drizzle sang supabase-js. Nhờ vậy hợp đồng
`AppType` không đổi và ~30 hook TanStack Query trong `features/*/api/` không phải
sửa một dòng nào.

**Tech Stack:** Next 15.3.1, React 19, Hono RPC, `@supabase/ssr`,
`@supabase/supabase-js`, Drizzle (chỉ còn schema + migration), Vitest.

---

## Quyết định đã chốt

| Vấn đề | Chốt | Vì sao |
|---|---|---|
| Truy vấn & phân quyền | **supabase-js + RLS** | Quên một `where` không còn làm lộ dữ liệu người khác. Đổi lại phải viết lại ~30 handler. |
| Cách đăng nhập | **Google OAuth + email/password** | Google cho đường vào nhanh, email/password để không phụ thuộc hoàn toàn bên thứ ba. |
| Aggregation của `/summary` | **Postgres function + `rpc()`** | Query builder của supabase-js không diễn đạt nổi 171 dòng SQL trong `summary.ts`. |
| Chủ sở hữu của `transactions` | **Cột `user_id` thật** | Policy rẻ (`auth.uid() = user_id`) thay vì subquery join mỗi hàng. |
| Tầng API Hono | **Giữ** | Bỏ đi là mất RPC có type và phải viết lại toàn bộ feature hook — không đổi lại được gì cho việc migrate. |

---

## 1. Danh tính & schema

`auth.users` thành gốc của danh tính. Mọi cột `user_id text` hiện tại — ở
`accounts`, `categories`, `subscriptions`, `user_settings`, `user_subscriptions`
— đổi thành `uuid references auth.users(id) on delete cascade`. Vì làm lại từ
đầu nên đây là định nghĩa lại sạch sẽ, không phải backfill, và mọi policy viết
được gọn là `auth.uid() = user_id`, khỏi ép kiểu.

`transactions` là ngoại lệ: **hiện tại nó không có cột chủ sở hữu nào**, chỉ suy
ra qua `account_id → accounts.user_id`.

Thêm `user_id` vào `transactions` là chốt rồi, nhưng cái giá thông thường của
denormalize — cột lệch khỏi account của nó — thì để **database tự chặn** bằng
composite foreign key:

```sql
-- accounts.id vốn đã là PK; công khai cặp (id, user_id) để tham chiếu được
alter table accounts add constraint accounts_id_user_id_key unique (id, user_id);

-- transactions
user_id uuid not null references auth.users(id) on delete cascade,
foreign key (account_id, user_id)
  references accounts (id, user_id) on delete cascade
```

Ghi một cặp lệch nhau bị từ chối ngay lúc write, nên cột không thể trôi, và
policy là bản rẻ nhất: `using (auth.uid() = user_id)`. Drizzle diễn đạt composite
FK này trong callback extra-config của bảng.

**Drizzle vẫn giữ quyền sở hữu schema và migration.** Không phải vì quen tay:
`db/schema.ts` còn sinh ra các zod insert schema mà `zValidator` của mọi handler
đang dùng. Vậy nên `drizzle-kit` tiếp tục sinh migration bảng, còn **RLS policy
và hàm `summary()` nằm cạnh đó dưới dạng SQL viết tay** trong `drizzle/`.

---

## 2. Luồng auth

`@supabase/ssr` thay Clerk bằng session dựa trên cookie, với ba factory client:
browser, server (cho RSC và handler Hono), và một cái chạy trong middleware để
refresh token rồi ghi cookie trở lại.

`middleware.ts` giữ nguyên hình dạng và cả matcher. `clerkMiddleware()` thành
bước refresh session; `createRouteMatcher(["/dashboard(.*)", "/api(.*)"])` +
`auth.protect()` thành redirect tường minh về `/sign-in` khi không có user.

`features/settings/api/get-settings.ts` gọn lại: `auth()` thành
`supabase.auth.getUser()`, hàm này **trả `null` chứ không ném lỗi**. Nghĩa là cái
`try/catch` vừa thêm ngày 2026-09-09 (và test của nó) biến mất cùng với cả lớp bug
"404 bị trả thành 500" — không còn đường nào để một request không session làm nổ
root layout.

`<ClerkProvider>` rời hẳn `app/layout.tsx`. Session đi trong cookie, không cần
provider.

**UI phải tự viết** (đây là cái giá thật của việc rời Clerk — Supabase không có
drop-in nào tương đương, `@supabase/auth-ui-react` đã ngừng bảo trì):

| Màn hình | Thay cho |
|---|---|
| `/sign-in` — form email/password + nút Google | `<SignIn />` |
| `/sign-up` — form + thông báo xác nhận email | `<SignUp />` |
| Quên mật khẩu: màn xin link + màn đặt lại | (Clerk lo) |
| `app/auth/callback/route.ts` — đổi `?code` lấy session | (Clerk lo) |
| User menu: avatar, email, sign out | `<UserButton />` ở `components/dashboard/header.tsx` và `app/(site)/dashboard/sidebar.tsx` |
| Hook `useUser` trên `onAuthStateChange` | `useUser()` của Clerk ở `components/dashboard/welcome-message.tsx` |

---

## 3. Tầng dữ liệu

Mỗi handler Hono dựng **client Supabase riêng cho từng request** từ cookie của
request đó, mang JWT của chính user đó. **Service-role key không xuất hiện trong
code handler** — đó chính là thứ làm cho RLS có tác dụng thật chứ không phải trang
trí.

```ts
// trước
const auth = getAuth(c);
if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
const data = await db.select().from(accounts)
  .where(eq(accounts.userId, auth.userId));

// sau
const supabase = getSupabase(c);
const { data: { user } } = await supabase.auth.getUser();
if (!user) return c.json({ error: "Unauthorized" }, 401);
const { data } = await supabase.from("accounts").select("*");
```

Chú ý `where` biến mất. **Bỏ hẳn filter `user_id` tường minh** thay vì để song
song với RLS: đã chọn database làm nơi quyết định thì hai nơi quyết định có thể
âm thầm bất đồng với nhau. Còn check 401 thì giữ, vì request không đăng nhập nên
hỏng to tiếng chứ không phải lặng lẽ trả về không hàng nào.

`zValidator` và các zod insert schema từ drizzle-zod không đổi.
`supabase gen types typescript` sinh type `Database`, trả lại kiểu end-to-end mà
Drizzle từng cho ở đường đọc.

`summary()` thành hàm SQL `security invoker`, trả đúng shape client đang chờ, nên
`features/summary/api/use-get-summary.ts` cũng không phải đụng.

Hai thứ dọn được luôn: `db/drizze.ts` xoá sau khi 8 file import nó chuyển xong, và
`lib/subscription.ts` hoá ra **không có ai gọi** — code chết, xoá chứ không port.

---

## 4. Trình tự & kiểm chứng

Ràng buộc thứ tự: policy RLS cần `auth.uid()`, nên auth phải xong trước thì policy
mới có nghĩa. Nhưng có một đòn bẩy làm việc này dễ chịu: **`user_id` hiện là
`text`, mà uuid là một giá trị text hợp lệ.** Nhờ vậy auth migrate được mà không
đụng schema.

| # | Bước | Kiểm chứng |
|---|---|---|
| 1 | Supabase Auth, vẫn chạy trên Neon. Clerk ra hoàn toàn: middleware, layout, 5 màn hình, callback, `useUser`. Handler vẫn Drizzle nhưng đọc `user.id` thay cho `auth.userId`. | Đăng ký bằng email, đăng nhập Google, dashboard và CRUD chạy trên dữ liệu cũ. |
| 2 | Trỏ sang Supabase Postgres: đổi `DATABASE_URL` và driver (`neon-http` → `postgres-js`), chạy lại migration. | Lặp lại đúng lượt kiểm tra tay ở trên, giờ trên bảng rỗng. |
| 3 | Siết schema: `user_id` thành uuid tham chiếu `auth.users`; `transactions` có `user_id` và composite FK. | Migration apply được, CRUD vẫn chạy. |
| 4 | Bật RLS + policy. Drizzle nối bằng role owner nên bypass RLS, không gãy gì trong lúc policy hạ cánh. | **Test SQL:** set `request.jwt.claims` thành user A, xác nhận hàng của user B vô hình. |
| 5 | Chuyển handler sang supabase-js, **mỗi lần một file route** (6 file, 6 bước ship độc lập), bỏ filter `user_id` theo từng file. | Bấm tay qua UI sau mỗi file. |
| 6 | `summary()` thành rpc; xoá `db/drizze.ts` và `lib/subscription.ts`. | Dashboard overview hiện đúng số như trước. |

**Về test:** suite Vitest hiện tại phủ các pure function trong `lib/dashboard/` và
**không bước nào ở trên đụng tới chúng**. Thứ đáng tự động hoá là bài kiểm tra
cross-read của RLS: policy hỏng thì **hỏng lặng lẽ** — trả về ít hàng hơn chứ
không báo lỗi — đúng kiểu thất bại mà test sinh ra để bắt.

---

## Phạm vi ảnh hưởng

**17 file chạm Clerk:**

| Nhóm | File |
|---|---|
| Route API (~30 lần gọi `getAuth`) | `app/api/[[...route]]/` — `transactions.ts`, `categories.ts`, `accounts.ts`, `subscriptions.ts`, `settings.ts`, `summary.ts` |
| Auth & layout | `middleware.ts`, `app/layout.tsx`, `app/(site)/(auth)/sign-in/…`, `app/(site)/(auth)/sign-up/…` |
| UI | `components/dashboard/header.tsx`, `app/(site)/dashboard/sidebar.tsx`, `components/dashboard/welcome-message.tsx`, `components/dashboard/app-sidebar.tsx`, `components/v1/navigation.tsx`, `app/(site)/(public)/navigation.tsx` |
| Khác | `features/settings/api/get-settings.ts` |

**8 file import `db/drizze`:** 6 file route + `lib/subscription.ts` (chết) +
`features/settings/api/get-settings.ts`.

## Không làm (YAGNI)

- **Không migrate dữ liệu cũ.** Đã chốt: bắt đầu lại từ rỗng.
- **Không bỏ tầng Hono** để gọi Supabase thẳng từ browser. RLS cho phép làm vậy,
  nhưng sẽ mất RPC có type và phải viết lại toàn bộ feature hook.
- **Không đụng `lib/dashboard/`.** Pure function, không liên quan.
- **Không sửa typo cột `category__id`** trong `transactions` — có sẵn từ trước,
  sửa chung đợt này chỉ làm to diff.
