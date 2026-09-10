import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shared page skeletons.
 *
 * These exist so a route's `loading.tsx` and its component's own `isLoading`
 * branch can render the *same* thing. Before, navigating to a dashboard page
 * showed a centred spinner (the route boundary), then a differently-shaped
 * card with a second spinner inside it (the component), then the content —
 * three layouts and two waits for one navigation. Drawing one skeleton in the
 * shape of the finished page across both phases turns that into a single
 * uninterrupted state that simply fills in.
 */

/** Matches the card + toolbar + table that the list pages render. */
export const TablePageSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <Card>
    <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
      <Skeleton className="h-7 w-44" />
      <Skeleton className="h-9 w-28" />
    </CardHeader>
    <CardContent>
      {/* The filter input row inside DataTable. */}
      <div className="flex items-center py-4">
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>

      <div className="rounded-md border">
        <div className="flex items-center gap-4 border-b px-4 py-3">
          <Skeleton className="size-4 shrink-0" />
          {[40, 28, 24, 32, 20].map((w, i) => (
            <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-4 py-4 last:border-0"
          >
            <Skeleton className="size-4 shrink-0" />
            {[40, 28, 24, 32, 20].map((w, j) => (
              <Skeleton key={j} className="h-4" style={{ width: `${w}%` }} />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-x-2 py-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Matches the settings card: one column of stacked fields (language, currency,
 * timezone) ending in a full-width Save button, then the appearance section
 * below a divider, then the version footer. An earlier version drew the fields
 * side by side, which is not how the form lays them out.
 */
export const FormPageSkeleton = () => (
  <Card>
    <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
      <Skeleton className="h-7 w-44" />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div className="space-y-4 pt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 border-t pt-6 sm:grid-cols-2 md:grid-cols-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-4 w-28" />
    </CardFooter>
  </Card>
);

/**
 * Matches the overview: greeting, three KPI cards, the chart pair, then the
 * tab strip and the first row of widget cards.
 */
export const OverviewSkeleton = () => (
  <>
    <div className="mb-2 space-y-2">
      <Skeleton className="h-11 w-72" />
      <Skeleton className="h-4 w-64" />
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Card
          key={i}
          className="flex min-h-[190px] flex-col justify-between p-5"
        >
          <Skeleton className="h-3 w-20" />
          <div className="mt-6 space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="mt-6 border-t pt-3">
            <Skeleton className="h-3 w-16" />
          </div>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
      <Card className="col-span-1 p-5 lg:col-span-3 xl:col-span-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-6 h-[300px] w-full" />
      </Card>
      <Card className="col-span-1 p-5 lg:col-span-3 xl:col-span-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-6 h-[300px] w-full" />
      </Card>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-8 w-64" />
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="p-6 lg:col-span-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-56" />
        <Skeleton className="mt-6 h-[240px] w-full" />
      </Card>
      <Card className="p-6 lg:col-span-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-48" />
        <Skeleton className="mt-6 h-[240px] w-full" />
      </Card>
    </div>
  </>
);
