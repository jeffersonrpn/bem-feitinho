export const PENDING_CALCULATION_KEY = "bem-feitinho:pending-calculation";

export type PendingCalculation = {
  calculatorId: string;
  values: Record<string, unknown>;
  adjustedTotal: number;
};
