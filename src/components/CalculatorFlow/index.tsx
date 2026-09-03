"use client";

import { useState, useRef } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Container,
  MobileStepper,
  Paper,
} from "@mui/material";
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';

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
  const [adjustedTotal, setAdjustedTotal] =
    useState<number | undefined>();

  const formRef = useRef<{ submit: () => void }>(null);

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
    setAdjustedTotal(undefined);
    setActiveStep(2);
  }

  function handleRestart() {
    setSelectedCalculator(
      undefined,
    );

    setResult(undefined);
    setAdjustedTotal(undefined);
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
      <Box sx={{ minHeight: '78vh', marginBottom: '6rem' }}>
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
              ref={formRef}
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
            adjustedTotal={adjustedTotal}
            onAdjustedTotalChange={
              setAdjustedTotal
            }
          />
        )}
      </Box>
      {activeStep > 0 && (
        <Paper sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 1000,
          borderRadius: `2rem`,
          margin: 2
        }} elevation={3}>
          {activeStep === 1 && (
            <BottomNavigation showLabels={false} sx={{ borderRadius: `2rem` }}>
              <BottomNavigationAction label="Voltar" icon={<UndoRoundedIcon />} onClick={handleBack} />
              <BottomNavigationAction label="Calcular" icon={<TaskAltRoundedIcon />} onClick={() => formRef.current?.submit()} />
            </BottomNavigation>
          )}
          {activeStep === 2 && (
            <BottomNavigation showLabels={false} sx={{ borderRadius: `2rem` }}>
              <BottomNavigationAction label="Voltar" icon={<UndoRoundedIcon />} onClick={handleRestart} />
            </BottomNavigation>
          )}
        </Paper>
      )}
    </Container>
  );
}
