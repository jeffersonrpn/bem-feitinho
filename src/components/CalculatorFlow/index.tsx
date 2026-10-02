"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname, useRouter } from "next/navigation";
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

type StoredCalculatorFlow = {
  calculatorId: string;
  values: Record<string, unknown>;
  result: PricingResult;
  adjustedTotal?: number;
};

const CALCULATOR_FLOW_STATE_KEY = "bem-feitinho:calculator-flow";
const CALCULATOR_FLOW_STATE_EVENT = "bem-feitinho:calculator-flow-state-change";

function subscribeToCalculatorFlowState(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CALCULATOR_FLOW_STATE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CALCULATOR_FLOW_STATE_EVENT, onStoreChange);
  };
}

function getCalculatorFlowSnapshot() {
  return sessionStorage.getItem(CALCULATOR_FLOW_STATE_KEY);
}

function getServerCalculatorFlowSnapshot() {
  return null;
}

function storeCalculatorFlow(value: string) {
  sessionStorage.setItem(CALCULATOR_FLOW_STATE_KEY, value);
  window.dispatchEvent(new Event(CALCULATOR_FLOW_STATE_EVENT));
}

function clearCalculatorFlow() {
  sessionStorage.removeItem(CALCULATOR_FLOW_STATE_KEY);
  window.dispatchEvent(new Event(CALCULATOR_FLOW_STATE_EVENT));
}

function parseStoredCalculatorFlow(
  value: string | null,
): StoredCalculatorFlow | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as StoredCalculatorFlow;
  } catch {
    return undefined;
  }
}

export function CalculatorFlow({
  calculators,
}: CalculatorFlowProps) {
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
  const pathname = usePathname();
  const router = useRouter();
  const routeParts = pathname.split("/").filter(Boolean);
  const routeCalculatorId =
    routeParts[0] === "calculadora"
      ? routeParts[1]
      : undefined;
  const activeStep = pathname.endsWith("/resultado")
    ? 2
    : routeCalculatorId
      ? 1
      : 0;
  const selectedCalculator = calculators.find(
    (item) => item.id === routeCalculatorId,
  );
  const storedFlowValue = useSyncExternalStore(
    subscribeToCalculatorFlowState,
    getCalculatorFlowSnapshot,
    getServerCalculatorFlowSnapshot,
  );
  const storedFlow = parseStoredCalculatorFlow(storedFlowValue);
  const restoredFlow = activeStep === 2 &&
    storedFlow?.calculatorId === routeCalculatorId
    ? storedFlow
    : undefined;
  const currentResult = result ?? restoredFlow?.result;
  const currentFormValues = formValues ?? restoredFlow?.values;
  const currentAdjustedTotal = result
    ? adjustedTotal
    : restoredFlow?.adjustedTotal;

  useEffect(() => {
    if (!routeCalculatorId) {
      return;
    }

    const calculator = calculators.find(
      (item) => item.id === routeCalculatorId,
    );

    if (!calculator) {
      router.replace("/calculadora");
      return;
    }
  }, [calculators, routeCalculatorId, router]);

  useEffect(() => {
    if (storedFlowValue && !parseStoredCalculatorFlow(storedFlowValue)) {
      clearCalculatorFlow();
    }
  }, [storedFlowValue]);

  useEffect(() => {
    const pendingValue = sessionStorage.getItem(
      PENDING_CALCULATION_KEY,
    );

    if (!pendingValue) {
      return;
    }

    sessionStorage.removeItem(
      PENDING_CALCULATION_KEY,
    );

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

        setFormValues(pending.values);
        setResult(calculated);
        setAdjustedTotal(pending.adjustedTotal);
        router.replace(`/calculadora/${pending.calculatorId}/resultado`);

        await saveCalculation(
          pending.calculatorId,
          pending.values,
          pending.adjustedTotal,
          pending.projectName ?? "Projeto sem nome",
        );

        setSaveStatus("saved");
      } catch {
        setSaveStatus(undefined);
        setSaveError("Não foi possível concluir o salvamento.");
      }
    }

    void restoreAndSave();
  }, [calculators, router]);

  function handleCalculatorSelect(
    calculator: CalculatorConfig,
  ) {
    router.push(`/calculadora/${calculator.id}`);
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
    storeCalculatorFlow(
      JSON.stringify({
        calculatorId: selectedCalculator.id,
        values,
        result: calculated,
      }),
    );
    router.push(`/calculadora/${selectedCalculator.id}/resultado`);
  }

  function handleRestart() {
    setResult(undefined);
    setFormValues(undefined);
    setAdjustedTotal(undefined);
    setSaveStatus(undefined);
    setSaveError(undefined);
    clearCalculatorFlow();
    router.push("/calculadora");
  }

  function handleAdjustedTotalChange(value: number) {
    setAdjustedTotal(value);

    if (!selectedCalculator || !currentResult || !currentFormValues) {
      return;
    }

    storeCalculatorFlow(
      JSON.stringify({
        calculatorId: selectedCalculator.id,
        values: currentFormValues,
        result: currentResult,
        adjustedTotal: value,
      }),
    );
  }

  function handleBack() {
    router.push("/calculadora");
  }

  async function handleSave(projectName: string): Promise<boolean> {
    if (!selectedCalculator || !currentResult || !currentFormValues) {
      return false;
    }

    setSaveError(undefined);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const finalTotal = currentAdjustedTotal ?? currentResult.total / 100;

      if (!user) {
        const pending: PendingCalculation = {
          calculatorId: selectedCalculator.id,
          values: currentFormValues,
          adjustedTotal: finalTotal,
          projectName,
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
        return true;
      }

      setSaveStatus("saving");
      await saveCalculation(
        selectedCalculator.id,
        currentFormValues,
        finalTotal,
        projectName,
      );
      setSaveStatus("saved");
      return true;
    } catch {
      setSaveStatus(undefined);
      setSaveError("Não foi possível salvar este cálculo.");
      return false;
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

        {activeStep === 2 && currentResult && (
          <CalculatorResult
            result={currentResult}
            adjustedTotal={currentAdjustedTotal}
            onAdjustedTotalChange={
              handleAdjustedTotalChange
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

