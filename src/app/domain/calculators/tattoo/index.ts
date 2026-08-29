import type {
    PricingResult,
} from "../types";

import {
    addMoney,
    calculateMargin,
    multiplyMoney,
    toCents,
} from "../engine";

import {
    tattooBodyParts,
    tattooDesigns,
    tattooStyles,
} from "./config";

import type {
    TattooInput,
} from "./types";

import type {
    CalculatorConfig,
} from "../types";

import {
    calculateTattooPrice,
} from "./calculator";

import {
    tattooFields,
} from "./config";

export const tattooCalculator: CalculatorConfig<TattooInput> = {
    id: "tattoo",

    name: "Tatuagem",

    description:
        "Calcule um preço sugerido para seu trabalho de tatuagem.",

    fields: tattooFields,

    pricing: {
        calculate: calculateTattooPrice,
    },
};
