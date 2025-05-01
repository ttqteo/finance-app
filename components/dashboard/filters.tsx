import { AccountFilter } from "@/components/dashboard/account-filter";
import { DateFilter } from "@/components/dashboard/date-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  disabled: boolean;
};

export const Filters = ({ disabled }: Props) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-y-2 md:gap-y-0 md:gap-x-2">
      <AccountFilter disabled={disabled} />
      {/* TODO: Add this select to DateRange */}
      <Select defaultValue="month">
        <SelectTrigger className="w-[180px] lg:w-auto h-9 px-3 transition">
          <SelectValue placeholder="Select view" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
      <DateFilter disabled={disabled} />
    </div>
  );
};
