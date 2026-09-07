"use client";

import {
  forwardRef,
  useImperativeHandle,
} from "react";

import {
  Stack,
  Typography,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";

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
  CalculatorField,
  PricingResult,
} from "@/domain/calculators/types";
import {
  calculatorEngines,
} from "@/domain/calculators/engines";

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

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  bottom: theme.spacing(11),
  left: "auto",
  width: "50vw",
  "& .MuiSnackbarContent-root": {
    justifyContent: "end",
    backgroundColor: theme.palette.primary.dark,
    fontSize: theme.typography.body1.fontSize,
  },
}));

function getCalculatorResult(
  calculatorId: string,
  values: FieldValues,
): PricingResult | undefined {
  try {
    const engine = calculatorEngines[
      calculatorId as keyof typeof calculatorEngines
    ] as unknown as (
      input: Record<string, unknown>,
    ) => PricingResult;

    return engine(values);
  } catch {
    return undefined;
  }
}

function formatMultiplier(multiplier: number) {
  return multiplier.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getMultiplierHint(
  field: CalculatorField,
  value: unknown,
  result: PricingResult | undefined,
) {
  if (field.type === "select") {
    const multiplier = field.options?.find(
      (option) => option.id === value,
    )?.multiplier;

    return multiplier === undefined
      ? undefined
      : `${formatMultiplier(multiplier)}`;
  }

  if (
    field.multiplier?.type === "linear" &&
    typeof value === "number"
  ) {
    const { base, step, referenceValue } = field.multiplier;
    const multiplier = base + (value - referenceValue) * step;

    return `${formatMultiplier(multiplier)}`;
  }

  if (field.multiplier?.type === "margin" && result?.subtotal) {
    return `${formatMultiplier(result.total / result.subtotal)}`;
  }

  return field.calculationHint;
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
      getCalculatorResult(calculator.id, values);

    useImperativeHandle(ref, () => ({
      submit: () => handleSubmit(onSubmit)(),
    }));

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ pb: 10 }}
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
              influenceText={getMultiplierHint(
                field,
                values[field.id],
                preview,
              )}
            />
          ),
        )}
      </Stack>

      <StyledSnackbar
        open={true}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        message={preview
          ? `${formatMoney(preview.total)}`
          : "--"}
      />

    </Stack>
  );
  },
);
