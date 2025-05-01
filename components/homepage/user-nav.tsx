"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function UserNav() {
  const { isSignedIn } = useUser();
  return (
    <Link href="/dashboard">
      {isSignedIn ? <Button>Go to Dashboard</Button> : <Button>Sign In</Button>}
    </Link>
  );
}
