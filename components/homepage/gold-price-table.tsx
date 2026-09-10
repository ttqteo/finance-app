"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { VnstockTypes } from "vnstock-js";

/**
 * vnstock-js v1.5.1 đổi hình dạng dữ liệu vàng. Bảng field map trong
 * `dist/pipeline/transform/configs/commodity.js` cho thấy đây thuần tuý là đổi
 * tên: type_code→code, buy→buyPrice, sell→sellPrice, alter_buy→buyChange,
 * alter_sell→sellChange, update_time→updatedAt.
 *
 * NHƯNG ba thứ bị bỏ hẳn, không map sang đâu cả: `histories`, `yesterday_buy`,
 * `yesterday_sell`. Vì vậy hai cột "Hôm qua" và tooltip liệt kê lịch sử trong
 * ngày đã gỡ khỏi bảng — dữ liệu không còn tồn tại ở đầu nguồn.
 *
 * Cố ý KHÔNG suy "giá hôm qua" ra từ `price - change`: field map chứng minh
 * `*Change` chính là `alter_*` cũ, tức biến động TRONG NGÀY chứ không phải so
 * với phiên trước. Lấy nó trừ đi sẽ ra một con số trông có vẻ đúng mà sai —
 * trong app tài chính thì thà không hiện còn hơn.
 *
 * `updatedAt` giờ là chuỗi ngày ("2026-09-10"), không còn epoch có giờ phút.
 */
type GoldRow = VnstockTypes.GoldPriceGiaVang;

const GOLD_TYPE_MAP: Record<string, string> = {
  BTSJC: "BTMC SJC",
  VNGSJC: "VÀNG VIỆT NAM SJC",
  PQHNVM: "NHẪN TRÒN PHÚ QUÝ 999.9",
  DOHCML: "DOJI HCM",
  DOHNL: "DOJI HN",
  DOJINHTV: "NHẪN DOIJ HƯNG THỊNH VƯỢNG 9999",
  SJ9999: "NHẪN SJC 999.9",
  SJL1L10: "SJC 1 LƯỢNG",
  PQHN24NTT: "NHẪN TRÒN TRƠN VÀNG RỒNG TL BTMC",
  USDX: "USD Index",
  XAUUSD: "Giá vàng thế giới (XAU/USD)",
  BT9999NTT: "NHẪN TRÒN TRƠN VÀNG RỒNG TL BTMC", // giống với PQHN24NTT
  VIETTINMSJC: "VIETINBANK SJC",
  VNGN: "VÀNG DOANH NGHIỆP",
};

const formatPrice = (price: number) => {
  return `${(price / 1000000).toFixed(2)}`;
};

const formatPriceChange = (change: number) => {
  if (change === 0) return null;

  const formattedValue = `${change > 0 ? "+" : "-"}${Math.abs(
    change / 1000
  ).toFixed(0)}K`;

  return {
    value: formattedValue,
    type: change > 0 ? "increase" : "decrease",
  };
};

const changeBadgeClass = (type: string) =>
  type === "increase"
    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700"
    : "bg-rose-100 text-rose-700 hover:bg-rose-100 hover:text-rose-700";

const columns: ColumnDef<GoldRow>[] = [
  {
    accessorKey: "code",
    cell: ({ row }) => {
      // API trả `name` là "GOLD" cho mọi dòng nên không dùng được làm nhãn;
      // bảng tra tay vẫn là nguồn tên duy nhất.
      const code = row.getValue("code") as string;
      return <div className="font-medium">{GOLD_TYPE_MAP[code] ?? code}</div>;
    },
  },
  {
    accessorKey: "buyPrice",
    cell: ({ row }) => {
      const buyChange = formatPriceChange(row.original.buyChange);

      return (
        <div className="flex items-center justify-center gap-2">
          {formatPrice(row.original.buyPrice)}
          {buyChange && (
            <Badge className={changeBadgeClass(buyChange.type)}>
              {buyChange.value}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "sellPrice",
    cell: ({ row }) => {
      const sellChange = formatPriceChange(row.original.sellChange);

      return (
        <div className="flex items-center justify-center gap-2">
          {formatPrice(row.original.sellPrice)}
          {sellChange && (
            <Badge className={changeBadgeClass(sellChange.type)}>
              {sellChange.value}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "trend",
    header: "Biến động",
    cell: ({ row }) => {
      const { code, sellChange, buyChange, updatedAt } = row.original;

      const trend: "up" | "down" | "neutral" =
        sellChange > 0 ? "up" : sellChange < 0 ? "down" : "neutral";

      return (
        <div className="flex justify-center">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  {trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                  ) : (
                    <div className="h-4 w-4 flex items-center justify-center">
                      -
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-72" side="right">
                <div className="space-y-2">
                  <div className="font-medium">
                    {GOLD_TYPE_MAP[code] ?? code}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {updatedAt}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mua: {formatPrice(row.original.buyPrice)}</span>
                    <span>Bán: {formatPrice(row.original.sellPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Thay đổi mua: {buyChange}</span>
                    <span>Thay đổi bán: {sellChange}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];

export function GoldPriceDataTable({ goldPrice }: { goldPrice: GoldRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data] = useState<GoldRow[]>(goldPrice);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="max-h-[450px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              rowSpan={2}
              className="align-middle text-center border w-[150px]"
            >
              <div>Sản phẩm</div>
              <div className="text-sm font-normal text-muted-foreground">
                Triệu đồng/lượng
              </div>
            </TableHead>
            {/* Chỉ còn một nhóm "Hôm nay": nhóm "Hôm qua" đã gỡ cùng với hai
                cột không còn dữ liệu. Ngày lấy từ chính dòng dữ liệu chứ không
                lấy `new Date()`, để tiêu đề luôn khớp với số bên dưới. */}
            <TableHead colSpan={2} className="text-center border">
              Hôm nay ({data[0]?.updatedAt ?? "—"})
            </TableHead>
            <TableHead rowSpan={2} className="align-middle border text-center">
              <div className="font-bold">Biến động</div>
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="text-center border font-medium">
              Giá mua
            </TableHead>
            <TableHead className="text-center border font-medium">
              Giá bán
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                className={index % 2 === 0 ? "bg-muted/50" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
