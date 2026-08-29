"use client";

import {
  Button,
  Stack,
  Typography,
} from "@mui/material";

import {
  useForm,
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
} from "@/domain/calculators/types";

import {
  DynamicField,
} from "./DynamicField";

type CalculatorFormProps = {
  calculator: CalculatorConfig;
  onSubmit: (
    values: FieldValues,
  ) => void | Promise<void>;
  onBack: () => void;
};

export function CalculatorForm({
  calculator,
  onSubmit,
  onBack,
}: CalculatorFormProps) {
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
            />
          ),
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
        >
          Calcular preço
        </Button>

        <Button
          type="button"
          variant="text"
          onClick={onBack}
          fullWidth
        >
          Voltar
        </Button>
      </Stack>
    </Stack>
  );
}
