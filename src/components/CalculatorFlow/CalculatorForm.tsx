"use client";

import {
  forwardRef,
  useImperativeHandle,
} from "react";

import {
  Stack,
  Paper,
  Typography,
} from "@mui/material";

import {
  useForm,
  useWatch,
  type FieldValues,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  createCalculatorSchema,
} from "@/domain/calculators/schema";

import type {
  CalculatorConfig,
  PricingResult,
} from "@/domain/calculators/types";
import {
  calculateTattooPrice,
} from "@/domain/calculators/tattoo";
import type {
  TattooInput,
} from "@/domain/calculators/tattoo/types";

import {
  DynamicField,
} from "../DynamicField/DynamicField";

type CalculatorFormProps = {
  calculator: CalculatorConfig;
  onSubmit: (
    values: FieldValues,
  ) => void | Promise<void>;
  onBack: () => void;
};

type CalculatorFormHandle = {
  submit: () => void;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function getTattooResult(
  values: FieldValues,
): PricingResult | undefined {
  const complexity = values.complexity;

  if (
    typeof complexity !== "number" ||
    complexity < 1 ||
    complexity > 10
  ) {
    return undefined;
  }

  try {
    return calculateTattooPrice(values as TattooInput);
  } catch {
    return undefined;
  }
}

function formatMultiplier(multiplier: number) {
  return multiplier.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "×";
}

function getMultiplierHints(result: PricingResult | undefined) {
  const adjustments = new Map<string, number>(
    result?.breakdown.adjustments.map(({ id, multiplier }) => [id, multiplier]),
  );
  const profitMargin = result?.breakdown.profit && result.subtotal
    ? result.total / result.subtotal
    : 1;

  return {
    sizeCm: "Sem impacto no cálculo atual.",
    complexity: result
      ? `Multiplicador de esforço: ${formatMultiplier(result.breakdown.effortMultiplier)}`
      : undefined,
    bodyPart: `Multiplicador: ${formatMultiplier(adjustments.get("body-part") ?? 1)}`,
    design: `Multiplicador: ${formatMultiplier(adjustments.get("design") ?? 1)}`,
    style: `Multiplicador: ${formatMultiplier(adjustments.get("style") ?? 1)}`,
    materials: "Somado diretamente ao custo.",
    sessions: "Combinado com as horas por sessão.",
    hoursPerSession: "Combinado com o número de sessões.",
    indirectCosts: "Somado diretamente ao custo.",
    fees: "Aplicadas sobre o custo operacional.",
    profitMargin: result
      ? `Multiplicador do total: ${formatMultiplier(profitMargin)}`
      : undefined,
  };
}

export const CalculatorForm = forwardRef<
  CalculatorFormHandle,
  CalculatorFormProps
>(
  function CalculatorFormComponent({
    calculator,
    onSubmit,
  }, ref) {
    const schema =
      createCalculatorSchema(
        calculator.fields,
      );

    const {
      control,
      handleSubmit,
    } = useForm({
      resolver: zodResolver(schema),
      mode: "onBlur",
    });
    const values = useWatch({ control });

    const preview =
      calculator.id === "tattoo"
        ? getTattooResult(values)
        : undefined;
    const multiplierHints = getMultiplierHints(preview);

    useImperativeHandle(ref, () => ({
      submit: () => handleSubmit(onSubmit)(),
    }));

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <Typography variant="h2">
          {calculator.name}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Preencha o que fizer sentido
          para o seu trabalho.
        </Typography>
      </div>

      <Stack spacing={2}>
        {calculator.fields.map(
          (field) => (
            <DynamicField
              key={field.id}
              field={field}
              control={control}
              influenceText={multiplierHints[field.id as keyof typeof multiplierHints]}
            />
          ),
        )}
      </Stack>

      <Paper
        variant="outlined"
        sx={{ px: 2, py: 1.5, borderRadius: 2 }}
        aria-live="polite"
      >
        <Typography variant="body2" color="text.secondary">
          Preço estimado
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.25 }}>
          {preview
            ? formatMoney(preview.total)
            : "Preencha a complexidade para ver a estimativa"}
        </Typography>
      </Paper>
    </Stack>
  );
  },
);
