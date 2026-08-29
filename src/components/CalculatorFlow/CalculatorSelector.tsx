"use client";

import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import type {
  CalculatorConfig,
} from "@/domain/calculators/types";

type CalculatorSelectorProps = {
  calculators: CalculatorConfig[];
  onSelect: (
    calculator: CalculatorConfig,
  ) => void;
};

export function CalculatorSelector({
  calculators,
  onSelect,
}: CalculatorSelectorProps) {
  return (
    <Stack spacing={2}>
      <div>
        <Typography component="h3" variant="h3">
          O que você vai fazer?
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Escolha o tipo de trabalho que
          vamos calcular
        </Typography>
      </div>

      {calculators.map((calculator) => (
        <Card key={calculator.id}>
          <CardActionArea
            onClick={() =>
              onSelect(calculator)
            }
          >
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="h5">
                  {calculator.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {calculator.description}
                </Typography>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
}
