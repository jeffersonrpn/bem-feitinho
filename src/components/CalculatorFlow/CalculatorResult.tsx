"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import type {
  PricingResult,
} from "@/domain/calculators/types";

function formatMoney(
  cents: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  ).format(cents / 100);
}

type CalculatorResultProps = {
  result: PricingResult;
  onRestart: () => void;
};

export function CalculatorResult({
  result,
  onRestart,
}: CalculatorResultProps) {
  const {
    breakdown,
  } = result;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="body1"
          color="text.secondary"
        >
          Seu preço sugerido
        </Typography>

        <Typography
          variant="h1"
          color="primary.dark"
          sx={{
            fontSize: {
              xs: "2.75rem",
              sm: "3.5rem",
            },
            mt: 1,
          }}
        >
          {formatMoney(result.total)}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">
              Como chegamos aqui?
            </Typography>

            <ResultRow
              label="Mão de obra base"
              value={breakdown.baseLabor}
            />

            {breakdown.adjustments.length >
              0 && (
              <>
                <Divider />

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                >
                  Ajustes
                </Typography>

                {breakdown.adjustments.map(
                  (adjustment) => (
                    <ResultRow
                      key={adjustment.id}
                      label={
                        adjustment.label
                      }
                      value={
                        adjustment.amount
                      }
                      prefix="+ "
                    />
                  ),
                )}
              </>
            )}

            <Divider />

            <ResultRow
              label="Mão de obra ajustada"
              value={breakdown.labor}
              emphasized
            />

            <ResultRow
              label="Materiais"
              value={
                breakdown.materials
              }
            />

            <ResultRow
              label="Custos indiretos"
              value={
                breakdown.indirectCosts
              }
            />

            <ResultRow
              label="Taxas"
              value={breakdown.fees.total}
            />

            <Divider />

            <ResultRow
              label="Custo antes do lucro"
              value={result.subtotal}
              emphasized
            />

            <ResultRow
              label="Margem de lucro"
              value={breakdown.profit}
            />

            <Divider />

            <ResultRow
              label="Preço sugerido"
              value={result.total}
              emphasized
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

type ResultRowProps = {
  label: string;
  value: number;
  prefix?: string;
  emphasized?: boolean;
};

function ResultRow({
  label,
  value,
  prefix = "",
  emphasized = false,
}: ResultRowProps) {
  return (
    <Stack
      spacing={2}
    >
      <Typography
        variant={
          emphasized
            ? "body1"
            : "body2"
        }
      >
        {label}
      </Typography>

      <Typography
        variant={
          emphasized
            ? "body1"
            : "body2"
        }
        sx={{
          whiteSpace: "nowrap",
        }}
      >
        {prefix}
        {formatMoney(value)}
      </Typography>
    </Stack>
  );
}
