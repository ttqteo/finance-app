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
      <div>
        © Copyright {new Date().getFullYear()}
        {"  "}
        <Link
          href={"https://github.com/ttqteo"}
          target="_blank"
          className="hover:underline"
        >
          ttqteo
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
