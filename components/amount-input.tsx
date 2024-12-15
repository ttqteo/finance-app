import { cn, getCookie } from "@/lib/utils";
import { InfoIcon, MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

import CurrencyInput from "react-currency-input-field";
import { useTranslations } from "next-intl";
import { currencyConfig } from "@/config/constant";

type Props = {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

export const AmountInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: Props) => {
  const t = useTranslations();
  const parsedValue = parseFloat(value);
  const isIncome = parsedValue > 0;
  const isExpenses = parsedValue < 0;
  const currency = currencyConfig[getCookie("currency") || "USD"];

  const onReverseValue = () => {
    if (!value) return;
    const newValue = parseFloat(value) * -1;
    onChange(newValue.toString());
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onReverseValue}
              className={cn(
                "bg-slate-400 hover:bg-slate-500 absolute top-1.5 left-1.5 rounded-md p-2 flex items-center justify-center transition",
                isIncome && "bg-emerald-500 hover:bg-emerald-600",
                isExpenses && "bg-rose-500 hover:bg-rose-600"
              )}
            >
              {!parsedValue && <InfoIcon className="size-3 text-white" />}
              {isIncome && <PlusCircleIcon className="size-3 text-white" />}
              {isExpenses && <MinusCircleIcon className="size-3 text-white" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {t("TransactionsPage.Form.TooltipDesc")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CurrencyInput
        prefix={currency.prefix}
        suffix={currency.suffix}
        className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        placeholder={placeholder}
        value={value}
        decimalsLimit={2}
        decimalScale={2}
        onValueChange={onChange}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground mt-2">
        {isIncome && t("TransactionsPage.Form.IncomeDesc")}
        {isExpenses && t("TransactionsPage.Form.ExpensesDesc")}
      </p>
    </div>
  );
};
