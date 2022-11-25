import React from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/material";
import { IOption } from "../../../global/types";

export interface IRadioButtonsFormItemProps {
  value?: string;
  label?: string;
  disabled?: boolean; 
  options: IOption[];  
  error?: boolean;
  helperText?: string; 
  onChange: (value: string) => void;
}

export default function RadioButtonsFormItem(props: IRadioButtonsFormItemProps) {
  const { value, label, disabled, options, error, helperText, onChange } =
    props;

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <FormControl error={error} component="fieldset">
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup value={value ? String(value) : ""} onChange={handleChange}>
        {options.map((option) => {
          const optionId = String(option.optionId);
          return (
            <FormControlLabel
              key={optionId}
              disabled={disabled}
              value={optionId}
              control={<Radio color="primary" />}
              label={option.optionText}
            />
          );
        })}
      </RadioGroup>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}