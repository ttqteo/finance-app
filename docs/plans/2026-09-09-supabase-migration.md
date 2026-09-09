# Supabase Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Thay Clerk (auth) và Neon (database) bằng một project Supabase duy nhất, với RLS trong database là nơi quyết định ai đọc được hàng nào.

**Architecture:** Giữ nguyên tầng API Hono — chỉ ruột từng handler đổi từ Drizzle sang supabase-js, nên hợp đồng `AppType` không đổi và ~30 hook TanStack Query trong `features/*/api/` không phải sửa. Drizzle rút về vai trò schema + migration (vẫn sinh zod schema cho `zValidator`). Auth migrate trước schema, nhờ `user_id` đang là `text` mà uuid là giá trị text hợp lệ.

**Tech Stack:** Next 15.3.1, React 19, Hono RPC, `@supabase/ssr`, `@supabase/supabase-js`, Drizzle (schema/migration), Vitest.

**Design gốc:** `docs/plans/2026-09-09-supabase-migration-design.md`

---

## ⚠️ Sửa lại design: `runtime = "edge"`

`app/api/[[...route]]/route.ts` khai báo `export const runtime = "edge"`. Design nói bước 2 đổi driver `neon-http` → `postgres-js`, **nhưng làm vậy sẽ gãy**: `neon-http` chạy trên fetch nên edge dùng được, còn `postgres-js` nói TCP nên không.

**Xử lý:** Task 10 đổi luôn `runtime` thành `"nodejs"`. Một dòng, đảo lại được. Sau khi mọi handler dùng supabase-js (fetch-based, chạy được cả hai) thì muốn trả về `"edge"` cũng được — nhưng chỉ khi `db/drizze.ts` đã xoá hẳn.

**Không ảnh hưởng migration của drizzle-kit:** nó chạy từ Node qua `drizzle.config.ts`, không dính runtime của route.

---

## Quy ước chung

**TDD ở đâu áp dụng được:** suite Vitest hiện tại là `environment: "node"`, chỉ phủ pure function trong `lib/dashboard/`. Không có jsdom, không có testing-library. Migration này phần lớn là UI + tích hợp, nên:

- **Có test tự động:** policy RLS (Task 13) — đây là thứ *phải* có, vì policy hỏng thì hỏng lặng lẽ, trả ít hàng hơn chứ không báo lỗi.
- **Kiểm tra tay:** màn hình auth và các handler. Mỗi task ghi rõ bấm gì, thấy gì.
- **KHÔNG thêm jsdom + testing-library** chỉ để phục vụ đợt này. YAGNI — đó là một quyết định riêng, không phải phần của migration.

**Commit sau mỗi task.** Mỗi task để lại app chạy được.

**Trước khi bắt đầu:** cây làm việc lúc viết plan này đang có 8 file sửa dở chưa commit (`lib/hono.ts`, `app/api/[[...route]]/summary.ts`, 3 file `components/dashboard/*`, `app/(site)/(public)/navigation.tsx`, `messages/en.json`, `messages/vi.json`) do một phiên khác đang sửa song song. **Dọn sạch chỗ đó trước** rồi mới chạy plan này, không thì diff sẽ trộn vào nhau.

---

## Task 0: Chuẩn bị Supabase (làm tay)

**Không có code.** Người dùng tự làm trên dashboard Supabase:

1. Tạo project mới, ghi lại Project URL và **publishable key** (`sb_publishable_...`, kiểu key mới — không phải `anon` JWT `eyJ...` đời cũ).
2. Authentication → Providers → bật **Email** (có confirm email) và **Google**.
   - Google cần OAuth client ở Google Cloud Console; callback URL dán vào là cái Supabase hiện sẵn trong ô provider.
3. Authentication → URL Configuration → Site URL đặt `http://localhost:3000`, thêm redirect URL `http://localhost:3000/auth/callback`.
4. Settings → Database → copy connection string (dùng **Session pooler**, không phải Transaction pooler — drizzle-kit cần prepared statement).

