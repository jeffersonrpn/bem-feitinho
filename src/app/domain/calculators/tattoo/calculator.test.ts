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
});
