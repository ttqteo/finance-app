import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-center pb-10 w-full mx-auto">
      {children}
    </div>
  );
}