**Trạng thái đã kiểm chứng (2026-09-09 16:20):**

| Mục | Trạng thái |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ có trong `.env`, `/auth/v1/health` trả 200 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ `sb_publishable_...`, PostgREST nhận (404 "table not found" = qua được auth) |
| Provider Email | ✅ bật, `mailer_autoconfirm: false` → có confirm email, đúng như Task 5 giả định |
| Provider Google | ✅ bật rồi — `"google": true` (kiểm lúc 16:45) |
| `DATABASE_URL` | ❌ vẫn trỏ Neon (đúng — Task 11 mới đổi) |

Kiểm lại bất cứ lúc nào:

```bash
curl -s "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/settings" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | grep -o '"google":[a-z]*'
```

**Bên Google Cloud Console chỉ cần ĐÚNG MỘT redirect URI:**
`https://<ref>.supabase.co/auth/v1/callback`.

Luồng là browser → Google → **Supabase** → app, nên Google không bao giờ redirect
thẳng về app. Thêm `http://localhost:<port>/auth/v1/callback` vào đó là thừa và
sai đường dẫn (`/auth/v1/**` là hình dạng URL của Supabase, còn app phục vụ
`/auth/callback`). Authorized JavaScript origins để trống được — nó chỉ dùng cho
Google Identity/One Tap chạy trong browser.

**Chỗ khai báo localhost là Supabase**, không phải Google: Authentication → URL
Configuration → Redirect URLs. Khai **cả hai cổng**, vì `next dev` hay rơi về
3001 khi 3000 còn bị giữ:

```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
```

Code không phụ thuộc cổng: Task 3 lấy `origin` từ request, Task 4 lấy
`window.location.origin` — không đọc `NEXT_PUBLIC_APP_URL`.

**Thêm vào `.env`:**

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

`DATABASE_URL` **chưa đổi** — Task 10 mới đổi.

**Cài package:**

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

**Commit:** `chore(supabase): add supabase client packages and env keys`
(`.env` đã gitignore; nhớ cập nhật `.env.example`.)

---

# Phase 1 — Auth: Clerk ra, Supabase vào (vẫn chạy trên Neon)

Cả phase này **không đụng schema**. `user_id` vẫn là `text`, và `user.id` của Supabase là uuid — một chuỗi text hợp lệ. Nghĩa là cuối phase app vẫn chạy trên dữ liệu Neon cũ, chỉ khác cách đăng nhập.

## Task 1: Ba factory client Supabase

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`

**Step 1: Client cho browser**

```ts
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
```

**Step 2: Client cho server (RSC, route handler)**

```ts
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          // Server Component không ghi được cookie. Bỏ qua là đúng: middleware
          // (Task 2) mới là chỗ refresh token và ghi cookie trở lại.
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
};
```

**Step 3: Helper refresh session cho middleware**

```ts
// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Phải gọi getUser() chứ không phải getSession(): getUser() xác thực token
  // với server Supabase, getSession() chỉ đọc cookie nên tin được cả token giả.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
};
```

**Step 4: Kiểm tra**

Run: `npx tsc --noEmit`
Expected: không lỗi ở ba file mới.

**Step 5: Commit** — `feat(supabase): add browser, server and middleware client factories`

---

## Task 2: Viết lại `middleware.ts`

**Files:** Modify `middleware.ts`

**Step 1: Thay toàn bộ**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED = [/^\/dashboard(\/.*)?$/, /^\/api(\/.*)?$/];

export default async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((re) => re.test(path));

  if (isProtected && !user) {
    // API trả 401 để react-query hiện lỗi, thay vì nuốt một trang HTML redirect.
    if (path.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(url);
  }

  return response;
}

// Giữ nguyên matcher cũ của Clerk: nó loại trừ các đường dẫn hình dạng tài
// nguyên tĩnh để middleware khỏi chạy trên mọi file trong public/.
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

**Step 2: Kiểm tra tay**

Run: `pnpm dev`, mở `http://localhost:3000/dashboard` khi chưa đăng nhập.
Expected: redirect về `/sign-in`. Trang sẽ chưa render được (Task 4 mới viết), 404/lỗi ở bước này là bình thường.

