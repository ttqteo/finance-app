import { TablePageSkeleton } from "@/components/dashboard/skeletons";

/**
 * Fallback for dashboard segments without a loading.tsx of their own — the
 * investing routes. A card-shaped skeleton is a closer guess at any of them
 * than the centred spinner this replaced.
 */
export default function DashboardLoading() {
  return <TablePageSkeleton rows={6} />;
}
