"use client";

import { useEffect, useState, useRef } from "react";
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
  saveCalculation,
} from "@/app/actions/calculator";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  PENDING_CALCULATION_KEY,
  type PendingCalculation,
} from "@/lib/pending-calculation";

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
  const [formValues, setFormValues] =
    useState<Record<string, unknown>>();
  const [saveStatus, setSaveStatus] =
    useState<"saving" | "saved">();
  const [saveError, setSaveError] =
    useState<string>();

  const formRef = useRef<{ submit: () => void }>(null);

  useEffect(() => {
    const pendingValue = sessionStorage.getItem(
      PENDING_CALCULATION_KEY,
    );

    if (!pendingValue) {
      return;
    }

    async function restoreAndSave() {
      try {
        const pending = JSON.parse(
          pendingValue!,
        ) as PendingCalculation;
        const calculator = calculators.find(
          (item) => item.id === pending.calculatorId,
        );

        if (!calculator) {
          throw new Error("Calculadora não encontrada.");
        }

        setSaveStatus("saving");
        const calculated = await calculatePrice(
          pending.calculatorId,
          pending.values,
        );

        setSelectedCalculator(calculator);
        setFormValues(pending.values);
        setResult(calculated);
        setAdjustedTotal(pending.adjustedTotal);
        setActiveStep(2);

        await saveCalculation(
          pending.calculatorId,
          pending.values,
          pending.adjustedTotal,
        );

        sessionStorage.removeItem(PENDING_CALCULATION_KEY);
        setSaveStatus("saved");
      } catch {
        setSaveStatus(undefined);
        setSaveError("Não foi possível concluir o salvamento.");
      }
    }

    void restoreAndSave();
  }, [calculators]);

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
    setFormValues(values);
    setAdjustedTotal(undefined);
    setSaveStatus(undefined);
    setSaveError(undefined);
    setActiveStep(2);
  }

  function handleRestart() {
    setSelectedCalculator(
      undefined,
    );

    setResult(undefined);
    setFormValues(undefined);
    setAdjustedTotal(undefined);
    setSaveStatus(undefined);
    setSaveError(undefined);
    setActiveStep(0);
  }

  function handleBack() {
    setActiveStep(
      (current) =>
        Math.max(0, current - 1),
    );
  }

  async function handleSave() {
    if (!selectedCalculator || !result || !formValues) {
      return;
    }

    setSaveError(undefined);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const finalTotal = adjustedTotal ?? result.total / 100;

      if (!user) {
        const pending: PendingCalculation = {
          calculatorId: selectedCalculator.id,
          values: formValues,
          adjustedTotal: finalTotal,
        };

        sessionStorage.setItem(
          PENDING_CALCULATION_KEY,
          JSON.stringify(pending),
        );

        const callbackUrl = new URL(
          "/auth/callback",
          window.location.origin,
        );
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: callbackUrl.toString() },
        });

        if (error) {
          throw error;
        }
        return;
      }

      setSaveStatus("saving");
      await saveCalculation(
        selectedCalculator.id,
        formValues,
        finalTotal,
      );
      setSaveStatus("saved");
    } catch {
      setSaveStatus(undefined);
      setSaveError("Não foi possível salvar este cálculo.");
    }
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
            adjustedTotal={adjustedTotal}
            onAdjustedTotalChange={
              setAdjustedTotal
            }
            onSave={handleSave}
            saveStatus={saveStatus}
            saveError={saveError}
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

