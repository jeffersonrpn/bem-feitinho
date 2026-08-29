import type {
  Money,
  PricingBreakdown,
  PricingResult,
} from "./types";

export function toCents(value: number): Money {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100);
}

export function fromCents(value: Money): number {
  return value / 100;
}

export function addMoney(...values: Money[]): Money {
  return values.reduce((total, value) => total + value, 0);
}

export function multiplyMoney(
  value: Money,
  multiplier: number,
): Money {
  if (!Number.isFinite(multiplier)) {
    return 0;
  }

  return Math.round(value * multiplier);
}

export function calculateMargin(
  cost: Money,
  margin: number,
): Money {
  if (margin <= 0) {
    return cost;
  }

  if (margin >= 1) {
    throw new Error("Profit margin must be lower than 100%.");
  }

  return Math.round(cost / (1 - margin));
}

export function optionalNumber(
  value: unknown,
): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : undefined;
}

export function numberOrZero(value: unknown): number {
  return optionalNumber(value) ?? 0;
}
