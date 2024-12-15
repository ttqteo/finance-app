import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  isActive?: boolean;
};
const NavButton = ({ href, label, isActive }: Props) => {
  return (
    <Button
      asChild
      size={"sm"}
      variant={"outline"}
      className={cn(
        "w-full lg:w-auto justify-between font-normal border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none focus-within:bg-white/30 transition",
        isActive ? "bg-white/10" : "bg-transparent"
      )}
      disabled
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};

export default NavButton;
