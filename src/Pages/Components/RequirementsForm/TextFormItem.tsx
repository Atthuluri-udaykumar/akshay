import React from "react";
import { TextField } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import classnames from "classnames";

export interface ITextFormItemProps {
  label?: string;
  value?: string;
  onChange:  (value: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  rowsMax?: number;
  variant?: 'standard';
  error?: boolean;
  helperText?: string;
  size?: 'small' | 'medium';
  placeholder?: string;
  className?: string;
}

const useStyles = makeStyles((theme) => {
  return {
    root: { width: "100%" },
  };
});

const TextFormItem = (props: ITextFormItemProps) => {
  const {
    label,
    value,
    disabled,
    multiline,
    rows,
    rowsMax,
    variant,
    helperText,
    placeholder,
    className,
    error,
    size,
    onChange,
  } = props;

  const classes = useStyles();

  return (
    <TextField
      error={error}
      className={classnames(classes.root, className)}
      disabled={disabled}
      multiline={multiline}
      rows={rows || 2}
      maxRows={rowsMax || 5}
      label={label}
      variant={variant || "outlined"}
      value={value}
      helperText={helperText}
      placeholder={placeholder || "Enter your answer"}
      size={size}
      onChange={(evt) => onChange(evt.target.value)}
    />
  );
};

export default TextFormItem;
