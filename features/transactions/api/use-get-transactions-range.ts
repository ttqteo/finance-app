import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, subMonths } from "date-fns";

export const useGetTransactionsRange = (months = 12) => {
  const to = new Date();
  const from = startOfMonth(subMonths(to, months - 1));

  const fromStr = format(from, "yyyy-MM-dd");
  const toStr = format(to, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["transactions", "range", { fromStr, toStr }],
    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: { from: fromStr, to: toStr, accountId: "" },
      });

      if (!response.ok) throw new Error("Failed to fetch transactions");

      const { data } = await response.json();
      return data.map((t) => ({ ...t, amount: convertAmountFromMiliunits(t.amount) }));
    },
  });
};
