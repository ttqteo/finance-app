import CategoriesPage from "@/components/dashboard/categories";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
};

const Page = () => {
  return (
    <>
      <CategoriesPage />
    </>
  );
};

export default Page;
