"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
  adjustedTotal?: number;
  onAdjustedTotalChange?: (value: number) => void;
};

export function CalculatorResult({
  result,
  onRestart,
  adjustedTotal,
  onAdjustedTotalChange,
}: CalculatorResultProps) {
  const [localEditedTotal, setLocalEditedTotal] = useState(
    result.total / 100,
  );
  const [authError, setAuthError] = useState<string>();

  const {
    breakdown,
  } = result;

  const editedTotal = adjustedTotal ?? localEditedTotal;
  const displayedTotal = Number.isFinite(editedTotal)
    ? Math.round(editedTotal * 100)
    : result.total;

  async function handleSaveRequest() {
    setAuthError(undefined);

    try {
      const supabase = createSupabaseBrowserClient();
      const callbackUrl = new URL(
        "/auth/callback",
        window.location.origin,
      );
      callbackUrl.searchParams.set("next", "/");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        setAuthError("Não foi possível iniciar o login.");
      }
    } catch {
      setAuthError(
        "Configure a conexão com o Supabase para salvar seus cálculos.",
      );
    }
  }

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
          {formatMoney(displayedTotal)}
        </Typography>

        <TextField
          label="Ajustar preço sugerido"
          type="number"
          value={editedTotal}
          onChange={(event) => {
            const value = Number(event.target.value);
            setLocalEditedTotal(value);
            onAdjustedTotalChange?.(value);
          }}
          slotProps={{
            htmlInput: { min: 0, step: 0.01 },
          }}
          helperText="O valor inicial considera a complexidade informada."
          fullWidth
          sx={{ mt: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleSaveRequest}
          sx={{ mt: 2 }}
        >
          Salvar este cálculo
        </Button>

        {authError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {authError}
          </Alert>
        )}
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

            <Typography variant="body2" color="text.secondary">
              Complexidade: {breakdown.complexityScore}/10 · esforço: {breakdown.effortMultiplier.toFixed(1)}x
            </Typography>

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
              value={displayedTotal}
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
