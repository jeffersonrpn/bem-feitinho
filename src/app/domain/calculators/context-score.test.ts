import { describe, expect, it } from "vitest";

import { applyContextScore } from "./context-score";
import { calculateCrochetPrice } from "./crochet/calculator";
import { calculateTattooPrice } from "./tattoo/calculator";
import type {
  ContextScoringConfig,
  HistoricalCalculation,
  PricingResult,
} from "./types";

const config: ContextScoringConfig = {
  calculatorVersion: 1,
  currency: "BRL",
  fields: [
    { id: "sizeCm", type: "number", weight: 1, minimumScale: 0.5 },
    { id: "bodyPart", type: "category", weight: 1 },
  ],
  minimumCoverage: 0.8,
  maximumDistance: 0.45,
  maximumPeers: 10,
  minimumPeers: 3,
  calibrationFactor: 0.25,
};

function createResult(suggestedTotal: number): PricingResult {
  return {
    total: suggestedTotal,
    subtotal: 0,
    suggestedTotal,
    breakdown: {
      baseLabor: 0,
      labor: 0,
      complexityScore: 1,
      effortMultiplier: 1,
      referenceHourlyRate: 5000,
      materials: 0,
      indirectCosts: 0,
      fees: { total: 0, items: [] },
      profit: suggestedTotal,
      adjustments: [],
    },
  };
}

function createHistory(prices: number[]): HistoricalCalculation[] {
  return prices.map((suggestedTotal) => ({
    inputSnapshot: { sizeCm: 20, bodyPart: "thigh" },
    suggestedTotal,
    currency: "BRL",
    calculatorVersion: 1,
  }));
}

describe("context score", () => {
  it("calculates a positive sample z-score and calibrates toward the peer mean", () => {
    const result = applyContextScore(
      createResult(22000),
      { sizeCm: 20, bodyPart: "thigh" },
      createHistory([18000, 20000, 22000]),
      config,
    );

    expect(result.contextScore).toEqual({
      status: "available",
      score: 1,
      meanPrice: 20000,
      standardDeviation: 2000,
      peerCount: 3,
      basePrice: 22000,
      suggestedPrice: 21500,
    });
    expect(result.total).toBe(21500);
  });

  it.each([
    { basePrice: 20000, expectedScore: 0, expectedPrice: 20000 },
    { basePrice: 18000, expectedScore: -1, expectedPrice: 18500 },
  ])(
    "reports score $expectedScore when the base price is $basePrice cents",
    ({ basePrice, expectedScore, expectedPrice }) => {
      const result = applyContextScore(
        createResult(basePrice),
        { sizeCm: 20, bodyPart: "thigh" },
        createHistory([18000, 20000, 22000]),
        config,
      );

      expect(result.contextScore).toMatchObject({
        status: "available",
        score: expectedScore,
        suggestedPrice: expectedPrice,
      });
    },
  );

  it("reselects peers when a categorical attribute changes", () => {
    const history = [
      ...createHistory([18000, 20000, 22000]),
      ...[20000, 22000, 24000].map((suggestedTotal) => ({
        inputSnapshot: { sizeCm: 20, bodyPart: "arm" },
        suggestedTotal,
        currency: "BRL",
        calculatorVersion: 1,
      })),
    ];

    const result = applyContextScore(
      createResult(26000),
      { sizeCm: 20, bodyPart: "arm" },
      history,
      config,
    );

    expect(result.contextScore).toMatchObject({
      status: "available",
      score: 2,
      meanPrice: 22000,
      peerCount: 3,
      suggestedPrice: 25000,
    });
  });

  it("does not calibrate when there are too few peers", () => {
    const baseResult = createResult(22000);
    const result = applyContextScore(
      baseResult,
      { sizeCm: 20, bodyPart: "thigh" },
      createHistory([18000, 20000]),
      config,
    );

    expect(result.contextScore).toMatchObject({
      status: "unavailable",
      reason: "insufficient-peers",
      peerCount: 2,
    });
    expect(result.total).toBe(baseResult.total);
  });

  it("does not calculate a score when peer prices have zero variance", () => {
    const result = applyContextScore(
      createResult(22000),
      { sizeCm: 20, bodyPart: "thigh" },
      createHistory([20000, 20000, 20000]),
      config,
    );

    expect(result.contextScore).toMatchObject({
      status: "unavailable",
      reason: "zero-variance",
      peerCount: 3,
    });
    expect(result.total).toBe(22000);
  });

  it("ignores samples with an incompatible version or currency", () => {
    const history = [
      ...createHistory([18000, 20000]),
      {
        ...createHistory([22000])[0],
        currency: "USD",
      },
      {
        ...createHistory([22000])[0],
        calculatorVersion: 2,
      },
    ];

    const result = applyContextScore(
      createResult(22000),
      { sizeCm: 20, bodyPart: "thigh" },
      history,
      config,
    );

    expect(result.contextScore).toMatchObject({
      status: "unavailable",
      reason: "insufficient-peers",
      peerCount: 2,
    });
  });

  it("applies context scoring to tattoo prices", () => {
    const input = {
      sizeCm: 20,
      complexity: 3,
      bodyPart: "thigh",
      design: "original" as const,
      style: "black" as const,
      sessions: 2,
      hoursPerSession: 1,
      profitMargin: 20,
    };
    const basePrice = calculateTattooPrice(input).suggestedTotal;
    const history = [basePrice - 4000, basePrice - 2000, basePrice].map(
      (suggestedTotal) => ({
        inputSnapshot: input,
        suggestedTotal,
        currency: "BRL",
        calculatorVersion: 1,
      }),
    );

    const result = calculateTattooPrice(input, history);

    expect(result.contextScore).toMatchObject({
      status: "available",
      score: 1,
      basePrice,
      suggestedPrice: basePrice - 500,
    });
  });

  it("applies context scoring to crochet prices", () => {
    const input = {
      sizeCm: 20,
      complexity: 3,
      design: "original" as const,
      style: "basic" as const,
      totalTime: 5,
      profitMargin: 20,
    };
    const basePrice = calculateCrochetPrice(input).suggestedTotal;
    const history = [basePrice - 4000, basePrice - 2000, basePrice].map(
      (suggestedTotal) => ({
        inputSnapshot: input,
        suggestedTotal,
        currency: "BRL",
        calculatorVersion: 1,
      }),
    );

    const result = calculateCrochetPrice(input, history);

    expect(result.contextScore).toMatchObject({
      status: "available",
      score: 1,
      basePrice,
      suggestedPrice: basePrice - 500,
    });
  });
});
