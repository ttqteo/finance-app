import Navigation from "@/components/navigation";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <div className="flex-1 pt-16">{children}</div>
    </div>
  );
};

export default LandingLayout;
