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

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

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

  return engine(
    parsed.data as Parameters<typeof engine>[0],
  );
}

export async function saveCalculation(
  calculatorId: string,
  values: Record<string, unknown>,
  adjustedTotal: number,
) {
  if (!Number.isFinite(adjustedTotal) || adjustedTotal < 0) {
    throw new Error("Preço ajustado inválido.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Faça login para salvar o cálculo.");
  }

  const result = await calculatePrice(calculatorId, values);
  const adjustedTotalInCents = Math.round(adjustedTotal * 100);

  const { data, error } = await supabase
    .from("calculations")
    .insert({
      user_id: user.id,
      calculator_id: calculatorId,
      calculator_version: 1,
      input_snapshot: values,
      result_snapshot: result,
      complexity_score: result.breakdown.complexityScore,
      effort_multiplier: result.breakdown.effortMultiplier,
      suggested_total: result.suggestedTotal,
      adjusted_total: adjustedTotalInCents,
      currency: "BRL",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error("Não foi possível salvar o cálculo.");
  }

  return data;
}
