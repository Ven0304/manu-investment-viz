import type { MonetaryAmount } from "@/data/manu-report.schema";

const unitSuffix = {
  million: "m",
  billion: "bn",
} as const;

export function formatMoney(amount: MonetaryAmount): string {
  const value = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(amount.value);
  const suffix = amount.unit ? unitSuffix[amount.unit] : "";

  return `${amount.currency} ${value}${suffix}`;
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}
