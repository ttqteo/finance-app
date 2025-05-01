import Navigation from "@/components/navigation";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <div className="flex-1 pt-16">
        <div className="flex flex-col">
          <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default LandingLayout;
