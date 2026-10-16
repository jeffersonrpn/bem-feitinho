export type Money = number;

export type CalculatorFieldOption<T extends string = string> = {
  id: T;
  label: string;
  multiplier?: number;
  value?: number;
};

export type Fee =
  | {
    type: "fixed";
    value: number;
  }
  | {
    type: "percentage";
    value: number;
  };

export type CalculatorFieldType =
  | "number"
  | "currency"
  | "select"
  | "percentage"
  | "fee-list";

export type CalculatorFieldMultiplier =
  | {
      type: "linear";
      base: number;
      step: number;
      referenceValue: number;
    }
  | {
      type: "margin";
      percentageBase: number;
    };

export type CalculatorField = {
  id: string;
  label: string;
  type: CalculatorFieldType;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: CalculatorFieldOption[];
  multiplier?: CalculatorFieldMultiplier;
  calculationHint?: string;
};

export type PricingInput = Record<string, unknown>;

export type ContextSimilarityField = {
  id: string;
  type: "number" | "category";
  weight: number;
  minimumScale?: number;
};

export type ContextScoringConfig = {
  calculatorVersion: number;
  currency: string;
  fields: ContextSimilarityField[];
  minimumCoverage: number;
  maximumDistance: number;
  maximumPeers: number;
  minimumPeers: number;
  calibrationFactor: number;
};

export type HistoricalCalculation = {
  inputSnapshot: PricingInput;
  suggestedTotal: Money;
  currency: string;
  calculatorVersion: number;
};

export type ContextScore =
  | {
      status: "available";
      score: number;
      meanPrice: Money;
      standardDeviation: number;
      peerCount: number;
      basePrice: Money;
      suggestedPrice: Money;
    }
  | {
      status: "unavailable";
      reason:
        | "no-comparable-attributes"
        | "no-neighbors"
        | "insufficient-peers"
        | "zero-variance"
        | "history-unavailable";
      peerCount: number;
      basePrice: Money;
    };

export type PricingAdjustment = {
  id: string;
  label: string;
  multiplier: number;
  amount: Money;
};

export type PricingFee = {
  label: string;
  type: "fixed" | "percentage";
  rate?: number;
  amount: number;
};

export type PricingBreakdown = {
  baseLabor: Money;
  labor: Money;
  complexityScore: number;
  effortMultiplier: number;
  referenceHourlyRate: Money;
  materials: Money;
  indirectCosts: Money;
  fees: {
    total: number;
    items: PricingFee[];
  };
  profit: Money;
  adjustments: PricingAdjustment[];
};

export type PricingResult = {
  total: Money;
  subtotal: Money;
  suggestedTotal: Money;
  breakdown: PricingBreakdown;
  contextScore?: ContextScore;
};

export type PricingConfig<TInput extends PricingInput = PricingInput> = {
  calculate: (input: TInput) => PricingResult;
};

export type CalculatorConfig = {
  id: string;
  name: string;
  description: string;
  fields: CalculatorField[];
  contextScoring: ContextScoringConfig;
};
