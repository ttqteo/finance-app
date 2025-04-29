"use client";

import type React from "react";

import { Logo } from "@/components/logo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ClerkLoaded, ClerkLoading, useAuth, UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  Cog,
  FileText,
  Loader2Icon,
  Monitor,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PREFIX_URL = "/dashboard";

const PROTECTED_ROUTES = [
  {
    label: "Tổng Quan",
    href: "",
    icon: BarChart3,
  },
  {
    label: "Giao Dịch",
    href: "/transactions",
    icon: FileText,
  },
  {
    label: "Tài Khoản",
    href: "/accounts",
    icon: Users,
  },
  {
    label: "Danh Mục",
    href: "/categories",
    icon: Monitor,
  },
  {
    label: "Cài Đặt",
    href: "/settings",
    icon: Cog,
  },
];

export function Sidebar() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();

  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  return (
    <div className="fixed z-10 top-0 left-0 flex h-screen flex-col justify-center px-2 border-r">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <div className="flex h-8 w-8 items-center justify-center">
          <Logo href={PREFIX_URL} />
        </div>
      </div>

      <div className="flex flex-1 flex-col mt-4 gap-2">
        {PROTECTED_ROUTES.map((item) => (
          <NavItem
            key={PREFIX_URL + item.href}
            href={PREFIX_URL + item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === PREFIX_URL + item.href}
          />
        ))}
      </div>

      <div className="flex flex-col items-center justify-center mb-4">
        <ClerkLoaded>
          <UserButton />
        </ClerkLoaded>
        <ClerkLoading>
          <Loader2Icon className="size-8 animate-spin text-slate-400" />
        </ClerkLoading>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className="relative flex h-12 w-full items-center justify-center"
        >
          <div
            className={cn(
              "hover:border hover:bg-[#1C1C1C] hover:border-[#2C2C2C] p-3",
              isActive && "border border-[#2C2C2C]/80 bg-[#1C1C1C]"
            )}
          >
            <Icon className="size-5" />
          </div>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
