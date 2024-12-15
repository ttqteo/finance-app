"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete-accounts";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { columns } from "./columns";

const AccountsClient = () => {
  const t = useTranslations();

  const newAccount = useNewAccount();
  const accountsQuery = useGetAccounts();
  const deleteAccounts = useBulkDeleteAccounts();
  const accounts = accountsQuery.data || [];

  const isLoading = accountsQuery.isLoading;
  const isDisabled = accountsQuery.isLoading || deleteAccounts.isPending;

  if (isLoading) {
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
          {t("Common.Page.Header", { key: t("AccountsPage.Header") })}
        </CardTitle>
        <Button size={"sm"} onClick={newAccount.onOpen}>
          <PlusIcon className="size-4 mr-2" />
          {t("Common.Action.New")}
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns(t)}
          data={accounts}
          filterKey="name"
          filterKeyTranslate={t("AccountsPage.Column.Name")}
          onDelete={(row) => {
            const ids = row.map((r) => r.original.id);
            deleteAccounts.mutate({ ids });
          }}
          disabled={isDisabled}
        />
      </CardContent>
    </Card>
  );
};

export default AccountsClient;