**Step 3: Commit** — `feat(auth): replace clerkMiddleware with supabase session refresh`

---

## Task 3: Route callback cho OAuth

**Files:** Create `app/auth/callback/route.ts`

```ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
};
```

**Kiểm tra:** chưa test được cho tới Task 4. Chỉ cần `npx tsc --noEmit` sạch.

**Commit** — `feat(auth): add oauth callback route`

---

## Task 4: Màn hình sign-in

**Files:**
- Modify: `app/(site)/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Create: `features/auth/components/sign-in-form.tsx`

Giữ nguyên layout/khung trang hiện có (ảnh, logo…), chỉ thay chỗ `<ClerkLoaded><SignIn /></ClerkLoaded>` bằng `<SignInForm />`.

**Form cần:** input email, input password, nút submit, nút "Continue with Google", link sang `/sign-up` và `/forgot-password`, chỗ hiện lỗi.

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const SignInForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect_url") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    setPending(false);
    if (error) return setError(error.message);
    router.push(redirectTo);
    router.refresh(); // để RSC đọc lại session mới
  };

  const onGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  };

  // ... JSX: dùng <Input>, <Button> sẵn có trong components/ui/
};
```

**Kiểm tra tay:**
1. Tạo user thử trên Supabase dashboard → đăng nhập bằng email/password → vào được `/dashboard`.
2. Bấm Continue with Google → qua Google → về `/dashboard`.
3. Sai mật khẩu → hiện lỗi, không redirect.

**Commit** — `feat(auth): add supabase sign-in screen`

---

## Task 5: Màn hình sign-up

**Files:**
- Modify: `app/(site)/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Create: `features/auth/components/sign-up-form.tsx`

Giống Task 4 nhưng gọi `supabase.auth.signUp({ email, password, options: { emailRedirectTo: ${origin}/auth/callback } })`, và sau khi thành công **hiện thông báo "kiểm tra email để xác nhận"** thay vì redirect — vì đã bật confirm email ở Task 0.

Nút Google dùng lại đúng hàm `onGoogle` (tách ra `features/auth/components/google-button.tsx` để khỏi lặp — DRY).

**Kiểm tra tay:** đăng ký email mới → nhận mail → bấm link → về `/dashboard` đã đăng nhập.

**Commit** — `feat(auth): add supabase sign-up screen`

---

## Task 6: Quên mật khẩu (2 màn)

**Files:**
- Create: `app/(site)/(auth)/forgot-password/page.tsx` — form nhập email, gọi `resetPasswordForEmail(email, { redirectTo: ${origin}/auth/callback?next=/reset-password })`
- Create: `app/(site)/(auth)/reset-password/page.tsx` — form nhập mật khẩu mới, gọi `supabase.auth.updateUser({ password })`

**Kiểm tra tay:** xin link → nhận mail → đặt mật khẩu mới → đăng nhập lại bằng mật khẩu mới.

**Commit** — `feat(auth): add password reset screens`

---

## Task 7: Hook `useUser` và user menu

**Files:**
- Create: `features/auth/hooks/use-user.ts`
- Create: `features/auth/components/user-menu.tsx`
- Modify: `components/dashboard/header.tsx`, `app/(site)/dashboard/sidebar.tsx`, `components/dashboard/welcome-message.tsx`, `components/dashboard/app-sidebar.tsx`, `components/v1/navigation.tsx`, `app/(site)/(public)/navigation.tsx`

```ts
// features/auth/hooks/use-user.ts
"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoaded(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, isLoaded };
};
```

`user-menu.tsx` thay `<UserButton />`: avatar (`user.user_metadata.avatar_url`), email, nút Sign out gọi `supabase.auth.signOut()` rồi `router.push("/")` + `router.refresh()`.

`welcome-message.tsx` đang đọc `user.firstName` của Clerk → đổi sang `user.user_metadata.full_name ?? user.email`.

Các cặp `<ClerkLoading>` / `<ClerkLoaded>` thay bằng `isLoaded` từ hook.

**Kiểm tra tay:** header và sidebar hiện avatar + email; Sign out đưa về trang chủ và `/dashboard` lại chặn.

**Commit** — `feat(auth): replace clerk user components with supabase equivalents`

---

## Task 8: Helper Supabase cho handler Hono

**Files:** Create `lib/supabase/hono.ts`

```ts
import { createServerClient } from "@supabase/ssr";
import { parse } from "cookie";
import type { Context } from "hono";

