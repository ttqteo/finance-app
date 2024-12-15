import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const Tools = () => {
  const t = useTranslations("TransactionsPage");
  const newTransaction = useNewTransaction();

  return (
    <div className="fixed left-0 right-0 bottom-0 z-99999 flex items-center justify-between m-4">
      <div></div>
      <Tooltip delayDuration={100}>
        <TooltipTrigger>
          <Button
            variant={"blue"}
            className="rounded-full"
            size="icon"
            onClick={newTransaction.onOpen}
          >
            <PlusIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("Form.NewTransaction")}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default Tools;
