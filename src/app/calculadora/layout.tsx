"use client";

import type { ReactNode } from "react";

import { calculators } from "@/domain/calculators";
import { CalculatorFlow } from "@/components/CalculatorFlow";

export default function CalculatorLayout({
  children: _children,
}: {
  children: ReactNode;
}) {
  return <CalculatorFlow calculators={calculators} />;
}
