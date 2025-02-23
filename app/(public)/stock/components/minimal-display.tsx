import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { TriangleIcon } from "lucide-react";

const ComfortableDisplay = ({ data }: { data: any }) => {
  return (
    <div className="flex gap-2">
      {data.map((shareData: any, idx: number) => {
        const changed =
          (shareData.matchPrice.matchPrice /
            shareData.matchPrice.referencePrice -
            1) *
          100;
        const delta =
          shareData.matchPrice.matchPrice - shareData.matchPrice.referencePrice;
        return (
          <Badge
            variant={"outline"}
            key={idx}
            className={cn(
              "flex gap-1",
              changed === 0
                ? "bg-yellow-400"
                : changed > 0
                ? "bg-green-400"
                : "bg-red-400"
            )}
          >
            <span>{shareData.matchPrice.symbol}</span>
            <span>
              {formatCurrency(shareData.matchPrice.matchPrice, "VND", false)}
            </span>
            {delta > 0 ? "+" : ""}
            {changed === 0 ? "0" : changed.toFixed(2)}%
          </Badge>
        );
      })}
    </div>
  );
};

export default ComfortableDisplay;
