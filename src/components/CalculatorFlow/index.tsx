"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  MobileStepper,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import type {
  CalculatorConfig,
  PricingResult,
} from "@/domain/calculators/types";
import {
  calculatePrice,
} from "@/app/actions/calculator";

import {
  CalculatorForm,
} from "./CalculatorForm";

import {
  CalculatorResult,
} from "./CalculatorResult";

import {
  CalculatorSelector,
} from "./CalculatorSelector";

type CalculatorFlowProps = {
  calculators: CalculatorConfig[];
};

export function CalculatorFlow({
  calculators,
}: CalculatorFlowProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCalculator, setSelectedCalculator] = useState<
    CalculatorConfig | undefined
  >();

  const [result, setResult] =
    useState<
      PricingResult | undefined
    >();

  function handleCalculatorSelect(
    calculator: CalculatorConfig,
  ) {
    setSelectedCalculator(
      calculator,
    );

    setActiveStep(1);
  }

  async function handleFormSubmit(
    values: Record<string, unknown>,
  ) {
    if (!selectedCalculator) {
      return;
    }

    const calculated = await calculatePrice(
      selectedCalculator.id,
      values,
    );

    setResult(calculated);
    setActiveStep(2);
  }

  function handleRestart() {
    setSelectedCalculator(
      undefined,
    );

    setResult(undefined);
    setActiveStep(0);
  }

  function handleBack() {
    setActiveStep(
      (current) =>
        Math.max(0, current - 1),
    );
  }

  return (
    <Container>
        <MobileStepper
          variant="dots"
          steps={3}
          position="static"
          activeStep={activeStep}
          sx={{ justifyContent: "center" }}
          slotProps={{
            progress: {
              'aria-label': 'stepper dotted progress',
            },
          }}
          nextButton={<></>}
          backButton={<></>}
        />
      {activeStep === 0 && (
        <CalculatorSelector
          calculators={calculators}
          onSelect={
            handleCalculatorSelect
          }
        />
      )}

      {activeStep === 1 &&
        selectedCalculator && (
          <CalculatorForm
            calculator={
              selectedCalculator
            }
            onSubmit={
              handleFormSubmit
            }
            onBack={handleBack}
          />
        )}

      {activeStep === 2 && result && (
        <CalculatorResult
          result={result}
          onRestart={
            handleRestart
          }
        />
      )}
    </Container>
  );
}
