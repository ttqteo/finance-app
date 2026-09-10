"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarIcon,
  Edit,
  Loader2,
  Plus,
  Repeat,
  Trash2,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatCurrency } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import CurrencyInput from "react-currency-input-field";
import { useGetSubscriptions } from "@/features/subscriptions/api/use-get-subscriptions";
import { isYearly, nextPaymentDate } from "@/lib/dashboard/next-payment-date";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  currency: z.enum(["VND", "USD"]),
  frequency: z.enum(["MONTHLY", "YEARLY"]),
  startDate: z.date({ required_error: "Purchase date is required" }),
  hasFreeTrial: z.boolean().default(false),
  notes: z.string().optional(),
});

// Derived from the shared hook rather than restated, so this page cannot drift
// from the shape that actually lands in the ["subscriptions"] cache entry.
type Subscription = NonNullable<
  ReturnType<typeof useGetSubscriptions>["data"]
>[number];

/** Renders the stored enum as a word rather than shouting `YEARLY`. */
const frequencyLabel = (frequency: string) =>
  isYearly(frequency) ? "Yearly" : "Monthly";

export default function SubscriptionManagerPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      currency: "VND",
      frequency: "MONTHLY",
      hasFreeTrial: false,
      notes: "",
    },
  });

  // The overview widgets read the same ["subscriptions"] key. Two query
  // functions writing one cache entry means whichever fetched last decides the
  // shape, so this page uses the shared hook. Like the old inline queryFn, it
  // does NOT divide by 1000: subscription amounts are not stored in miliunits.
  const { data: subscriptions = [], isLoading } = useGetSubscriptions();

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create subscription");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription created");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => toast.error("Failed to create subscription"),
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await fetch(`/api/subscriptions/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update subscription");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription updated");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: () => toast.error("Failed to update subscription"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete subscription");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription deleted");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: () => toast.error("Failed to delete subscription"),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (sub: Subscription) => {
    setEditingId(sub.id);
    form.reset({
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency as "VND" | "USD",
      frequency: sub.frequency as "MONTHLY" | "YEARLY",
      startDate: new Date(sub.startDate),
      // The column is nullable in the schema, and the checkbox is not.
      hasFreeTrial: sub.hasFreeTrial ?? false,
      notes: sub.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    form.reset({
      name: "",
      amount: 0,
      currency: "VND",
      frequency: "MONTHLY",
      hasFreeTrial: false,
      notes: "",
    });
    setIsDialogOpen(true);
  };

  // `isYearly` is the fallback the overview widgets already use: anything
  // unrecognised counts as monthly. The reducer this replaces had a third
  // answer — it dropped such a row from the total altogether, while the
  // deleted `calculateNextRenewal` billed it yearly.
  const monthlyCostIn = (currency: string) =>
    subscriptions
      .filter((sub) => sub.currency === currency)
      .reduce(
        (acc, sub) =>
          acc + (isYearly(sub.frequency) ? sub.amount / 12 : sub.amount),
        0
      );

  const totalMonthlyCostVND = monthlyCostIn("VND");
  const totalMonthlyCostUSD = monthlyCostIn("USD");

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-medium tracking-tight">
          Subscription Summary
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your recurring expenses
        </p>
      </div>

      {/* Was a card-inside-a-card: two `bg-primary/10` filled blocks nested in
          a third card. Now the same bordered tiles the overview KPIs use, so
          the two pages read as one product. */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="flex min-h-[130px] flex-col justify-between p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className="text-xs font-medium">Total Monthly Cost</span>
          </div>
          <div className="mt-4 flex flex-col tabular-nums tracking-tight">
            <span className="text-3xl font-normal">
              {formatCurrency(totalMonthlyCostVND, "VND")}
            </span>
            {totalMonthlyCostUSD > 0 && (
              <span className="text-base text-muted-foreground">
                + {formatCurrency(totalMonthlyCostUSD, "USD")}
              </span>
            )}
          </div>
        </Card>

        <Card className="flex min-h-[130px] flex-col justify-between p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Repeat className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className="text-xs font-medium">Active Subscriptions</span>
          </div>
          <div className="mt-4 text-3xl font-normal tabular-nums tracking-tight">
            {subscriptions.length}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Subscriptions</CardTitle>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="size-4 mr-2" />
            Add New
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Next Renewal</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground h-24"
                  >
                    No subscriptions found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    {sub.name}
                    {sub.hasFreeTrial && (
                      <Badge variant="secondary" className="ml-2 font-normal">
                        Trial
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(sub.amount, sub.currency)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {frequencyLabel(sub.frequency)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(sub.startDate), "PPP")}
                  </TableCell>
                  <TableCell>
                    {format(
                      nextPaymentDate(new Date(sub.startDate), sub.frequency),
                      "PPP"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(sub)}
                    >
                      <Edit className="size-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(sub.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Subscription" : "Add Subscription"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details of your subscription."
                : "Add a new subscription to track."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Netflix, Spotify, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          id="amount"
                          name="amount"
                          placeholder="0.00"
                          value={field.value}
                          decimalsLimit={2}
                          onValueChange={(value) =>
                            field.onChange(value ? Number(value) : "")
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          intlConfig={{
                            locale:
                              form.watch("currency") === "VND"
                                ? "vi-VN"
                                : "en-US",
                            currency: form.watch("currency"),
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VND">VND</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                          <SelectItem value="YEARLY">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Purchase Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="hasFreeTrial"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>First Cycle Free</FormLabel>
                      <FormDescription>
                        This subscription has a promotion (e.g. 100% discount)
                        for the first cycle.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Family plan, shared with..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : null}
                  {editingId ? "Save Changes" : "Add Subscription"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
