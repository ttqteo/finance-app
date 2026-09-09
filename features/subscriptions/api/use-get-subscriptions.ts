import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

/**
 * Subscription amounts are NOT stored in miliunits — do not add
 * `convertAmountFromMiliunits` here.
 *
 * Transactions are: `transaction-form.tsx:68` and `import-card.tsx:89` both call
 * `convertAmountToMiliunits` before writing. The subscription write path does
 * not — `app/(site)/dashboard/subscriptions/page.tsx:111` POSTs the amount
 * straight off the form, and the same page reads it back with a bare
 * `formatCurrency(sub.amount, sub.currency)`. The single row in the database is
 * `5000000` / `VND` for a yearly plan, i.e. a real price; dividing by 1000 would
 * render it as 5.000 ₫ per year.
 *
 * The query key is shared on purpose. The subscription manager page above owns
 * an inline `useQuery(["subscriptions"])` and invalidates that key after every
 * create/update/delete, so this widget cache is refreshed by those mutations.
 * That only holds while both query functions cache the same shape — another
 * reason this one must not rewrite `amount`.
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
