import { useState } from "react";

import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import { FeeItem } from "./FeeItem";
import type { TattooFee } from "@/app/domain/calculators/tattoo/types";

type FeeFieldProps = {
  label: string;
  value: TattooFee[];
  onChange: (value: TattooFee[]) => void;
  onBlur: () => void;
  error?: string;
};

export function FeeField({
  label,
  value: fees,
  onChange,
  onBlur,
  error,
}: FeeFieldProps) {
  const [type, setType] = useState<"fixed" | "percentage">("percentage");

  const [feeValue, setFeeValue] = useState("");

  function addFee() {
    const numericValue = Number(feeValue);

    if (feeValue.trim() === "" || !Number.isFinite(numericValue)) {
      return;
    }

    onChange([
      ...fees,
      {
        type,
        value: numericValue,
      },
    ]);

    setFeeValue("");
    onBlur();
  }

  function removeFee(index: number) {
    onChange(fees.filter((_, feeIndex) => feeIndex !== index));
    onBlur();
  }

  return (
    <Stack spacing={2}>
      <InputLabel>{label}</InputLabel>

      <FormControl fullWidth>
        <InputLabel>Tipo de taxa</InputLabel>

        <Select
          value={type}
          label="Tipo de taxa"
          onChange={(event) =>
            setType(event.target.value as "fixed" | "percentage")
          }
        >
          <MenuItem value="percentage">Percentual</MenuItem>

          <MenuItem value="fixed">Valor fixo</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="number"
        label={type === "percentage" ? "Percentual" : "Valor"}
        value={feeValue}
        onChange={(event) => setFeeValue(event.target.value)}
        error={Boolean(error)}
        helperText={error}
        slotProps={{
          input: {
            endAdornment: type === "percentage" ? "%" : "R$",
          },
        }}
      />

      <Button type="button" variant="outlined" onClick={addFee}>
        Adicionar taxa
      </Button>

      {fees.map((fee, index) => (
        <FeeItem
          key={`${fee.type}-${index}`}
          fee={fee}
          onRemove={() => removeFee(index)}
        />
      ))}
    </Stack>
  );
}
