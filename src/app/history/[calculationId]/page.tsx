import Link from "next/link";
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
        <Link href="/history">
          <Button>Voltar ao histórico</Button>
        </Link>

        <div>
          <Typography variant="h2">{calculation.project_name}</Typography>
          <Typography color="text.secondary">
            {calculatorName} · {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(calculation.created_at))}
          </Typography>
        </div>

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
    <Stack direction="row">
      <Typography>{label}</Typography>
      <Typography>
        {formatMoney(value)}
      </Typography>
    </Stack>
  );
}
