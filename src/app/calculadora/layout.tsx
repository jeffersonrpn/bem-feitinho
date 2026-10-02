"use client";

import { calculators } from "@/domain/calculators";
import { CalculatorFlow } from "@/components/CalculatorFlow";

export default function CalculatorLayout() {
  return <CalculatorFlow calculators={calculators} />;
}
