"use client";

import {
  MenuItem,
  TextField,
} from "@mui/material";

import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import type {
  CalculatorField,
} from "@/domain/calculators/types";

type DynamicFieldProps<
  T extends FieldValues,
> = {
  field: CalculatorField;
  control: Control<T>;
};

export function DynamicField<
  T extends FieldValues,
>({
  field,
  control,
}: DynamicFieldProps<T>) {
  return (
    <Controller
      name={field.id as Path<T>}
      control={control}
      render={({
        field: controllerField,
        fieldState,
      }) => {
        if (
          field.type === "select"
        ) {
          return (
            <TextField
              select
              label={field.label}
              value={
                controllerField.value ?? ""
              }
              onChange={
                controllerField.onChange
              }
              onBlur={
                controllerField.onBlur
              }
              error={
                !!fieldState.error
              }
              helperText={
                fieldState.error?.message
              }
              required={field.required}
            >
              {field.options?.map(
                (option) => (
                  <MenuItem
                    key={option.id}
                    value={option.id}
                  >
                    {option.label}
                  </MenuItem>
                ),
              )}
            </TextField>
          );
        }

        const isCurrency =
          field.type === "currency";

        const isPercentage =
          field.type === "percentage";

        return (
          <TextField
            label={field.label}
            type="number"
            value={
              controllerField.value ?? ""
            }
            onChange={(event) => {
              const value =
                event.target.value;

              controllerField.onChange(
                value === ""
                  ? undefined
                  : Number(value),
              );
            }}
            onBlur={
              controllerField.onBlur
            }
            error={
              !!fieldState.error
            }
            helperText={
              fieldState.error?.message
            }
            required={field.required}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              htmlInput: {
                min: field.min,
                max: field.max,
                step: field.step,
                inputMode: "decimal",
              },
            }}
            InputProps={
              isCurrency
                ? {
                    startAdornment: (
                      <span
                        style={{
                          marginRight: 8,
                        }}
                      >
                        R$
                      </span>
                    ),
                  }
                : undefined
            }
            {...(isPercentage
              ? {
                  InputProps: {
                    endAdornment: (
                      <span
                        style={{
                          marginLeft: 8,
                        }}
                      >
                        %
                      </span>
                    ),
                  },
                }
              : {})}
          />
        );
      }}
    />
  );
}
