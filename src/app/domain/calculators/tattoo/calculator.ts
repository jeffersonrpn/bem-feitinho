import { PricingResult, PricingAdjustment } from "../types";
import {
  addMoney,
  calculateMargin,
  multiplyMoney,
  toCents,
} from "../engine";
import { TattooInput } from "./types";
import {
  tattooBodyParts,
  tattooDesigns,
  tattooStyles
} from "./config";

function getBodyPartOption(
  bodyPart?: string,
) {
  return tattooBodyParts.find(
    (item) => item.id === bodyPart,
  );
}

function getDesignOption(
  design?: TattooInput["design"],
) {
  return tattooDesigns.find(
    (item) => item.id === design,
  );
}

function getStyleOption(
  style?: TattooInput["style"],
) {
  return tattooStyles.find(
    (item) => item.id === style,
  );
}

function getBodyPartMultiplier(
  bodyPart?: string,
): number {
  const option = tattooBodyParts.find(
    (item) => item.id === bodyPart,
  );

  if (!option) {
    return 1;
  }

  return 1 + (option.complexity - 1) * 0.1;
}

function getDesignMultiplier(
  design?: TattooInput["design"],
): number {
  const option = tattooDesigns.find(
    (item) => item.id === design,
  );

  return option?.multiplier ?? 1;
}

function getStyleMultiplier(
  style?: TattooInput["style"],
): number {
  const option = tattooStyles.find(
    (item) => item.id === style,
  );

  return option?.multiplier ?? 1;
}

function calculateFees(
  base: number,
  fees: TattooInput["fees"],
): number {
  if (!fees?.length) {
    return 0;
  }

  return fees.reduce((total, fee) => {
    if (fee.type === "fixed") {
      return total + toCents(fee.value);
    }

    return total + Math.round(base * (fee.value / 100));
  }, 0);
}

export function calculateTattooPrice(
  input: TattooInput,
): PricingResult {
  const materials = toCents(input.materials ?? 0);

  const sessions = input.sessions ?? 0;
  const hoursPerSession = input.hoursPerSession ?? 0;
  const hourlyRate = toCents(input.hourlyRate ?? 0);

  const totalHours = sessions * hoursPerSession;

  const baseLabor = multiplyMoney(
    hourlyRate,
    totalHours,
  );

  const adjustments: PricingAdjustment[] = [];

  /*
  * Body part
  */
  const bodyPart = getBodyPartOption(
    input.bodyPart,
  );

  if (bodyPart && bodyPart.complexity > 1) {
    const multiplier =
      1 + (bodyPart.complexity - 1) * 0.1;

    const amount =
      multiplyMoney(baseLabor, multiplier) -
      baseLabor;

    adjustments.push({
      id: "body-complexity",
      label: `Complexidade: ${bodyPart.label}`,
      multiplier,
      amount,
    });
  }

  /*
   * Design
   */
  const design = getDesignOption(
    input.design,
  );

  if (
    design &&
    design.multiplier !== undefined &&
    design.multiplier !== 1
  ) {
    const amount =
      multiplyMoney(
        baseLabor,
        design.multiplier,
      ) - baseLabor;

    adjustments.push({
      id: "design",
      label: design.label,
      multiplier: design.multiplier,
      amount,
    });
  }

  /*
   * Style
   */
  const style = getStyleOption(
    input.style,
  );

  if (
    style &&
    style.multiplier !== undefined &&
    style.multiplier !== 1
  ) {
    const amount =
      multiplyMoney(
        baseLabor,
        style.multiplier,
      ) - baseLabor;

    adjustments.push({
      id: "style",
      label: style.label,
      multiplier: style.multiplier,
      amount,
    });
  }

  /*
   * Current MVP behavior:
   *
   * All multipliers are calculated independently
   * against the base labor.
   *
   * The combined adjustment is applied to the
   * base labor below.
   */
  const combinedMultiplier =
    adjustments.reduce(
      (multiplier, adjustment) =>
        multiplier * adjustment.multiplier,
      1,
    );

  const labor = multiplyMoney(
    baseLabor,
    combinedMultiplier,
  );

  /*
   * The detailed adjustment amounts need to
   * represent their cumulative effect.
   *
   * Recalculate them sequentially so the
   * breakdown adds up to the final labor value.
   */
  let adjustmentBase = baseLabor;

  for (const adjustment of adjustments) {
    const adjustedValue =
      multiplyMoney(
        adjustmentBase,
        adjustment.multiplier,
      );

    adjustment.amount =
      adjustedValue - adjustmentBase;

    adjustmentBase = adjustedValue;
  }

  const indirectCosts = toCents(
    input.indirectCosts ?? 0,
  );

  const subtotal = addMoney(
    labor,
    materials,
    indirectCosts,
  );

  const fees = calculateFees(
    subtotal,
    input.fees,
  );

  const costBeforeProfit = addMoney(
    subtotal,
    fees,
  );

  const margin =
    (input.profitMargin ?? 0) / 100;

  const total = calculateMargin(
    costBeforeProfit,
    margin,
  );

  const profit =
    total - costBeforeProfit;

  return {
    total,
    subtotal: costBeforeProfit,
    breakdown: {
      labor,
      materials,
      indirectCosts,
      fees,
      profit,
      adjustments,
    },
  };
}
