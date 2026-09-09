import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

/**
 * Subscription amounts are NOT stored in miliunits — do not add
 * `convertAmountFromMiliunits` here.
 *
 * Transactions are: `transaction-form.tsx:68` and `import-card.tsx:89` both call
 * `convertAmountToMiliunits` before writing. The subscription write path does
 * not — `app/(site)/dashboard/subscriptions/page.tsx:105` POSTs the amount
 * straight off the form, and the same page reads it back with a bare
 * `formatCurrency(sub.amount, sub.currency)`. The single row in the database is
 * `5000000` / `VND` for a yearly plan, i.e. a real price; dividing by 1000 would
 * render it as 5.000 ₫ per year.
 *
 * The query key is shared on purpose, and since the manager page dropped its
 * own inline `useQuery(["subscriptions"])` this is now the ONLY query function
 * writing that cache entry. The overview widgets and the manager page both read
 * whatever it returns, and the page's create/update/delete mutations invalidate
 * the key, so those mutations refresh the widgets too.
 *
 * That single owner is what makes the rule above binding rather than a
 * convention. There is no second query function whose shape this one merely has
 * to agree with any more: rewriting `amount` here rewrites it everywhere, and
 * the manager page renders it through a bare `formatCurrency`, so every price
 * on that page would silently divide by 1000.
 */
export const useGetSubscriptions = () =>
  useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const response = await client.api.subscriptions.$get();
      if (!response.ok) throw new Error("Failed to fetch subscriptions");

      // Unlike the other endpoints this one returns a bare array, not `{ data }`.
      return await response.json();
    },
  });
