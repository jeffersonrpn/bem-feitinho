import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CalculationRow = {
  id: string;
  calculator_id: string;
  complexity_score: number;
  suggested_total: number;
  adjusted_total: number;
  created_at: string;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h2">Seus cálculos</Typography>
          <Typography color="text.secondary">
            Entre com o Google pela calculadora para acessar seu histórico.
          </Typography>
          <Link href="/">
            <Button variant="contained">Voltar para a calculadora</Button>
          </Link>
        </Stack>
      </Container>
    );
  }

  const { data, error } = await supabase
    .from("calculations")
    .select(
      "id, calculator_id, complexity_score, suggested_total, adjusted_total, created_at",
    )
    .order("created_at", { ascending: false });

  const calculations = (data ?? []) as CalculationRow[];

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h2">Seus cálculos</Typography>

        {error && (
          <Typography color="error">
            Não foi possível carregar seu histórico.
          </Typography>
        )}

        {!error && calculations.length === 0 && (
          <Typography color="text.secondary">
            Você ainda não salvou nenhum cálculo.
          </Typography>
        )}

        {calculations.map((calculation) => (
          <Card key={calculation.id}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">
                  {calculation.calculator_id === "tattoo"
                    ? "Tatuagem"
                    : calculation.calculator_id}
                </Typography>
                <Typography color="text.secondary">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(calculation.created_at))}
                </Typography>
                <Typography>
                  Complexidade: {calculation.complexity_score}/10
                </Typography>
                <Typography>
                  Sugerido: {formatMoney(calculation.suggested_total)}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  Preço definido: {formatMoney(calculation.adjusted_total)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}

        <Link href="/">
          <Button>Novo cálculo</Button>
        </Link>
      </Stack>
    </Container>
  );
}
