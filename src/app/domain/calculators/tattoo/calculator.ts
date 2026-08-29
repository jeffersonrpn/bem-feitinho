import { PricingResult } from "../types";
import {
    addMoney,
    calculateMargin,
    multiplyMoney,
    toCents,
} from "../engine";
import { TattooInput } from "./types";
import { tattooBodyParts, tattooDesigns, tattooStyles } from "./config";

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

    const bodyPartMultiplier =
        getBodyPartMultiplier(input.bodyPart);

    const designMultiplier =
        getDesignMultiplier(input.design);

    const styleMultiplier =
        getStyleMultiplier(input.style);

    const laborMultiplier =
        bodyPartMultiplier *
        designMultiplier *
        styleMultiplier;

    const labor = multiplyMoney(
        baseLabor,
        laborMultiplier,
    );

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

    const margin = (input.profitMargin ?? 0) / 100;

    const total = calculateMargin(
        costBeforeProfit,
        margin,
    );

    const profit = total - costBeforeProfit;

    const adjustments =
        total -
        labor -
        materials -
        indirectCosts -
        fees -
        profit;

    return {
        total,
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