/**
 * Client Supabase dựng riêng cho từng request, mang JWT của chính user gửi
 * request đó — đây là thứ làm RLS có tác dụng thật.
 *
 * `setAll` để trống là cố ý: middleware đã lo refresh token và ghi cookie
 * trước khi request tới được handler, nên ở đây chỉ cần đọc.
 */
export const getSupabase = (c: Context) => {
  const cookies = parse(c.req.header("cookie") ?? "");

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () =>
          Object.entries(cookies).map(([name, value]) => ({
            name,
            value: value ?? "",
          })),
        setAll: () => {},
      },
    }
  );
};

/** Trả user hoặc null. Không ném lỗi — handler tự quyết định 401. */
export const getUser = async (c: Context) => {
  const {
    data: { user },
  } = await getSupabase(c).auth.getUser();
  return user;
};
```

**Commit** — `feat(api): add per-request supabase client for hono handlers`

---

## Task 9: Đổi `getAuth` → `getUser` trong 6 file route

**Files:** `app/api/[[...route]]/{accounts,categories,transactions,subscriptions,settings,summary}.ts`

Task này **chỉ đổi nguồn danh tính**, chưa đụng Drizzle. Mỗi handler:

```ts
// bỏ
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
// ...
.get("/", clerkMiddleware(), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ error: "Unauthorized!" }, 401);
  // ... dùng auth.userId

