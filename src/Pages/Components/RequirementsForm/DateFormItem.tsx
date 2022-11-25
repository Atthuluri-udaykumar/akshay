import React from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

export interface IDateFormItemProps {
  autoFocus?: boolean;
  disableFuture?: boolean;
  value?: string | null;
  label?: string;
  variant?: "dialog" | "inline" | "static";
  disabled?: boolean;
  format?: string;
  placeholder?: string;
  helperText?: string;
  onChange: (value?: string | null) => void;
}

export default function DateFormItem(props: IDateFormItemProps) {
  const {
    value,
    label,
    disabled,
    format,
    onChange,
    autoFocus,
    disableFuture,
    helperText,
  } = props;

  return (
    <Box sx={{ padding: "15px, 14px" }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          autoFocus={autoFocus}
          disableFuture={disableFuture}
          disabled={disabled}
          inputFormat={format || "dd/MMM/yyyy"}
          renderInput={(params) => (
            <TextField
              label={label}
              size="small"
              helperText={helperText}
              {...params}
            />
          )}
          value={value || null}
          onChange={(dateString) => onChange(dateString || null)}
        />
      </LocalizationProvider>
    </Box>
  );
}
