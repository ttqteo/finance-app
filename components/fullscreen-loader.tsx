import { Spinner } from "./spinner";

export const FullscreenLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2">
      <Spinner />
    </div>
  );
};
