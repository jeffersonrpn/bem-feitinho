export type Money = number;

export type CalculatorFieldOption<T extends string = string> = {
  id: T;
  label: string;
  multiplier?: number;
  value?: number;
};

export type CalculatorFieldType =
  | "number"
  | "currency"
  | "select"
  | "percentage";

export type CalculatorField = {
  id: string;
  label: string;
  type: CalculatorFieldType;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: CalculatorFieldOption[];
};

export type PricingInput = Record<string, unknown>;

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
  breakdown: PricingBreakdown;
};

export type PricingConfig<TInput extends PricingInput = PricingInput> = {
  calculate: (input: TInput) => PricingResult;
};

export type CalculatorConfig<
  TInput extends PricingInput = PricingInput,
> = {
  id: string;
  name: string;
  description: string;
  fields: CalculatorField[];
};
