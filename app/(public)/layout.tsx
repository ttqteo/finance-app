import Header from "@/components/landing/header";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="px-3 lg:px-14">{children}</main>
    </>
  );
};

export default LandingLayout;
