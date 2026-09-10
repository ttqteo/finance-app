"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

/**
 * Dùng chung cho cả sign-in lẫn sign-up — Supabase không phân biệt hai việc đó
 * với OAuth, cùng một lời gọi vừa đăng nhập vừa tạo tài khoản nếu chưa có.
 */
export const GoogleButton = ({ redirectTo }: { redirectTo: string }) => {
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    setPending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Lấy origin từ window chứ không đọc NEXT_PUBLIC_APP_URL: `next dev` hay
        // rơi về cổng 3001 khi 3000 còn bị giữ, và cả hai cổng đều đã khai trong
        // Redirect URLs của Supabase.
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          redirectTo
        )}`,
      },
    });

    // Đường thành công thì trình duyệt đã rời trang, không cần tắt pending.
    if (error) setPending(false);
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={pending}
    >
      {pending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <FcGoogle className="size-4" />
      )}
      Continue with Google
    </Button>
  );
};
