"use client";

import { Box, IconButton, Stack, Typography } from "@mui/material";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";

import type { TattooFee } from "@/app/domain/calculators/tattoo/types";

type FeeItemProps = {
  fee: TattooFee;
  onRemove: () => void;
};

export function FeeItem({ fee, onRemove }: FeeItemProps) {
  const isPercentage = fee.type === "percentage";

  const formattedValue = isPercentage
    ? `${fee.value}%`
    : fee.value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 2,
        py: 1.5,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Stack spacing={0.25}>
        <Typography variant="body2" color="text.secondary">
          {isPercentage ? "Percentual" : "Valor fixo"}
        </Typography>

        <Typography variant="body1">{formattedValue}</Typography>
      </Stack>

      <IconButton
        type="button"
        aria-label="Remover taxa"
        onClick={onRemove}
        size="small"
      >
        <HighlightOffRoundedIcon />
      </IconButton>
    </Box>
  );
}