// thành
import { getUser } from "@/lib/supabase/hono";
// ...
.get("/", async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized!" }, 401);
  // ... dùng user.id
```

`clerkMiddleware()` gỡ khỏi mọi route — không còn middleware Hono nào thay thế, vì `getUser(c)` tự dựng client từ cookie.

**Kiểm tra tay:** đăng nhập, vào `/dashboard` — mọi widget load được. Dữ liệu sẽ **rỗng**, vì `user.id` uuid mới không khớp `user_id` Clerk cũ trong Neon. Đó là đúng: tạo vài account/transaction mới để xác nhận CRUD chạy.

**Commit** — `refactor(api): read identity from supabase instead of clerk`

---

## Task 10: Gỡ Clerk khỏi layout và package

**Files:** Modify `app/layout.tsx`, `features/settings/api/get-settings.ts`, `package.json`

**Step 1:** Bỏ `<ClerkProvider>` khỏi `app/layout.tsx` (giữ nguyên phần còn lại của cây provider).

**Step 2:** `get-settings.ts` — bỏ luôn `getUserIdOrNull` và cái `try/catch` thêm hôm nay:

```ts
import { db } from "@/db/drizze";
import { userSettings } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

export const getUserSettings = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [data] = user
    ? await db.select().from(userSettings).where(eq(userSettings.userId, user.id))
    : [];
  return data;
};
```

**Step 3:** Xoá `features/settings/api/__tests__/get-settings.test.ts`.

Test đó tồn tại vì `auth()` của Clerk **ném lỗi** khi middleware không chạy, biến 404 thành 500. `supabase.auth.getUser()` trả `null` thay vì ném, nên cả lớp bug đó biến mất — test không còn gì để bảo vệ.

**Step 4:** Kiểm chứng lớp bug đã hết:

```bash
pnpm dev
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/favicon.png
```
Expected: `404` (không phải `500`).

**Step 5:** `pnpm remove @clerk/nextjs @clerk/backend @hono/clerk-auth`

**Step 6:** Run `npx vitest run` → 3 file, 14 test pass (suite `lib/dashboard/` không đổi).

**Step 7: Commit** — `refactor(auth): remove clerk entirely`

---

# Phase 2 — Chuyển database sang Supabase

## Task 11: Đổi driver và `DATABASE_URL`

**Files:** Modify `db/drizze.ts`, `app/api/[[...route]]/route.ts`, `.env`, `.env.example`, `package.json`

**Step 1:** `pnpm add postgres && pnpm remove @neondatabase/serverless`

**Step 2:**

```ts
// db/drizze.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(sql);
```

**Step 3:** `app/api/[[...route]]/route.ts` — đổi `export const runtime = "edge"` thành `"nodejs"`.

**Bắt buộc:** `postgres-js` nói TCP nên không chạy được trên edge. Xem phần đầu plan. Có thể trả về `"edge"` ở Task 18 sau khi `db/drizze.ts` bị xoá hẳn.

**Step 4:** `.env` — `DATABASE_URL` trỏ sang connection string Supabase (Task 0).

**Step 5:** `pnpm db:migrate`
Expected: migration chạy sạch, các bảng xuất hiện trong Supabase Table Editor.

**Step 6: Kiểm tra tay** — đăng nhập, tạo account + transaction, reload. Bảng bắt đầu rỗng (đã chốt: không migrate dữ liệu cũ).

**Step 7: Commit** — `feat(db): point drizzle at supabase postgres`

---

# Phase 3 — Siết schema

## Task 12: `user_id` thành uuid, `transactions` có chủ

**Files:** Modify `db/schema.ts`; Create migration mới

**Step 1:** Trong `db/schema.ts`, mọi `text("user_id")` thành:

```ts
userId: uuid("user_id").notNull(),
```

(import `uuid` từ `drizzle-orm/pg-core`.) Drizzle không mô tả được `references auth.users` vì schema `auth` nằm ngoài tầm nó — phần đó viết tay ở Step 3.

**Step 2:** `transactions` thêm `userId` và composite FK:

```ts
export const transactions = pgTable(
  "transactions",
  {
    // ... các cột cũ
    userId: uuid("user_id").notNull(),
  },
  (t) => ({
    accountOwner: foreignKey({
      columns: [t.accountId, t.userId],
      foreignColumns: [accounts.id, accounts.userId],
    }).onDelete("cascade"),
  })
);
```

và `accounts` thêm `unique("accounts_id_user_id_key").on(t.id, t.userId)` để cặp đó tham chiếu được.

**Step 3:** `pnpm db:generate`, rồi **sửa tay file SQL vừa sinh** để thêm FK sang `auth.users` cho từng bảng:

```sql
alter table accounts add constraint accounts_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
-- lặp cho categories, subscriptions, user_settings, user_subscriptions, transactions
```

**Step 4:** `pnpm db:migrate`
Expected: apply sạch. Nếu còn hàng cũ với `user_id` không phải uuid thì cast sẽ lỗi — xoá sạch bảng rồi chạy lại (đã chốt bắt đầu từ rỗng).

**Step 5: Kiểm tra tay** — tạo transaction mới. Handler `transactions.ts` giờ **phải set `userId`** khi insert, nếu không sẽ vi phạm `not null`. Sửa luôn ở task này.

**Step 6: Kiểm chứng composite FK làm đúng việc** — chạy trong SQL editor:

```sql
-- phải THẤT BẠI: transaction gán cho account của người khác
insert into transactions (id, amount, payee, date, account_id, user_id)
values ('t_test', 100, 'x', now(), '<account của user A>', '<uuid user B>');
```
Expected: lỗi vi phạm foreign key.

**Step 7: Commit** — `feat(db): make user_id a uuid and give transactions an owner`

---

# Phase 4 — RLS

## Task 13: Bật RLS và viết policy

**Files:** Create `drizzle/<n>_rls.sql`

Drizzle vẫn nối bằng role owner nên **bypass RLS** — nghĩa là task này không làm gãy gì trong lúc policy hạ cánh. Policy chỉ có tác dụng thật từ Task 14 trở đi, khi handler dùng supabase-js với JWT của user.

```sql
alter table accounts           enable row level security;
alter table categories         enable row level security;
alter table transactions       enable row level security;
alter table subscriptions      enable row level security;
alter table user_settings      enable row level security;
alter table user_subscriptions enable row level security;

