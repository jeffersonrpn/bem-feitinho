import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { redirect } from "next/navigation";

import { DeleteCalculationButton } from "./DeleteCalculationButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

type CalculationRow = {
  id: string;
  project_name: string;
  calculator_id: string;
  complexity_score: number;
  suggested_total: number;
  adjusted_total: number;
  created_at: string;
};

type HistoryPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function getCalculatorName(calculatorId: string) {
  if (calculatorId === "tattoo") return "Tatuagem";
  if (calculatorId === "crochet") return "Crochê";
  return "Trabalho artesanal";
}

function HistoryActionDock() {
  return (
    <Paper component="footer" className="history-action-dock" elevation={1}>
      <Box className="history-action-buttons">
        <Button
          href="/"
          variant="outlined"
          startIcon={<HomeRoundedIcon />}
          fullWidth
        >
          Início
        </Button>
        <Button
          href="/calculadora"
          variant="contained"
          startIcon={<AddRoundedIcon />}
          fullWidth
        >
          Novo cálculo
        </Button>
      </Box>
    </Paper>
  );
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const { pagina } = await searchParams;
  const pageValue = Array.isArray(pagina) ? pagina[0] : pagina;
  const parsedPage = pageValue ? Number(pageValue) : 1;
  const requestedPage =
    pageValue && /^\d+$/.test(pageValue) && Number.isSafeInteger(parsedPage)
      ? Math.max(1, parsedPage)
      : 1;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Container maxWidth="sm" className="history-page">
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h2" component="h1">
              Seus projetos
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Entre com o Google para acessar os cálculos que você salvou.
            </Typography>
          </Box>
        </Stack>
        <HistoryActionDock />
      </Container>
    );
  }

  const from = (requestedPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count } = await supabase
    .from("calculations")
    .select(
      "id, project_name, calculator_id, complexity_score, suggested_total, adjusted_total, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  const calculations = (data ?? []) as CalculationRow[];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (requestedPage > totalPages) {
    redirect(
      totalPages === 1 ? "/historico" : `/historico?pagina=${totalPages}`,
    );
  }

  const firstItem = totalCount === 0 ? 0 : from + 1;
  const lastItem = Math.min(from + calculations.length, totalCount);

  return (
    <Container maxWidth="sm" className="history-page">
      <Stack spacing={2}>
        <Box>
          <Typography variant="h2" component="h1">
            Seus projetos
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {totalCount === 1
              ? "1 cálculo salvo"
              : `${totalCount} cálculos salvos`}
          </Typography>
        </Box>

        {error && (
          <Typography color="error">
            Não foi possível carregar seu histórico.
          </Typography>
        )}

        {!error && totalCount === 0 && (
          <Card>
            <CardContent>
              <WorkOutlineRoundedIcon color="action" fontSize="large" />
              <Typography variant="h6">Seu histórico começa aqui</Typography>
              <Typography color="text.secondary">
                Salve um cálculo para encontrar seus projetos nesta lista.
              </Typography>
            </CardContent>
          </Card>
        )}

        {!error &&
          calculations.map((calculation) => (
            <Card key={calculation.id} className="history-card">
              <CardContent>
                <Stack spacing={1.25}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ fontWeight: 800, overflowWrap: "anywhere" }}
                      >
                        {calculation.project_name}
                      </Typography>
                      <Chip
                        icon={<WorkOutlineRoundedIcon />}
                        label={getCalculatorName(calculation.calculator_id)}
                        size="small"
                      />
                      <CalendarTodayRoundedIcon
                        aria-hidden="true"
                        sx={{ fontSize: 15, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "medium",
                          timeZone: "UTC",
                        }).format(new Date(calculation.created_at))}
                      </Typography>
                    </Box>
                    <DeleteCalculationButton
                      calculationId={calculation.id}
                      projectName={calculation.project_name}
                    />
                  </Box>

                  <Box className="history-card-footer">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Preço final
                      </Typography>
                      <Typography
                        variant="h6"
                        color="primary.dark"
                        sx={{ fontWeight: 900 }}
                      >
                        {formatMoney(calculation.adjusted_total)}
                      </Typography>
                      {calculation.adjusted_total !==
                        calculation.suggested_total && (
                        <Typography variant="caption" color="text.secondary">
                          Sugerido: {formatMoney(calculation.suggested_total)}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      href={`/historico/${calculation.id}`}
                      variant="outlined"
                      endIcon={<ArrowForwardRoundedIcon />}
                      aria-label={`Ver detalhes de ${calculation.project_name}`}
                    >
                      Detalhes
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}

        {!error && totalCount > 0 && (
          <Box
            component="nav"
            aria-label="Paginação do histórico"
            sx={{ pt: 0.5 }}
          >
            {requestedPage > 1 ? (
              <Button
                href={`/historico?pagina=${requestedPage - 1}`}
                startIcon={<ArrowBackRoundedIcon />}
              >
                Anterior
              </Button>
            ) : (
              <Button disabled startIcon={<ArrowBackRoundedIcon />}>
                Anterior
              </Button>
            )}
            {requestedPage < totalPages ? (
              <Button
                href={`/historico?pagina=${requestedPage + 1}`}
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Próxima
              </Button>
            ) : (
              <Button disabled endIcon={<ArrowForwardRoundedIcon />}>
                Próxima
              </Button>
            )}
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              aria-live="polite"
              sx={{ mt: 0.5 }}
            >
              {firstItem}–{lastItem} de {totalCount}
            </Typography>
          </Box>
        )}
      </Stack>
      <HistoryActionDock />
    </Container>
  );
}
