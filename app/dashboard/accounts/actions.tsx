"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteAccount } from "@/features/accounts/api/use-delete-account";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { useConfirm } from "@/hooks/use-confirm";
import { EditIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  id: string;
};
const Actions = ({ id }: Props) => {
  const t = useTranslations();
  const [ConfirmDialog, confirm] = useConfirm(
    t("Common.Dialog.Title"),
    t("Common.Dialog.Delete", { key: t("AccountsPage.Header") })
  );
  const deleteMutation = useDeleteAccount(id);
  const { onOpen } = useOpenAccount();

  const handleDelete = async () => {
    const ok = await confirm();
    if (ok) {
      deleteMutation.mutate();
    }
  };

  return (
    <>
      <ConfirmDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="size-8 p-0">
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={deleteMutation.isPending}
            onClick={() => onOpen(id)}
          >
            <EditIcon className="size-4 mr-2" />
            {t("Common.Action.Edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            <TrashIcon className="size-4 mr-2" />
            {t("Common.Action.Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default Actions;