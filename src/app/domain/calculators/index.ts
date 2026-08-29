import {
  tattooCalculator,
} from "./tattoo";

export const calculators = [
  tattooCalculator,
];

export function getCalculator(
  id: string,
) {
  return calculators.find(
    (calculator) => calculator.id === id,
  );
}
