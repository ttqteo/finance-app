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
          "items-center",
          href === "/dashboard" ? "hidden lg:flex" : "flex"
        )}
      >
        <Image
          src="/logo.png"
          height={32}
          width={32}
          alt="logo"
          className="rounded-full"
        />
        <p
          className={cn("font-semibold text-white text-2xl ml-2.5", className)}
        >
          Finance
        </p>
      </div>
    </Link>
  );
};
