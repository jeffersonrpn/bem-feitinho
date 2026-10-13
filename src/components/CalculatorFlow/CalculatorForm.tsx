"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import {
  useForm,
  useWatch,
  type Control,
  type FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createCalculatorSchema } from "@/domain/calculators/schema";
import type {
  CalculatorConfig,
  CalculatorField,
  PricingResult,
} from "@/domain/calculators/types";
import { calculatorEngines } from "@/domain/calculators/engines";

import { DynamicField } from "../DynamicField/DynamicField";

type CalculatorFormProps = {
  calculator: CalculatorConfig;
  onSubmit: (values: FieldValues) => void | Promise<void>;
  onBack: () => void;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

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
      : formatMultiplier(multiplier);
  }

  if (
    field.multiplier?.type === "linear" &&
    typeof value === "number"
  ) {
    const { base, step, referenceValue } = field.multiplier;
    return formatMultiplier(base + (value - referenceValue) * step);
  }

  if (field.multiplier?.type === "margin" && result?.subtotal) {
    return formatMultiplier(result.total / result.subtotal);
  }

  return field.calculationHint;
}

function renderFields(
  fields: CalculatorField[],
  control: Control<FieldValues>,
  values: FieldValues,
  preview: PricingResult | undefined,
) {
  return fields.map((field) => (
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
  ));
}

export function CalculatorForm({
  calculator,
  onSubmit,
  onBack,
}: CalculatorFormProps) {
  const schema = createCalculatorSchema(calculator.fields);
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const watchedValues = useWatch({ control });
  const values = (watchedValues ?? {}) as FieldValues;
  const requiredFields = calculator.fields.filter((field) => field.required);
  const optionalFields = calculator.fields.filter((field) => !field.required);
  const preview = isValid
    ? getCalculatorResult(calculator.id, values)
    : undefined;

  return (
    <Stack
      component="form"
      className="calculator-form"
      spacing={2.5}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Box className="calculator-form-heading">
        <Typography variant="h2" component="h1">
          {calculator.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
          Preencha o essencial. Os outros detalhes são opcionais.
        </Typography>
      </Box>

      <Box component="section" aria-labelledby="essential-fields-title">
        <Typography
          id="essential-fields-title"
          variant="h5"
          component="h2"
          sx={{ mb: 1.5 }}
        >
          Para calcular
        </Typography>
        <Stack spacing={2}>
          {renderFields(requiredFields, control, values, preview)}
        </Stack>
      </Box>

      {optionalFields.length > 0 && (
        <Accordion className="optional-fields">
          <AccordionSummary
            expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="optional-fields-content"
            id="optional-fields-header"
          >
            <Box>
              <Typography variant="h6">Ajustar o preço</Typography>
              <Typography variant="body2" color="text.secondary">
                {optionalFields.length} detalhes opcionais
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails id="optional-fields-content">
            <Stack spacing={2.5}>
              {renderFields(optionalFields, control, values, preview)}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      <Box component="footer" className="calculator-form-footer">
        <Box className="form-footer-summary" aria-live="polite">
          <Typography variant="caption" color="text.secondary">
            {isValid ? "Estimativa atual" : "Falta preencher"}
          </Typography>
          <Typography variant="body2" fontWeight={800}>
            {isValid && preview
              ? formatMoney(preview.total)
              : `${requiredFields.length} campos essenciais`}
          </Typography>
        </Box>
        <Box className="form-footer-actions">
          <Button
            type="button"
            variant="outlined"
            startIcon={<UndoRoundedIcon />}
            onClick={onBack}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            variant="contained"
            endIcon={<TaskAltRoundedIcon />}
            disabled={!isValid}
          >
            Calcular preço
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
