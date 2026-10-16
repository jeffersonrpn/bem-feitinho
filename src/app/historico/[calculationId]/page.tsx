import { notFound } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import type { PricingResult } from "@/domain/calculators/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CalculationDetail = {
  id: string;
  project_name: string;
  calculator_id: string;
  adjusted_total: number;
  created_at: string;
  result_snapshot: PricingResult;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ calculationId: string }>;
}) {
  const { calculationId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data, error } = await supabase
    .from("calculations")
    .select(
      "id, project_name, calculator_id, adjusted_total, created_at, result_snapshot",
    )
    .eq("id", calculationId)
    .single();

  if (error || !data) {
    notFound();
  }

  const calculation = data as CalculationDetail;
  const { breakdown } = calculation.result_snapshot;
  const calculatorName = calculation.calculator_id === "tattoo"
    ? "Tatuagem"
    : calculation.calculator_id === "crochet"
      ? "Crochê"
      : calculation.calculator_id;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Button href="/historico" variant="outlined" fullWidth>
          Voltar ao histórico
        </Button>

        <div>
          <Typography variant="h2">{calculation.project_name}</Typography>
          <Typography color="text.secondary">
            {calculatorName} · {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "UTC",
            }).format(new Date(calculation.created_at))}
          </Typography>
        </div>

        {calculation.result_snapshot.contextScore?.status === "available" && (
          <Stack spacing={0.25}>
            <Typography variant="body2" color="text.secondary">
              Score {new Intl.NumberFormat("pt-BR", {
                signDisplay: "always",
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }).format(calculation.result_snapshot.contextScore.score)} · {calculation.result_snapshot.contextScore.score > 0
                ? "acima"
                : calculation.result_snapshot.contextScore.score < 0
                  ? "abaixo"
                  : "na média"} dos projetos semelhantes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Preço-base: {formatMoney(calculation.result_snapshot.contextScore.basePrice)} · referência: {formatMoney(calculation.result_snapshot.contextScore.meanPrice)} em {calculation.result_snapshot.contextScore.peerCount} projetos
            </Typography>
          </Stack>
        )}

        {calculation.result_snapshot.contextScore?.status === "unavailable" && (
          <Typography variant="caption" color="text.secondary">
            Score indisponível; o preço-base não foi calibrado pelo histórico.
          </Typography>
        )}

        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h5">Resumo do preço</Typography>
              <DetailRow label="Mão de obra" value={breakdown.labor} />
              <DetailRow label="Materiais" value={breakdown.materials} />
              <DetailRow label="Custos indiretos" value={breakdown.indirectCosts} />
              <DetailRow label="Taxas" value={breakdown.fees.total} />
              <DetailRow label="Lucro" value={breakdown.profit} />
              <Divider />
              <DetailRow
                label="Preço definido"
                value={calculation.adjusted_total}
                emphasized
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

function DetailRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <Stack className="result-row" direction="row">
      <Typography>{label}</Typography>
      <Typography
        className="result-row-value"
        sx={{ fontWeight: emphasized ? 700 : undefined }}
      >
        {formatMoney(value)}
      </Typography>
    </Stack>
  );
}
