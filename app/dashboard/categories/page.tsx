import { Metadata } from "next";
import CategoriesClient from "./client";

export const metadata: Metadata = {
  title: "Categories",
};
const CategoriesPage = () => {
  return (
    <>
      <CategoriesClient />
    </>
  );
};

export default CategoriesPage;
