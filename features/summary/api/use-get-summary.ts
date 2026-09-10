import { topCategories } from "@/lib/dashboard/top-categories";
import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

export const useGetSummary = () => {
  const t = useTranslations("OverviewPage");
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const accountId = params.get("accountId") || "";

  const query = useQuery({
    queryKey: ["summary", { from, to, accountId }],
    queryFn: async () => {
      const response = await client.api.summary.$get({
        query: {
          from,
          to,
          accountId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }

      const { data } = await response.json();
      return {
        ...data,
        incomeAmount: convertAmountFromMiliunits(data.incomeAmount),
        expensesAmount: convertAmountFromMiliunits(data.expensesAmount),
        remainingAmount: convertAmountFromMiliunits(data.remainingAmount),
        // Still `name: string | null` here — the route returns every expense
        // category, uncategorised rows included, and names neither bucket.
        categories: data.categories.map((category) => ({
          ...category,
          value: convertAmountFromMiliunits(category.value),
        })),
        days: data.days.map((day) => ({
          ...day,
          income: convertAmountFromMiliunits(day.income),
          expenses: convertAmountFromMiliunits(day.expenses),
        })),
      };
    },
    // Labelling belongs in `select`, not `queryFn`: the query key has no locale
    // in it, so doing it at fetch time would freeze the bucket names to
    // whichever language was active when the response was cached.
    select: (data) => ({
      ...data,
      categories: topCategories(data.categories, {
        uncategorized: t("Uncategorized"),
        other: t("Other"),
      }),
    }),
  });
  return query;
};
