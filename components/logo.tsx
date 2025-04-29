import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export const Logo = ({
  href,
  className,
}: {
  href: string;
  className?: string;
}) => {
  return (
    <Link href={href}>
      <div
        className={cn(
          "items-center border rounded-full",
          href === "/dashboard" ? "hidden lg:flex" : "flex",
          className
        )}
      >
        <Image
          src="/logo.png"
          height={40}
          width={40}
          alt="logo"
          className="rounded-full"
        />
      </div>
    </Link>
  );
};
