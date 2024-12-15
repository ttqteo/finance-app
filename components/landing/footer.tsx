import { GithubIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const Footer = () => {
  return (
    <footer className="flex items-center justify-between my-12">
      <Link href="https://github.com/ttqteo/finance-app" target="_blank">
        <Button variant={"ghost"} className="rounded-full">
          <GithubIcon className="size-4" />
        </Button>
      </Link>
      <div>© Copyright 2024 Finance Pro</div>
    </footer>
  );
};

export default Footer;
