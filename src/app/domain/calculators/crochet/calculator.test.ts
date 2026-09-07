import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateCrochetPrice,
} from "./calculator";

describe("Crochet Calculator", () => {
  it("calculates labor from total time and complexity", () => {
    const result = calculateCrochetPrice({
      complexity: 3,
      totalTime: 2,
    });

    expect(result.breakdown.baseLabor).toBe(12000);
    expect(result.breakdown.labor).toBe(12000);
    expect(result.total).toBe(12000);
  });

  it("applies size, design, and style multipliers in sequence", () => {
    const result = calculateCrochetPrice({
      complexity: 1,
      totalTime: 2,
      sizeCm: 11,
      design: "original",
      style: "fantasy",
    });

    expect(result.breakdown.labor).toBe(25875);
    expect(result.breakdown.adjustments).toEqual([
      {
        id: "size",
        label: "Tamanho",
        multiplier: 1.5,
        amount: 5000,
      },
      {
        id: "design",
        label: "Tipo de desenho",
        multiplier: 1.5,
        amount: 7500,
      },
      {
        id: "style",
        label: "Cores e acabamento",
        multiplier: 1.15,
        amount: 3375,
      },
    ]);
  });

  it("adds direct costs and fixed and percentage fees", () => {
    const result = calculateCrochetPrice({
      complexity: 1,
      materials: 100,
      indirectCosts: 20,
      fees: [
        { type: "fixed", value: 10 },
        { type: "percentage", value: 10 },
      ],
    });

    expect(result.breakdown.fees).toEqual({
      total: 2200,
      items: [
        {
          label: "Taxa fixa 1",
          type: "fixed",
          amount: 1000,
        },
        {
          label: "Taxa percentual 2",
          type: "percentage",
          rate: 10,
          amount: 1200,
        },
      ],
    });
    expect(result.subtotal).toBe(14200);
    expect(result.total).toBe(14200);
  });

  it("applies the configured profit margin to the subtotal", () => {
    const result = calculateCrochetPrice({
      complexity: 1,
      materials: 100,
      profitMargin: 30,
    });

    expect(result.subtotal).toBe(10000);
    expect(result.total).toBe(14286);
    expect(result.breakdown.profit).toBe(4286);
  });

  it("uses neutral multipliers when optional criteria are absent", () => {
    const result = calculateCrochetPrice({
      complexity: 1,
      totalTime: 1,
    });

    expect(result.breakdown.adjustments).toEqual([]);
    expect(result.breakdown.effortMultiplier).toBe(1);
    expect(result.total).toBe(5000);
  });

  it("rejects complexity outside the configured range", () => {
    expect(() =>
      calculateCrochetPrice({
        complexity: 11,
      }),
    ).toThrow("Complexity must be between 1 and 10.");
  });
});