create policy "own rows" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- lặp y hệt cho 5 bảng còn lại
```

**Chú ý `with check`:** thiếu nó thì user vẫn *ghi* được hàng gắn `user_id` của người khác. `using` chỉ lọc lúc đọc.

**Chú ý `user_settings`:** handler `settings.ts` GET tự insert hàng nếu chưa có, nên policy INSERT là bắt buộc — `for all` ở trên đã phủ.

**Commit** — `feat(db): enable rls with per-user policies`

---

## Task 14: Test cross-read của RLS

**Files:** Create `db/__tests__/rls.test.ts`

Đây là **test tự động duy nhất** của cả đợt migrate, và nó xứng đáng: policy hỏng thì trả về ít hàng hơn chứ không báo lỗi — hỏng lặng lẽ, đúng loại thất bại mà test sinh ra để bắt.

**Step 1: Viết test**

```ts
import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Test này cần một Supabase thật. Bỏ qua khi thiếu env, để `pnpm test` trên
// máy chưa cấu hình vẫn xanh.
const maybe = url && key ? describe : describe.skip;

maybe("RLS", () => {
  let a: ReturnType<typeof createClient>;
  let b: ReturnType<typeof createClient>;
  let accountIdOfA: string;

  beforeAll(async () => {
    // đăng nhập hai user test đã tạo sẵn, tạo 1 account cho A
  });

  it("user B không đọc được account của user A", async () => {
    const { data } = await b.from("accounts").select("*");
    expect(data?.map((r) => r.id)).not.toContain(accountIdOfA);
  });

  it("user B không ghi được hàng gắn user_id của A", async () => {
    const { error } = await b
      .from("accounts")
      .insert({ id: "x", name: "x", user_id: "<uuid của A>" });
    expect(error).not.toBeNull();
  });
});
```

**Step 2:** Chạy `npx vitest run db/__tests__/rls.test.ts` — **phải fail hoặc skip** trước khi Task 15 đổi handler, tuỳ có env hay không.

**Step 3: Commit** — `test(db): cover rls cross-read and cross-write`

---

# Phase 5 — Handler chuyển sang supabase-js

Sáu file, **mỗi file một task, ship độc lập**. Với mỗi file:

1. Bỏ `import { db }` và các import Drizzle (`eq`, `and`, bảng…).
2. `const supabase = getSupabase(c)` (helper Task 8).
3. `db.select().from(X).where(eq(X.userId, user.id))` → `supabase.from("x").select("*")`.
4. **Bỏ filter `user_id` tường minh.** Đã chọn database làm nơi quyết định; hai nơi quyết định thì có thể âm thầm bất đồng.
5. Giữ nguyên check 401 — request không đăng nhập phải hỏng to tiếng, không phải lặng lẽ trả 0 hàng.
6. Giữ nguyên `zValidator` và zod schema từ drizzle-zod.
7. **Không đổi shape JSON trả về** — đó là điều giữ cho `AppType` và ~30 hook không phải sửa.

| Task | File | Kiểm tra tay |
|---|---|---|
| 15 | `settings.ts` | Đổi ngôn ngữ trong Settings, reload, ngôn ngữ giữ nguyên |
| 16 | `accounts.ts` | Tạo / sửa / xoá / bulk-delete account |
| 17 | `categories.ts` | Như trên với category |
| 18 | `transactions.ts` | Tạo transaction, import CSV, bulk delete |
| 19 | `subscriptions.ts` | Tạo / sửa subscription, xem trang subscriptions |

Sau **mỗi** task: `npx vitest run db/__tests__/rls.test.ts` phải xanh.

**Commit mỗi task** — `refactor(api): move <route> to supabase-js under rls`

---

## Task 20: `summary()` thành Postgres function

**Files:** Create `drizzle/<n>_summary_fn.sql`; Modify `app/api/[[...route]]/summary.ts`

`summary.ts` là 171 dòng SQL thật — `sum`, group, so sánh với kỳ trước — mà query builder của supabase-js không diễn đạt nổi. Chuyển hẳn xuống SQL.

**Step 1:** Viết `create function summary(p_from date, p_to date, p_account text) returns json language sql security invoker as $$ ... $$;`

`security invoker` là bắt buộc: hàm chạy với quyền người gọi nên RLS vẫn áp dụng. Dùng `security definer` là mở toang cửa hậu qua policy.

**Step 2:** Handler còn lại một lời gọi:

```ts
const { data } = await supabase.rpc("summary", {
  p_from: from, p_to: to, p_account: accountId ?? null,
});
return c.json({ data });
```

**Step 3: Kiểm tra tay** — dashboard overview hiện **đúng những con số như trước khi đổi**. So bằng mắt với ảnh chụp trước đó; đây là task dễ sai số nhất trong plan.

**Step 4:** `features/summary/api/use-get-summary.ts` **không đổi**. Nếu phải đổi thì shape đã lệch — quay lại Step 1.

**Commit** — `refactor(api): move summary aggregation into a postgres function`

---

# Phase 6 — Dọn

## Task 21: Xoá phần Drizzle runtime

**Files:** Delete `db/drizze.ts`, `lib/subscription.ts`; Modify `app/api/[[...route]]/route.ts`, `package.json`

**Step 1:** Xác nhận không còn ai import:

```bash
grep -rn "db/drizze\|lib/subscription" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```
Expected: không kết quả.

**Step 2:** Xoá cả hai file. `lib/subscription.ts` **vốn đã không có ai gọi** từ trước đợt này — code chết, xoá chứ không port.

**Step 3:** Giữ `db/schema.ts` và `drizzle.config.ts` — vẫn là nguồn của migration và của zod schema cho `zValidator`.

**Step 4:** `pnpm remove postgres` (chỉ drizzle-kit còn cần, mà nó là devDependency dùng lúc migrate — kiểm tra `pnpm db:generate` vẫn chạy trước khi gỡ).

**Step 5:** Cân nhắc trả `runtime` về `"edge"` — giờ mọi handler chạy trên supabase-js (fetch-based). Không bắt buộc.

**Step 6:** `npx vitest run` + một lượt bấm tay đủ các trang.

**Commit** — `chore: drop drizzle runtime client and dead subscription helper`

---

## Definition of done

- [ ] Đăng nhập được bằng cả Google và email/password; sign out sạch
- [ ] `/dashboard` chặn khi chưa đăng nhập; `/api/*` trả 401
- [ ] CRUD chạy đủ cho account, category, transaction, subscription, settings
- [ ] Dashboard overview hiện đúng số như trước khi migrate
- [ ] `db/__tests__/rls.test.ts` xanh; user B không đọc và không ghi được dữ liệu của A
- [ ] `npx vitest run` xanh toàn bộ
- [ ] `grep -rn "clerk" --include="*.ts*" . | grep -v node_modules` không còn kết quả
- [ ] `curl -o /dev/null -w "%{http_code}" localhost:3000/favicon.png` trả `404`
