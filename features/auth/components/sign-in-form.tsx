"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { GoogleButton } from "./google-button";

/**
 * `redirect_url` do middleware gắn vào, và middleware chỉ gắn pathname. Vẫn
 * kiểm lại ở đây: chỉ nhận đường dẫn nội bộ, chặn `//host` để không thành
 * open redirect nếu có ai đó tự sửa query string.
 */
const safeRedirect = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";

export const SignInForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = safeRedirect(params.get("redirect_url"));

  const [error, setError] = useState<string | null>(
    params.get("error") === "auth" ? "Could not sign you in. Please try again." : null
  );
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (error) {
      setPending(false);
      setError(error.message);
      return;
    }

    router.push(redirectTo);
    // Session vừa đổi nằm trong cookie, mà cây RSC hiện tại đã render với
    // session cũ (rỗng). refresh() buộc server render lại, nếu không thì
    // /dashboard vẫn bị middleware đá về đây.
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2Icon className="size-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <GoogleButton redirectTo={redirectTo} />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};
