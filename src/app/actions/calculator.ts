"use server";

import {
  createCalculatorSchema,
} from "@/domain/calculators/schema";

import {
  calculatorEngines,
} from "@/domain/calculators/engines";

import {
  calculators,
} from "@/domain/calculators";

export async function calculatePrice(
  calculatorId: string,
  values: Record<string, unknown>,
) {
  const calculator =
    calculators.find(
      (item) =>
        item.id === calculatorId,
    );

  if (!calculator) {
    throw new Error(
      "Calculadora não encontrada.",
    );
  }

  const schema =
    createCalculatorSchema(
      calculator.fields,
    );

  const parsed =
    schema.safeParse(values);

  if (!parsed.success) {
    throw new Error(
      "Dados invalidos.",
    );
  }


  const engine =
    calculatorEngines[
    calculatorId as keyof typeof calculatorEngines
    ];

  if (!engine) {
    throw new Error(
      "Engine da calculadora não encontrada.",
    );
  }

  return engine(values);
}
