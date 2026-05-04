export const DEFAULT_CURRENCY = "GHS";

const currencyLocaleMap: Record<string, string> = {
  GHS: "en-GH",
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
  NGN: "en-NG",
};

const resolveCurrency = (currency?: string) => currency || DEFAULT_CURRENCY;

export function formatCurrency(amount: number | string, currency?: string, options?: Intl.NumberFormatOptions) {
  const resolvedCurrency = resolveCurrency(currency);
  const value = Number(amount || 0);

  return new Intl.NumberFormat(currencyLocaleMap[resolvedCurrency] || "en-GH", {
    style: "currency",
    currency: resolvedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCompactCurrency(amount: number | string, currency?: string) {
  const resolvedCurrency = resolveCurrency(currency);
  const value = Number(amount || 0);

  return new Intl.NumberFormat(currencyLocaleMap[resolvedCurrency] || "en-GH", {
    style: "currency",
    currency: resolvedCurrency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);
}

export function parseCurrencyAmount(value: string) {
  const numeric = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}
