import { Logo } from "@/components/logo";
import Navigation from "@/components/landing/navigation";

const Header = () => {
  return (
    <header className="bg-gradient-to-b px-4 py-8 lg:px-14">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <Logo className="text-black" />
          <Navigation />
        </div>
      </div>
    </header>
  );
};

export default Header;
