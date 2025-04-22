"use client";

import Link from "@/components/markdown/link";
import { MainNav } from "@/components/stocks/main-nav";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 fixed z-10 w-full bg-white shadow-sm">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            {/* <UserNav /> */}
            <Link href="/dashboard">
              {isSignedIn ? (
                <Button>Go to Dashboard</Button>
              ) : (
                <Button>Sign In</Button>
              )}
            </Link>
          </div>
        </div>
      </div>
      <div className="flex-1 pt-16">{children}</div>
    </div>
  );
};

export default LandingLayout;
