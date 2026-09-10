"use client";

import {
  FormPageSkeleton,
  OverviewSkeleton,
  TablePageSkeleton,
} from "@/components/dashboard/skeletons";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChartCandlestick,
  Cog,
  FileText,
  PlusIcon,
} from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const PREFIX_URL = "/dashboard";

/**
 * The mobile counterpart to <Sidebar />, which is hidden below md. A rail of
 * icons down the left edge costs a phone most of its usable width, and the one
 * action people come here to do — adding a transaction — was a floating button
 * sitting on top of the content it covered.
 *
 * Deliberately five entries, not the sidebar's nine: a bottom bar stops being
 * tappable past about five targets. Accounts, Categories, Subscriptions and the
 * rest of Investing stay reachable from their pages and from the sidebar on
 * anything wider.
 */
const LEFT_ITEMS = [
  { href: "", label: "Tổng Quan", icon: BarChart3 },
  { href: "/transactions", label: "Giao Dịch", icon: FileText },
];

const RIGHT_ITEMS = [
  { href: "/investing/stocks", label: "Stock", icon: ChartCandlestick },
  { href: "/settings", label: "Cài Đặt", icon: Cog },
];

/**
 * Skeleton của từng đích — PHẢI trùng với cái mà `loading.tsx` của route đó vẽ,
 * để lúc lớp phủ nhường chỗ cho trang thật thì không có cú nhảy layout nào.
 * Stock chưa có `loading.tsx` riêng nên dùng bản dự phòng của
 * `dashboard/loading.tsx`: `TablePageSkeleton` với 6 dòng.
 */
const SKELETON_FOR: Record<string, React.ReactNode> = {
  "": <OverviewSkeleton />,
  "/transactions": <TablePageSkeleton />,
  "/investing/stocks": <TablePageSkeleton rows={6} />,
  "/settings": <FormPageSkeleton />,
};

export function BottomNav() {
  const pathname = usePathname();
  const newTransaction = useNewTransaction();

  // `href` ngắn (không kèm PREFIX_URL) của mục đang chờ điều hướng, hoặc null.
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const isActive = (href: string) => {
    const full = PREFIX_URL + href;
    // The overview lives at the bare prefix, so it can only match exactly —
    // `startsWith` would light it up on every dashboard page.
    if (href === "") return pathname === PREFIX_URL;
    // Stock is one screen inside Investing; keep it lit across that section.
    if (href === "/investing/stocks") {
      return pathname.startsWith(PREFIX_URL + "/investing");
    }
    return pathname.startsWith(full);
  };

  // Ổn định qua các lần render để effect trong NavItemContent không chạy lại
  // vô tận. Tắt pending chỉ khi chính mục đó báo xong — một mục khác vừa bắt
  // đầu chờ thì không được xoá nhầm trạng thái của nó.
  const handlePendingChange = useCallback((href: string, pending: boolean) => {
    setPendingHref((prev) => (pending ? href : prev === href ? null : prev));
  }, []);

  // Chạm lại vào mục đang mở cũng làm Next báo pending trong chốc lát; không
  // được phủ skeleton lên chính trang đang xem.
  const overlayHref =
    pendingHref !== null && !isActive(pendingHref) ? pendingHref : null;

  return (
    <>
      {overlayHref !== null && (
        /*
         * Skeleton của trang ĐÍCH, phủ lên nội dung cũ ngay khi chạm.
         *
         * `loading.tsx` của route không làm được việc này ở mọi lúc: nó chỉ vẽ
         * tức thì khi route đã được prefetch, mà Next tắt prefetch khi chạy dev
         * (`next/dist/client/app-dir/link.js`: nhánh `NODE_ENV ===
         * 'development'` → return). Lần đầu vào một route ở dev, server còn
         * phải compile trước khi gửi được byte nào — đo trên máy này: Giao Dịch
         * 10.5s, Stock 4.1s, lần sau ~0.4s. Suốt khoảng đó trang cũ đứng im.
         *
         * `pt-[4.5rem]` = header h-14 + `p-4` của `<DashboardMain>`, nên
         * skeleton bắt đầu đúng chỗ nội dung thật. z-10 nằm dưới header và
         * thanh này (cùng z-20), nên chỉ phần nội dung bị che. Khi trang mới commit, lớp phủ
         * biến mất và nhường cho `loading.tsx` hoặc nhánh `isLoading` của trang
         * — cùng một skeleton, nên mắt không thấy chỗ nối.
         *
         * Chỉ trên mobile, cùng phạm vi với chính thanh điều hướng này.
         */
        <div
          aria-busy="true"
          className="fixed inset-0 z-10 flex flex-col gap-4 overflow-hidden bg-background p-4 pt-[4.5rem] pb-24 md:hidden"
        >
          {SKELETON_FOR[overlayHref]}
        </div>
      )}

      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-20 border-t bg-background md:hidden",
          // Keeps the row clear of the iOS home indicator.
          "pb-[env(safe-area-inset-bottom)]"
        )}
      >
        <div className="grid grid-cols-5 items-end">
          {LEFT_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              active={isActive(item.href)}
              onPendingChange={handlePendingChange}
            />
          ))}

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={newTransaction.onOpen}
              aria-label="Thêm giao dịch"
              className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
            >
              <PlusIcon className="size-6" />
            </button>
          </div>

          {RIGHT_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              active={isActive(item.href)}
              onPendingChange={handlePendingChange}
            />
          ))}
        </div>
      </nav>
    </>
  );
}

