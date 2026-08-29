import {
  calculateTattooPrice,
} from "./tattoo/calculator";

export const calculatorEngines = {
  tattoo: calculateTattooPrice,
} as const;
