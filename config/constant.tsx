import packageInfo from "../package.json";

export const appConfig = { version: packageInfo.version };

export const currencyConfig = {
  USD: { locale: "en-US", currency: "USD", fractionDigits: 2, prefix: "$ " },
  VND: { locale: "vi-VN", currency: "VND", fractionDigits: 0, suffix: " VND" },
  EUR: { locale: "de-DE", currency: "EUR", fractionDigits: 2 },
  JPY: { locale: "ja-JP", currency: "JPY", fractionDigits: 0 },
} as {
  [key: string]: {
    locale: string;
    currency: string;
    fractionDigits: number;
    prefix?: string;
    suffix?: string;
  };
};
