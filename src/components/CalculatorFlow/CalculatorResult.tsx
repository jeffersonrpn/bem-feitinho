"use client";

import Link from "next/link";

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
  adjustedTotal?: number;
  onAdjustedTotalChange?: (value: number) => void;
  onSave: () => void | Promise<void>;
  saveStatus?: "saving" | "saved";
  saveError?: string;
};

export function CalculatorResult({
  result,
  adjustedTotal,
  onAdjustedTotalChange,
  onSave,
  saveStatus,
  saveError,
}: CalculatorResultProps) {
  const [localEditedTotal, setLocalEditedTotal] = useState(
    result.total / 100,
  );
  const {
    breakdown,
  } = result;

  const editedTotal = adjustedTotal ?? localEditedTotal;
  const displayedTotal = Number.isFinite(editedTotal)
    ? Math.round(editedTotal * 100)
    : result.total;

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
          onClick={onSave}
          disabled={saveStatus === "saving" || saveStatus === "saved"}
          sx={{ mt: 2 }}
        >
          {saveStatus === "saving"
            ? "Salvando..."
            : saveStatus === "saved"
              ? "Cálculo salvo"
              : "Salvar este cálculo"}
        </Button>

        {saveStatus === "saved" && (
          <Button
            component={Link}
            href="/history"
            sx={{ mt: 2, ml: 1 }}
          >
            Ver histórico
          </Button>
        )}

        {saveError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {saveError}
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
