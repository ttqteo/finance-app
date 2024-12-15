"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { columns } from "./columns";
import { useTranslations } from "next-intl";

const CategoriesClient = () => {
  const t = useTranslations();

  const newCategory = useNewCategory();
  const categoriesQuery = useGetCategories();
  const deleteCategories = useBulkDeleteCategories();
  const categories = categoriesQuery.data || [];

  const isDisabled = categoriesQuery.isLoading || deleteCategories.isPending;

  if (categoriesQuery.isLoading) {
    return (
      <Card className="border-none drop-shadow-sm">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full flex items-center justify-center">
            <Loader2Icon className="size-6 text-slate-300 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-xl line-clamp-1">
          {t("Common.Page.Header", { key: t("CategoriesClient.Header") })}
        </CardTitle>
        <Button size={"sm"} onClick={newCategory.onOpen}>
          <PlusIcon className="size-4 mr-2" />
          {t("Common.Action.New")}
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns(t)}
          data={categories}
          filterKey="name"
          filterKeyTranslate={t("CategoriesPage.Column.Name")}
          onDelete={(row) => {
            const ids = row.map((r) => r.original.id);
            deleteCategories.mutate({ ids });
          }}
          disabled={isDisabled}
        />
      </CardContent>
    </Card>
  );
};

export default CategoriesClient;
