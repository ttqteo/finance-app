import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { TriangleIcon } from "lucide-react";

const ComfortableDisplay = ({ data }: { data: any }) => {
  return (
    <div className="grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
      {data.map((shareData: any, idx: number) => {
        const changed =
          (shareData.matchPrice.matchPrice /
            shareData.matchPrice.referencePrice -
            1) *
          100;
        const delta =
          shareData.matchPrice.matchPrice - shareData.matchPrice.referencePrice;
        return (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex flex-col justify-start items-start">
                  <span>{shareData.matchPrice.symbol}</span>
                  <span className="text-sm">
                    {formatCurrency(
                      shareData.matchPrice.accumulatedVolume,
                      "VND",
                      false
                    )}
                  </span>
                </div>
                <div className="flex flex-col justify-end items-end">
                  <span className="text-xl">
                    {formatCurrency(
                      shareData.matchPrice.matchPrice,
                      "VND",
                      false
                    )}{" "}
                  </span>
                  <Badge variant={"outline"}>
                    <TriangleIcon
                      fill={changed > 0 ? "green" : "red"}
                      strokeWidth={0}
                      className={cn(changed < 0 && "rotate-180")}
                      size={16}
                    />{" "}
                    {changed.toFixed(2)}% {delta > 0 ? "+" : ""}
                    {delta}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            {/* <CardContent>
                <p>
                  Giá Trị:{" "}
                  {formatCurrency(
                    shareData.matchPrice.accumulatedValue * 1000000,
                    "VND"
                  )}
                </p>
                <p>
                  Nước Ngoài: Mua{" "}
                  {formatCurrency(
                    shareData.matchPrice.foreignSellVolume * 1000000,
                    "VND"
                  )}{" "}
                  - Bán{" "}
                  {formatCurrency(
                    shareData.matchPrice.foreignBuyVolume * 1000000,
                    "VND"
                  )}
                </p>
              </CardContent> */}
          </Card>
        );
      })}
    </div>
  );
};

export default ComfortableDisplay;
