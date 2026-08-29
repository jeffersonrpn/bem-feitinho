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

describe("calculator engine", () => {
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