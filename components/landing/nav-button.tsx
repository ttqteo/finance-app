import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  isLoginBtn?: boolean;
};
const NavButton = ({ href, label, isLoginBtn }: Props) => {
  return (
    <Button
      asChild
      size={"sm"}
      variant={isLoginBtn ? "blue" : "outline"}
      className={cn(
        "w-full lg:w-auto justify-between font-normal border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none focus-within:bg-white/30 transition"
      )}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};

export default NavButton;
