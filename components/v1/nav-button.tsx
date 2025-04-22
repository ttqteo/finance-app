import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  isLoginBtn?: boolean;
  isActive?: boolean;
};
const NavButton = ({ href, label, isLoginBtn, isActive = false }: Props) => {
  return (
    <Button
      asChild
      size={"sm"}
      variant={isLoginBtn ? "default" : isActive ? "outline" : "ghost"}
      className={cn("w-full lg:w-auto justify-between font-normal transition")}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};

export default NavButton;
