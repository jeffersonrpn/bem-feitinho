import type {
  Money,
  PricingAdjustment,
  PricingFee,
  PricingResult,
} from "../types";

import {
  addMoney,
  calculateMargin,
  multiplyMoney,
  numberOrZero,
  toCents,
} from "../engine";

import type {
  TattooFee,
  TattooInput,
} from "./types";

const BODY_PART_MULTIPLIERS: Record<
  string,
  number
> = {
  arm: 1,
  forearm: 1,
  hand: 1.25,
  leg: 1,
  thigh: 1,
  foot: 1.25,
  back: 1.1,
  chest: 1.1,
  ribs: 1.25,
  neck: 1.25,
  face: 1.5,
};

const DESIGN_MULTIPLIERS: Record<
  string,
  number
> = {
  ready: 1,
  original: 1.25,
  adjustment: 1.1,
};

const STYLE_MULTIPLIERS: Record<
  string,
  number
> = {
  black: 1,
  "black-shading": 1.15,
  color: 1.25,
  "black-color": 1.3,
};

function createAdjustment(
  id: string,
  label: string,
  multiplier: number,
  base: Money,
): PricingAdjustment | undefined {
  if (multiplier === 1) {
    return undefined;
  }

  return {
    id,
    label,
    multiplier,
    amount: multiplyMoney(
      base,
      multiplier - 1,
    ),
  };
}

function calculateLabor(
  input: TattooInput,
): {
  baseLabor: Money;
  labor: Money;
  adjustments: PricingAdjustment[];
} {
  const hourlyRate = toCents(
    numberOrZero(input.hourlyRate),
  );

  const sessions = numberOrZero(
    input.sessions,
  );

  const hoursPerSession =
    numberOrZero(
      input.hoursPerSession,
    );

  const totalHours =
    sessions * hoursPerSession;

  const baseLabor = Math.round(
    hourlyRate * totalHours,
  );

  const adjustments: PricingAdjustment[] =
    [];

  const bodyPartMultiplier =
    input.bodyPart
      ? BODY_PART_MULTIPLIERS[
      input.bodyPart
      ] ?? 1
      : 1;

  const bodyPartAdjustment =
    createAdjustment(
      "body-part",
      "Complexidade da parte do corpo",
      bodyPartMultiplier,
      baseLabor,
    );

  if (bodyPartAdjustment) {
    adjustments.push(
      bodyPartAdjustment,
    );
  }

  const bodyPartLabor =
    multiplyMoney(
      baseLabor,
      bodyPartMultiplier,
    );

  const designMultiplier =
    input.design
      ? DESIGN_MULTIPLIERS[
      input.design
      ] ?? 1
      : 1;

  const designAdjustment =
    createAdjustment(
      "design",
      "Tipo de desenho",
      designMultiplier,
      bodyPartLabor,
    );

  if (designAdjustment) {
    adjustments.push(
      designAdjustment,
    );
  }

  const designLabor =
    multiplyMoney(
      bodyPartLabor,
      designMultiplier,
    );

  const styleMultiplier =
    input.style
      ? STYLE_MULTIPLIERS[
      input.style
      ] ?? 1
      : 1;

  const styleAdjustment =
    createAdjustment(
      "style",
      "Cores e acabamento",
      styleMultiplier,
      designLabor,
    );

  if (styleAdjustment) {
    adjustments.push(
      styleAdjustment,
    );
  }

  const labor =
    multiplyMoney(
      designLabor,
      styleMultiplier,
    );

  return {
    baseLabor,
    labor,
    adjustments,
  };
}

function calculateFees(
  fees: TattooFee[] | undefined,
  base: Money,
): {
  total: Money;
  items: PricingFee[];
} {
  if (!fees?.length) {
    return {
      total: 0,
      items: [],
    };
  }

  const items: PricingFee[] =
    fees.map((fee, index) => {
      if (fee.type === "fixed") {
        return {
          label: `Taxa fixa ${index + 1}`,
          type: "fixed",
          amount: toCents(
            numberOrZero(fee.value),
          ),
        };
      }

      const rate =
        numberOrZero(fee.value);

      const amount = Math.round(
        base * (rate / 100),
      );

      return {
        label: `Taxa percentual ${index + 1}`,
        type: "percentage",
        rate,
        amount,
      };
    });

  const total = items.reduce(
    (sum, fee) =>
      addMoney(sum, fee.amount),
    0,
  );

  return {
    total,
    items,
  };
}

export function calculateTattooPrice(
  input: TattooInput,
): PricingResult {
  const {
    baseLabor,
    labor,
    adjustments,
  } = calculateLabor(input);

  const materials = toCents(
    numberOrZero(input.materials),
  );

  const indirectCosts = toCents(
    numberOrZero(
      input.indirectCosts,
    ),
  );

  /*
   * Fees are calculated after labor,
   * materials and indirect costs.
   *
   * Percentage fees therefore apply to
   * the operational cost of the tattoo.
   */
  const operationalCost = addMoney(
    labor,
    materials,
    indirectCosts,
  );

  const fees = calculateFees(
    input.fees,
    operationalCost,
  );

  const subtotal = addMoney(
    operationalCost,
    fees.total,
  );

  /*
   * TattooInput stores the profit margin
   * as a percentage:
   *
   * 30 => 30%
   *
   * calculateMargin expects a fraction:
   *
   * 0.30 => 30%
   */
  const profitMargin = numberOrZero(input.profitMargin);

  const margin = profitMargin / 100;

  /*
   * calculateMargin returns the final price
   * required to preserve the requested margin.
   *
   * Example:
   *
   * cost = R$ 100
   * margin = 30%
   *
   * price = 100 / (1 - 0.30)
   *       = R$ 142.86
   */
  const total = calculateMargin(subtotal, margin);

  const profit = Math.max(0, total - subtotal);

  return {
    total,
    subtotal,
    breakdown: {
      baseLabor,
      labor,
      materials,
      indirectCosts,
      fees: {
        total: fees.total,
        items: fees.items,
      },
      profit,
      adjustments,
    },
  };
}
