import {
  addMoney,
  calculateMargin,
  fromCents,
  multiplyMoney,
  numberOrZero,
  optionalNumber,
  toCents,
} from "./engine";
import {
  describe,
  expect,
  it,
} from "vitest";
import type { TattooInput } from "./tattoo/types";

import { calculateTattooPrice } from "./tattoo/calculator";

describe("Calculator engine", () => {
  describe("Tattoo Calculator", () => {
    it("calculates a complete tattoo pricing scenario", () => {
      const input: TattooInput = {
        sizeCm: 12,
        bodyPart: "ribs" as const,
        design: "original" as const,
        style: "black-shading" as const,
        materials: 60,
        sessions: 2,
        hoursPerSession: 3,
        hourlyRate: 50,
        indirectCosts: 40,
        fees: [
          {
            type: "percentage" as const,
            value: 5,
          },
        ],
        profitMargin: 0,
      };

      const result = calculateTattooPrice(input);

      expect(result).toEqual({
        total: 67101,
        subtotal: 67101,
        breakdown: {
          baseLabor: 30000,
          labor: 53906,
          materials: 6000,
          indirectCosts: 4000,
          fees: {
            total: 3195,
            items: [
              {
                label: "Taxa percentual 1",
                type: "percentage",
                rate: 5,
                amount: 3195,
              },
            ],
          },

          profit: 0,

          adjustments: [
            {
              id: "body-part",
              label: "Complexidade da parte do corpo",
              multiplier: 1.25,
              amount: 7500,
            },
            {
              id: "design",
              label: "Tipo de desenho",
              multiplier: 1.25,
              amount: 9375,
            },
            {
              id: "style",
              label: "Cores e acabamento",
              multiplier: 1.15,
              amount: 7031,
            },
          ],
        },
      });
    });

    describe("currency helpers", () => {
      it("converts amounts to and from cents with rounding", () => {
        expect(toCents(12.345)).toBe(1235);
        expect(fromCents(1235)).toBe(12.35);
      });

      it("returns zero when converting a non-finite amount", () => {
        expect(toCents(Number.NaN)).toBe(0);
        expect(toCents(Number.POSITIVE_INFINITY)).toBe(0);
      });

      it("adds and multiplies monetary values", () => {
        expect(addMoney(100, 250, -50)).toBe(300);
        expect(multiplyMoney(105, 1.5)).toBe(158);
      });

      it("returns zero when multiplying by a non-finite value", () => {
        expect(multiplyMoney(100, Number.NaN)).toBe(0);
      });
    });

    describe("profit margins", () => {
      it("returns cost when the margin is zero or negative", () => {
        expect(calculateMargin(10000, 0)).toBe(10000);
        expect(calculateMargin(10000, -0.1)).toBe(10000);
      });

      it("calculates and rounds a positive margin", () => {
        expect(calculateMargin(10000, 0.3)).toBe(14286);
      });

      it("rejects a margin of 100 percent or more", () => {
        expect(() => calculateMargin(10000, 1)).toThrow(
          "Profit margin must be lower than 100%.",
        );
      });
    });

    describe("number parsing", () => {
      it("parses finite values and preserves zero", () => {
        expect(optionalNumber("12.5")).toBe(12.5);
        expect(optionalNumber(0)).toBe(0);
      });

      it("returns undefined for missing, empty, and invalid values", () => {
        expect(optionalNumber(undefined)).toBeUndefined();
        expect(optionalNumber(null)).toBeUndefined();
        expect(optionalNumber("")).toBeUndefined();
        expect(optionalNumber("invalid")).toBeUndefined();
      });

      it("uses zero when a value cannot be parsed", () => {
        expect(numberOrZero("invalid")).toBe(0);
        expect(numberOrZero("12.5")).toBe(12.5);
      });
    });
  });
});
