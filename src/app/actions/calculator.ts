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
import type {
  HistoricalCalculation,
  PricingInput,
} from "@/domain/calculators/types";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function loadCalculationHistory(
  calculatorId: string,
): Promise<HistoricalCalculation[]> {
  const calculator = calculators.find((item) => item.id === calculatorId);

  if (!calculator) {
    throw new Error("Calculadora não encontrada.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("calculations")
    .select("input_snapshot, suggested_total, currency, calculator_version")
    .eq("calculator_id", calculator.id)
    .eq("calculator_version", calculator.contextScoring.calculatorVersion)
    .eq("currency", calculator.contextScoring.currency)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error("Não foi possível carregar seu histórico de preços.");
  }

  return (data ?? []).flatMap((row) => {
    if (
      !isRecord(row.input_snapshot) ||
      typeof row.suggested_total !== "number" ||
      !Number.isFinite(row.suggested_total)
    ) {
      return [];
    }

    return [{
      inputSnapshot: row.input_snapshot as PricingInput,
      suggestedTotal: row.suggested_total,
      currency: row.currency,
      calculatorVersion: row.calculator_version,
    }];
  });
}

export async function getCalculationHistory(calculatorId: string) {
  return loadCalculationHistory(calculatorId);
}

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
      "Dados inválidos.",
    );
  }


  const engine =
    calculatorEngines[
    calculatorId as keyof typeof calculatorEngines
    ];

  if (!engine) {
    throw new Error(
      "Mecanismo de cálculo não encontrado.",
    );
  }

  const calculate = engine as unknown as (
    input: Record<string, unknown>,
    history?: HistoricalCalculation[],
  ) => ReturnType<typeof engine>;

  try {
    const history = await loadCalculationHistory(calculatorId);
    return calculate(parsed.data, history);
  } catch {
    const result = calculate(parsed.data);
    return {
      ...result,
      contextScore: {
        status: "unavailable" as const,
        reason: "history-unavailable" as const,
        peerCount: 0,
        basePrice: result.suggestedTotal,
      },
    };
  }
}

export async function saveCalculation(
  calculatorId: string,
  values: Record<string, unknown>,
  adjustedTotal: number,
  projectName: string,
) {
  if (!Number.isFinite(adjustedTotal) || adjustedTotal < 0) {
    throw new Error("Preço ajustado inválido.");
  }

  const normalizedProjectName = typeof projectName === "string"
    ? projectName.trim()
    : "";

  if (!normalizedProjectName || normalizedProjectName.length > 120) {
    throw new Error("Informe um nome de projeto válido.");
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
  const calculator = calculators.find((item) => item.id === calculatorId);

  if (!calculator) {
    throw new Error("Calculadora não encontrada.");
  }

  const { data, error } = await supabase
    .from("calculations")
    .insert({
      user_id: user.id,
      project_name: normalizedProjectName,
      calculator_id: calculatorId,
      calculator_version: calculator.contextScoring.calculatorVersion,
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
