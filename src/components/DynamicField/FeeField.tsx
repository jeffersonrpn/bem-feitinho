import { useId, useState } from "react";

import {
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { FeeItem } from "./FeeItem";
import type { Fee } from "@/app/domain/calculators/types";

type FeeFieldProps = {
  label: string;
  value: Fee[];
  onChange: (value: Fee[]) => void;
  onBlur: () => void;
  error?: string;
  influenceText?: string;
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
  const typeLabelId = useId();
  const parsedFee = Number(feeValue);
  const feeIsValid = feeValue.trim() !== "" &&
    Number.isFinite(parsedFee) &&
    parsedFee >= 0 &&
    (type === "fixed" || parsedFee <= 100);

  function addFee() {
    const numericValue = Number(feeValue);

    if (!feeIsValid) {
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
      <Box>
        <Typography variant="h6" component="h3">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Inclua tarifas de cartão ou outras cobranças.
        </Typography>
      </Box>

      <FormControl fullWidth>
        <InputLabel id={typeLabelId}>Tipo de taxa</InputLabel>
        <Select
          labelId={typeLabelId}
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
        label={type === "percentage" ? "Percentual da taxa" : "Valor da taxa"}
        value={feeValue}
        onChange={(event) => setFeeValue(event.target.value)}
        error={Boolean(error)}
        helperText={error ?? (type === "percentage" ? "De 0 a 100%." : "Valor em reais.")}
        slotProps={{
          htmlInput: {
            min: 0,
            max: type === "percentage" ? 100 : undefined,
            step: type === "percentage" ? 0.1 : 0.01,
            inputMode: "decimal",
          },
          input: {
            endAdornment: type === "percentage" ? "%" : "R$",
          },
        }}
      />

      <Button
        type="button"
        variant="outlined"
        onClick={addFee}
        disabled={!feeIsValid}
      >
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
