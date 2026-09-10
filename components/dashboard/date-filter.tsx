"use client";

import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { defaultPeriod, filterPeriod } from "@/lib/dashboard/filter-period";
import { formatDateRange } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

type Props = {
  disabled: boolean;
};

export const DateFilter = ({ disabled }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const pathname = usePathname();

  const params = useSearchParams();
  const accountId = params.get("accountId");

  // Shared with the overview widgets that name this window in their empty
  // states, so the chip and the copy underneath cannot drift apart. `{from:
  // Date, to: Date}` satisfies `DateRange`, whose `to` is optional.
  const paramState = filterPeriod(params);

  const [date, setDate] = useState<DateRange | undefined>(paramState);

  const pushToUrl = (dateRange: DateRange | undefined) => {
    // Resolved at click time rather than at render: a reset means "the last 30
    // days", and the two differ if the tab was left open across midnight.
    const fallback = defaultPeriod();

    const query = {
      from: format(dateRange?.from || fallback.from, "yyyy-MM-dd"),
      to: format(dateRange?.to || fallback.to, "yyyy-MM-dd"),
      accountId,
    };
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  };

  const onReset = () => {
    setDate(undefined);
    pushToUrl(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          size={"sm"}
          variant={"outline"}
          className="lg:w-auto w-full h-9 px-3 transition flex justify-between items-center"
        >
          <span>{mounted ? formatDateRange(paramState) : "Loading..."}</span>
          <ChevronDownIcon className="ml-2 size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="lg:w-auto w-full p-0" align="start">
        <Calendar
          disabled={false}
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
        <div className="p-4 w-full flex items-center gap-x-2">
          <PopoverClose asChild>
            <Button
              onClick={onReset}
              disabled={!date?.from || !date?.to}
              className="w-full"
              variant={"outline"}
            >
              Reset
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button
              onClick={() => pushToUrl(date)}
              disabled={!date?.from || !date?.to}
              className="w-full"
            >
              Apply
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};
