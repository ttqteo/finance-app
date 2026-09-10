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
    // Stacked and full-width inside the mobile filter sheet, one inline row in
    // the desktop header. Stacking only went wrong when it happened *inside*
    // the fixed h-14 bar, which is no longer where mobile renders these.
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
      <AccountFilter disabled={disabled} />
      {/* TODO: Add this select to DateRange */}
      <Select defaultValue="month">
        <SelectTrigger className="h-9 w-full px-3 transition md:w-[180px] lg:w-auto">
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
