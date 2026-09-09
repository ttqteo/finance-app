"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

/**
 * Clerk có `user.firstName` sẵn; Supabase thì không.
 *
 * Đăng nhập Google thì tên nằm trong `user_metadata` (`full_name` hoặc `name`).
 * Đăng ký bằng email thì chẳng có gì ngoài chính địa chỉ mail, nên lấy phần
 * trước dấu @ — vẫn hơn là để trống chỗ chào mừng.
 */
const firstNameOf = (user: User | null) => {
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const full = (meta.full_name ?? meta.name) as string | undefined;

  if (full?.trim()) return full.trim().split(" ")[0];

  return user.email?.split("@")[0] ?? null;
};

/**
 * Thay cho `useUser()` và `useAuth()` của Clerk. Trả đủ cả ba thứ mà code cũ
 * đang dùng (`user`, `isLoaded`, `isSignedIn`) để chỗ gọi chỉ phải đổi import.
 */
export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      setIsLoaded(true);
    });

    // Bắt cả đăng xuất ở tab khác lẫn lần refresh token định kỳ.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoaded,
    isSignedIn: Boolean(user),
    firstName: firstNameOf(user),
  };
};
