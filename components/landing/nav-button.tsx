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
      variant={isLoginBtn ? "default" : "outline"}
      className={cn(
        "w-full lg:w-auto justify-between font-normal border-none outline-none transition"
      )}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};

export default NavButton;
