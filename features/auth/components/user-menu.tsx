"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/features/auth/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

/** Thay `<UserButton />` của Clerk: avatar, email, và nút đăng xuất. */
export const UserMenu = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Loader2Icon className="size-4 animate-spin text-muted-foreground" />;
  }

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const email = user.email ?? "";

  const onSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    // Cây RSC hiện tại render với session cũ; không refresh thì phần server
    // vẫn tưởng còn đăng nhập cho tới lần điều hướng cứng tiếp theo.
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full p-0">
          <Avatar className="size-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={email} />}
            <AvatarFallback>
              {email.slice(0, 1).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOutIcon className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
