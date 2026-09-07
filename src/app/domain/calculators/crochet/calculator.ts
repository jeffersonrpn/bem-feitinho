import type {
  Fee,
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

const REFERENCE_HOURLY_RATE = 50;

import type {
  CrochetInput,
} from "./types";
import { crochetCalculator } from "./config";

function getField(fieldId: string) {
  const field = crochetCalculator.fields.find(
    (item) => item.id === fieldId,
  );

  if (!field) {
    throw new Error(`Campo de cálculo não encontrado: ${fieldId}.`);
  }

  return field;
}

function getOptionMultiplier(
  fieldId: string,
  optionId: string | undefined,
) {
  if (!optionId) {
    return 1;
  }

  return getField(fieldId).options?.find(
    (option) => option.id === optionId,
  )?.multiplier ?? 1;
}

function getLinearMultiplier(
  fieldId: string,
  value: number,
) {
  const field = getField(fieldId);
  const multiplier = field.multiplier;

  if (multiplier?.type !== "linear") {
    return 1;
  }

  if (
    !Number.isFinite(value) ||
    (field.min !== undefined && value < field.min) ||
    (field.max !== undefined && value > field.max)
  ) {
    throw new Error("Complexity must be between 1 and 10.");
  }

  return multiplier.base +
    (value - multiplier.referenceValue) * multiplier.step;
}

function getOptionalLinearMultiplier(
  fieldId: string,
  value: number | undefined,
) {
  return value === undefined
    ? 1
    : getLinearMultiplier(fieldId, value);
}

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
  input: CrochetInput,
): {
  baseLabor: Money;
  labor: Money;
  adjustments: PricingAdjustment[];
  complexityScore: number;
  effortMultiplier: number;
  referenceHourlyRate: Money;
} {
  const complexityScore = input.complexity;
  const effortMultiplier = getLinearMultiplier(
    "complexity",
    complexityScore,
  );
  const referenceHourlyRate = toCents(
    REFERENCE_HOURLY_RATE,
  );

  const totalTime = numberOrZero(input.totalTime);
  const baseLabor = multiplyMoney(
    referenceHourlyRate * totalTime,
    effortMultiplier,
  );

  const adjustments: PricingAdjustment[] =
    [];

  const totalTimeMultiplier = getOptionalLinearMultiplier(
    "totalTime",
    input.totalTime,
  );

  const totalTimeAdjustment = createAdjustment(
    "total-time",
    "Tempo total",
    totalTimeMultiplier,
    baseLabor,
  );

  if (totalTimeAdjustment) {
    adjustments.push(totalTimeAdjustment);
  }

  const totalTimeLabor = multiplyMoney(
    baseLabor,
    totalTimeMultiplier,
  );

  const sizeMultiplier = getOptionalLinearMultiplier(
    "sizeCm",
    input.sizeCm,
  );

  const sizeAdjustment = createAdjustment(
    "size",
    "Tamanho",
    sizeMultiplier,
    totalTimeLabor,
  );

  if (sizeAdjustment) {
    adjustments.push(sizeAdjustment);
  }

  const sizeLabor = multiplyMoney(
    totalTimeLabor,
    sizeMultiplier,
  );


  const designMultiplier = getOptionMultiplier(
    "design",
    input.design,
  );

  const designAdjustment =
    createAdjustment(
      "design",
      "Tipo de desenho",
      designMultiplier,
      sizeLabor,
    );

  if (designAdjustment) {
    adjustments.push(
      designAdjustment,
    );
  }

  const designLabor =
    multiplyMoney(
      sizeLabor,
      designMultiplier,
    );

  const styleMultiplier = getOptionMultiplier(
    "style",
    input.style,
  );

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
    complexityScore,
    effortMultiplier,
    referenceHourlyRate,
  };
}

function calculateFees(
  fees: Fee[] | undefined,
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

export function calculateCrochetPrice(
  input: CrochetInput,
): PricingResult {
  const {
    baseLabor,
    labor,
    adjustments,
    complexityScore,
    effortMultiplier,
    referenceHourlyRate,
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

  const marginMultiplier = getField("profitMargin").multiplier;
  const percentageBase = marginMultiplier?.type === "margin"
    ? marginMultiplier.percentageBase
    : 100;
  const margin = profitMargin / percentageBase;

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
    suggestedTotal: total,
    breakdown: {
      baseLabor,
      labor,
      complexityScore,
      effortMultiplier,
      referenceHourlyRate,
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
