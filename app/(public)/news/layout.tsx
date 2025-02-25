import { PropsWithChildren } from "react";

export default function NewsLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col items-start justify-center pb-10 w-full mx-auto">
      {children}
    </div>
  );
}
