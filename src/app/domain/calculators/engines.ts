import {
  calculateTattooPrice,
} from "./tattoo/calculator";
import {
  calculateCrochetPrice,
} from "./crochet/calculator";

export const calculatorEngines = {
  tattoo: calculateTattooPrice,
  crochet: calculateCrochetPrice,
} as const;