type NavItemProps = {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onPendingChange: (href: string, pending: boolean) => void;
};

function NavItem({ href, label, icon, active, onPendingChange }: NavItemProps) {
  return (
    <Link
      href={PREFIX_URL + href}
      // Chỉ còn icon nên tên của mục phải nằm ở đây, không thì trình đọc màn
      // hình chỉ đọc được "link".
      aria-label={label}
      aria-current={active ? "page" : undefined}
      // h-16 giữ nguyên dù đã bỏ chữ: <DashboardMain> chừa đúng
      // `4rem + 1px + safe-area` ở đáy cho thanh này, đổi chiều cao là nội
      // dung cuối trang bị che hoặc hở ra một khoảng.
      className="flex h-16 items-center justify-center"
    >
      <NavItemContent
        href={href}
        icon={icon}
        active={active}
        onPendingChange={onPendingChange}
      />
    </Link>
  );
}

/**
 * Tách thành component riêng vì `useLinkStatus` chỉ đọc được trạng thái của
 * `<Link>` BAO NGOÀI nó — gọi thẳng trong NavItem thì không có Link cha nào.
 *
 * `pending` là tín hiệu chính xác nhất Next có: bật ngay khi chạm, tắt khi
 * trang mới commit hoặc khi điều hướng bị huỷ (chạm sang mục khác). Nhờ vậy
 * lớp phủ skeleton không bao giờ kẹt lại mà không cần tới hẹn giờ nào.
 *
 * Chỉ icon — không chữ, không spinner. Mục vừa chạm sáng lên như mục đang
 * active, để thanh điều hướng khớp với skeleton của trang đích đang hiện —
 * không thì skeleton là "Giao Dịch" mà thanh vẫn sáng "Tổng Quan". Icon lên
 * size-6 vì không còn nhãn đi kèm để nhận diện.
 */
function NavItemContent({
  href,
  icon: Icon,
  active,
  onPendingChange,
}: Omit<NavItemProps, "label">) {
  const { pending } = useLinkStatus();

  useEffect(() => {
    onPendingChange(href, pending);
  }, [href, pending, onPendingChange]);

  const selected = active || pending;

  return (
    <Icon
      aria-hidden
      className={cn(
        "size-6",
        selected ? "text-foreground" : "text-muted-foreground"
      )}
      strokeWidth={selected ? 2.25 : 1.75}
    />
  );
}
