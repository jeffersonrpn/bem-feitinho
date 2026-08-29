import { z } from "zod";

import type {
  CalculatorField,
} from "./types";

const emptyToUndefined = (
  value: unknown,
) => {
  if (value === "") {
    return undefined;
  }

  return value;
};

function createNumberSchema(
  field: CalculatorField,
) {
  let schema = z.preprocess(
    (value) => {
      const normalized =
        emptyToUndefined(value);

      if (
        normalized === undefined
      ) {
        return undefined;
      }

      const parsed = Number(normalized);

      return Number.isNaN(parsed)
        ? normalized
        : parsed;
    },
    z.number({
      error: `${field.label} deve ser um número.`,
    }),
  );

  if (field.min !== undefined) {
    schema = schema.refine(
      (value) => value >= field.min!,
      `${field.label} deve ser maior ou igual a ${field.min}.`,
    );
  }

  if (field.max !== undefined) {
    schema = schema.refine(
      (value) => value <= field.max!,
      `${field.label} deve ser menor ou igual a ${field.max}.`,
    );
  }

  return field.required
    ? schema
    : schema.optional();
}

function createCurrencySchema(
  field: CalculatorField,
) {
  return createNumberSchema(field);
}

function createPercentageSchema(
  field: CalculatorField,
) {
  return createNumberSchema(field);
}

function createSelectSchema(
  field: CalculatorField,
) {
  const options =
    field.options?.map(
      (option) => option.id,
    ) ?? [];

  const schema = z.preprocess(
    emptyToUndefined,
    z.enum(
      options as [
        string,
        ...string[],
      ],
      {
        error: `${field.label} deve ser selecionado.`,
      },
    ),
  );

  return field.required
    ? schema
    : schema.optional();
}

function createFieldSchema(
  field: CalculatorField,
) {
  switch (field.type) {
    case "number":
      return createNumberSchema(field);

    case "currency":
      return createCurrencySchema(field);

    case "percentage":
      return createPercentageSchema(field);

    case "select":
      return createSelectSchema(field);

    default:
      return z.unknown().optional();
  }
}

export function createCalculatorSchema(
  fields: CalculatorField[],
) {
  const shape: Record<
    string,
    z.ZodType
  > = {};

  for (const field of fields) {
    shape[field.id] =
      createFieldSchema(field);
  }

  return z.object(shape);
}
