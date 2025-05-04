"use client";

import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { IGoldPriceV2 } from "vnstock-js";

export const columns: ColumnDef<IGoldPriceV2>[] = [
  {
    accessorKey: "type_code",
    header: "Mã",
  },
  {
    accessorKey: "buy",
    header: "Mua",
    cell: ({ row }) => formatCurrency(row.original.buy),
  },
  {
    accessorKey: "sell",
    header: "Bán",
    cell: ({ row }) => formatCurrency(row.original.sell),
  },
  {
    accessorKey: "alter_buy",
    header: "Thay đổi mua",
    cell: ({ row }) => formatCurrency(row.original.alter_buy),
  },
  {
    accessorKey: "alter_sell",
    header: "Thay đổi bán",
    cell: ({ row }) => formatCurrency(row.original.alter_sell),
  },
];

type Props = {
  data: IGoldPriceV2[];
};

export default function GoldTable({ data }: Props) {
  return <DataTable columns={columns} data={data} />;
}
