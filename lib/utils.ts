import { currencyConfig } from "@/config/constant";
import { clsx, type ClassValue } from "clsx";
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";
import { twMerge } from "tailwind-merge";
import { vi, enUS } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertAmountFromMiliunits(amount: number) {
  return amount / 1000;
}

export function convertAmountToMiliunits(amount: number) {
  return Math.round(amount * 1000);
}

function getCookie(name: string): string | null {
  const match =
    typeof window !== "undefined" &&
    document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000); // Default expiry is 7 days
  const expiresStr = `expires=${expires.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; ${expiresStr}; path=/`;
}

export function formatCurrency(value: number) {
  const currency = getCookie("currency") || "USD";
  const config = currencyConfig[currency];

  return Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: config.fractionDigits,
  }).format(value);
}

export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return previous === current ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

export function fillMissingDays(
  activeDays: {
    date: Date;
    income: number;
    expenses: number;
  }[],
  startDate: Date,
  endDate: Date
) {
  if (activeDays.length === 0) {
    return [];
  }
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const transactionByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));
    if (found) {
      return found;
    } else {
      return { date: day, income: 0, expenses: 0 };
    }
  });

  return transactionByDay;
}

export const getLocale = () => {
  const locale = getCookie("locale");
  if (locale === "vi") {
    return {
      locale: vi,
      formatString: "dd LLL",
      formatStringFull: "dd LLL, y",
      formatNormal: "dd MMMM, yyyy",
    };
  }
  return {
    locale: enUS,
    formatString: "LLL dd",
    formatStringFull: "LLL dd, y",
    formatNormal: "dd MMMM, yyyy",
  };
};

type Period = {
  from: string | Date | undefined;
  to: string | Date | undefined;
};
export function formatDateRange(period?: Period) {
  const { locale, formatString, formatStringFull } = getLocale();
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  if (!period?.from) {
    return `${format(defaultFrom, formatString, { locale })} - ${format(
      defaultTo,
      formatStringFull,
      { locale }
    )}`;
  }
  if (period.to) {
    return `${format(period.from, formatString, { locale })} - ${format(
      period.to,
      formatStringFull,
      { locale }
    )}`;
  }
  return format(period.from, formatStringFull, { locale });
}

export function formatPercentage(
  value: number,
  options: { addPrefix?: boolean } = {
    addPrefix: false,
  }
) {
  const result = new Intl.NumberFormat("en-US", {
    style: "percent",
  }).format(value / 100);

  if (options.addPrefix && value > 0) {
    return `+${result}`;
  }

  return result;
}
