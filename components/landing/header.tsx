import Navigation from "@/components/landing/navigation";
import { Logo } from "@/components/logo";

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-white px-4 py-4 md:px-14 shadow-sm z-10">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between">
          <Logo href="/" className="text-black" />
          <Navigation />
        </div>
      </div>
    </header>
  );
};

export default Header;
