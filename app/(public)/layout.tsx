import Header from "@/components/landing/header";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <div className="h-[68px]" />
      <main className="mt-4 px-3 lg:px-14">{children}</main>
    </>
  );
};

export default LandingLayout;
