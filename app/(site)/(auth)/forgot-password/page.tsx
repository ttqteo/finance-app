"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2Icon, MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const ForgotPasswordPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(
      String(form.get("email")),
      {
        // Link trong mail đi qua /auth/callback để đổi code lấy session, rồi
        // mới sang /reset-password — lúc đó người dùng đã có session tạm và
        // updateUser() mới gọi được.
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      }
    );

    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Báo đã gửi kể cả khi email không tồn tại — nói ngược lại là để lộ tài
    // khoản nào có đăng ký.
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        {sent ? (
          <div className="space-y-3 text-center">
            <MailCheckIcon className="mx-auto size-8 text-muted-foreground" />
            <h1 className="font-semibold">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              If that address has an account, a reset link is on its way.
            </p>
            <Link
              href="/sign-in"
              className="inline-block text-sm text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1 text-center">
              <h1 className="font-bold text-2xl">Forgot your password?</h1>
              <p className="text-sm text-muted-foreground">
                We&apos;ll email you a link to set a new one.
              </p>
            </div>

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

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending && <Loader2Icon className="size-4 animate-spin" />}
                Send reset link
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/sign-in" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
