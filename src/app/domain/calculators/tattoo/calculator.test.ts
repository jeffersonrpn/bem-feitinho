import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateTattooPrice,
} from "./calculator";

describe("Tattoo Calculator", () => {
  it("calculates labor from sessions and hours", () => {
    const result = calculateTattooPrice({
      sessions: 2,
      hoursPerSession: 3,
      hourlyRate: 50,
    });

    expect(result.breakdown.labor).toBe(30000);
  });

  it("accepts optional fields", () => {
    const result = calculateTattooPrice({
      materials: 50,
    });

    expect(result.breakdown.materials).toBe(5000);
    expect(result.total).toBe(5000);
  });

  it("calculates profit margin correctly", () => {
    const result = calculateTattooPrice({
      materials: 100,
      profitMargin: 30,
    });

    expect(result.total).toBe(14286);
  });

  it("calculates fixed fees", () => {
    const result = calculateTattooPrice({
      materials: 100,
      fees: [
        {
          type: "fixed",
          value: 10,
        },
      ],
    });

    expect(result.breakdown.fees).toBe(1000);
    expect(result.total).toBe(11000);
  });

  it("calculates percentage fees", () => {
    const result = calculateTattooPrice({
      materials: 100,
      fees: [
        {
          type: "percentage",
          value: 10,
        },
      ],
    });

    expect(result.breakdown.fees).toBe(1000);
  });

  it("returns detailed pricing adjustments", () => {
    const result = calculateTattooPrice({
      sessions: 2,
      hoursPerSession: 3,
      hourlyRate: 50,
      bodyPart: "ribs",
      design: "original",
      style: "black-shading",
    });

    expect(result.breakdown.adjustments).toHaveLength(3);

    expect(
      result.breakdown.adjustments[0],
    ).toMatchObject({
      id: "body-complexity",
      label: "Complexidade: Costela",
      multiplier: 1.2,
      amount: 6000,
    });

    expect(
      result.breakdown.adjustments[1],
    ).toMatchObject({
      id: "design",
      label: "Desenho original",
      multiplier: 1.35,
    });

    expect(
      result.breakdown.adjustments[2],
    ).toMatchObject({
      id: "style",
      label: "Preto & sombreado",
      multiplier: 1.1,
    });
  });

  it("breakdown adjustments match the final labor", () => {
    const result = calculateTattooPrice({
      sessions: 2,
      hoursPerSession: 3,
      hourlyRate: 50,
      bodyPart: "ribs",
      design: "original",
      style: "black-shading",
    });

    const baseLabor = result.breakdown.baseLabor;

    const adjustmentsTotal =
      result.breakdown.adjustments.reduce(
        (total, adjustment) =>
          total + adjustment.amount,
        0,
      );

    expect(
      baseLabor + adjustmentsTotal,
    ).toBe(
      result.breakdown.labor,
    );
  });
});
