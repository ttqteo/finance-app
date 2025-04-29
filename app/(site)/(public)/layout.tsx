import { FullscreenLoader } from "@/components/fullscreen-loader";
import Navigation from "@/components/navigation";
import { Suspense } from "react";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<FullscreenLoader />}>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <div className="flex-1 pt-16">{children}</div>
      </div>
    </Suspense>
  );
};

export default LandingLayout;
