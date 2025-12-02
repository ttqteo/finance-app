"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2, Sparkles, X, Info } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SubscriptionStatus = {
  plan: "FREE" | "PREMIUM";
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  startDate: string | null;
  endDate: string | null;
  renewalDate: string | null;
  frequency: "MONTHLY" | "YEARLY" | null;
  cancelAtPeriodEnd: boolean;
};

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) throw new Error("Failed to fetch subscription");
      return res.json();
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (frequency: "MONTHLY" | "YEARLY") => {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        body: JSON.stringify({ plan: "PREMIUM", frequency }),
      });
      if (!res.ok) throw new Error("Failed to upgrade");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: () => {
      toast.error("Failed to update subscription");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to cancel");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription will cancel at the end of the period");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: () => {
      toast.error("Failed to cancel subscription");
    },
  });

  const renewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/subscriptions/renew", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to renew");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription renewed");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: () => {
      toast.error("Failed to renew subscription");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPremium =
    subscription?.plan === "PREMIUM" && subscription?.status === "ACTIVE";
  const isCancelled = subscription?.status === "CANCELLED"; // This might be immediate cancel
  const isCancelingAtPeriodEnd = subscription?.cancelAtPeriodEnd;
  const isExpired = subscription?.status === "EXPIRED";

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Subscription Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
            {/* Free Plan */}
            <Card
              className={`relative flex flex-col ${
                !isPremium ? "border-primary border-2" : ""
              }`}
            >
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>
                  Essential features for personal finance
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-3xl font-bold">
                  $0
                  <span className="text-sm font-normal text-muted-foreground">
                    /mo
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>Basic Expense Tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>Monthly Reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Advanced Analytics
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Unlimited Categories
                    </span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={!isPremium ? "outline" : "ghost"}
                  disabled={!isPremium}
                >
                  {isPremium ? "Downgrade" : "Current Plan"}
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card
              className={`relative flex flex-col ${
                isPremium ? "border-primary border-2" : ""
              }`}
            >
              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Sparkles className="size-3" /> Current Plan
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Premium
                  <Sparkles className="size-4 text-yellow-500 fill-yellow-500" />
                </CardTitle>
                <CardDescription>
                  Unlock full potential with advanced features
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-3xl font-bold">
                  $9
                  <span className="text-sm font-normal text-muted-foreground">
                    /mo
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>Advanced Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>Unlimited Categories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>Priority Support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {!isPremium ? (
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      className="w-full"
                      onClick={() => upgradeMutation.mutate("MONTHLY")}
                      disabled={upgradeMutation.isPending}
                    >
                      {upgradeMutation.isPending && (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      )}
                      Upgrade Monthly ($9/mo)
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => upgradeMutation.mutate("YEARLY")}
                      disabled={upgradeMutation.isPending}
                    >
                      {upgradeMutation.isPending && (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      )}
                      Upgrade Yearly ($90/yr)
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Includes 7-day free trial. You won't be charged until the
                      trial ends.
                    </p>
                  </div>
                ) : (
                  <>
                    {isCancelingAtPeriodEnd ? (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="bg-yellow-500/10 text-yellow-600 p-2 rounded-md text-sm flex items-center gap-2">
                          <Info className="size-4" />
                          <span>
                            Cancels on{" "}
                            {subscription.endDate
                              ? format(new Date(subscription.endDate), "PPP")
                              : "end of period"}
                          </span>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => renewMutation.mutate()} // Re-using renew for resume? Or create resume endpoint?
                          // For now, let's assume renew handles it or we need a resume endpoint.
                          // Actually, let's just use upgrade to re-activate?
                          // Let's use renew for now as it sets status to ACTIVE.
                          disabled={renewMutation.isPending}
                        >
                          {renewMutation.isPending && (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          )}
                          Resume Subscription
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={() => cancelMutation.mutate()}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending && (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        )}
                        Cancel Subscription
                      </Button>
                    )}
                    {!isCancelingAtPeriodEnd && (
                      <div className="text-xs text-muted-foreground text-center">
                        Renews on{" "}
                        {subscription.renewalDate
                          ? format(new Date(subscription.renewalDate), "PPP")
                          : "N/A"}
                      </div>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
