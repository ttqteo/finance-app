"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));

    if (password !== String(form.get("confirm"))) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    setError(null);

    const supabase = createClient();
    // Chạy được là nhờ /auth/callback đã đổi code trong link mail lấy session
    // tạm trước khi đẩy sang trang này.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPending(false);
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-1 text-center">
          <h1 className="font-bold text-2xl">Set a new password</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
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
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
