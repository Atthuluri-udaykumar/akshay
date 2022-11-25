import React from "react";
import { TextField } from "@mui/material";
import { defaultTo, isNumber } from "lodash";

export interface INumberFormItemProps {
  value?: string | number;
  label?: string;
  helperText?: string;
  variant?: 'standard';
  allowDecimal?: boolean;
  disabled?: boolean;
  format?: string;
  placeholder?: string;
  error?: boolean;
  min?: number;
  max?: number;
  onChange: (numString: string | null, value?: number | null) => void;
}

const dotCode = 46;
const numCodeStart = 48;
const numCodeEnd = 57;
const minusCode = 45;
const zeroCode = 48;

export default function NumberFormItem(props: INumberFormItemProps) {
  const {
    value,
    label,
    disabled,
    helperText,
    variant,
    allowDecimal,
    placeholder,
    error,
    min,
    max,
    onChange,
  } = props;

  return (
    <TextField
      error={error}
      label={label}
      variant={variant || "outlined"}
      value={String(value)}
      disabled={disabled}
      helperText={helperText}
      type="number"
      size="small"
      placeholder={placeholder || "Enter number"}
      onChange={(event) => {
        let val = String(event.target.value).toLowerCase();

        if (val === "") {
          const defaultTo0 = Number.isNaN(min) || defaultTo(min, Number.MIN_SAFE_INTEGER) < 0;
          val = defaultTo0 ? '0' : defaultTo(min, Number.MIN_SAFE_INTEGER).toString();
          onChange(val, Number(val));
          return;
        }

        const accepted: string[] = [];

        for (let i = 0; i < val.length; i++) {
          const code = val.charCodeAt(i);

          if (i === 0 && code === zeroCode) {
            continue;
          }

          if (
            code === minusCode ||
            (code >= numCodeStart && code <= numCodeEnd)
          ) {
            accepted.push(val[i]);
          } else if (code === dotCode && !allowDecimal) {
            break;
          }
        }

        val = accepted.join("");
        let valNum = Number(val);

        if (isNumber(min) && valNum < min) {
          val = String(min);
          valNum = min;
        }

        if (isNumber(max) && valNum > max) {
          val = String(max);
          valNum = max;
        }

        onChange(val, valNum);
      }}
    />
  );
}

NumberFormItem.defaultProps = {
  allowDecimal: false,
};
