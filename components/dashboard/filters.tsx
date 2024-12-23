import { AccountFilter } from "@/components/dashboard/account-filter";
import { DateFilter } from "@/components/dashboard/date-filter";

type Props = {
  disabled: boolean;
};

export const Filters = ({ disabled }: Props) => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-y-0 lg:gap-x-2">
      <AccountFilter disabled={disabled} />
      <DateFilter disabled={disabled} />
    </div>
  );
};
