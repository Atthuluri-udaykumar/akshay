import React from "react";
import { FormHelperText } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import TextFormItem from "./TextFormItem";
import classnames from "classnames";
import SingleSelectDropdownFormItem from "./SingleSelectDropdownFormItem";
import { IOption } from "../../../global/types";
import { defaultTo } from "lodash";

export interface IDropdownTextFormItemValue {
  dropdown?: string;
  text?: string;
}

export interface IDropdownWithTextFormItemProps {
  options: IOption[];
  value?: IDropdownTextFormItemValue;
  disabled?: boolean;
  dropdownHelperText?: string;
  textHelperText?: string;
  dropdownLabel?: string;
  textLabel?: string;
  dropdownVariant?: 'standard' | 'outlined' | 'filled';
  textVariant?: 'standard';
  className?: string;
  dropdownPlaceholder?: string;
  textPlaceholder?: string;
  textError?: boolean;
  dropdownError?: boolean;
  helperText?: string;
  error?: boolean;
  onChange: (value: IDropdownTextFormItemValue) => void;
}

const useStyles = makeStyles((theme) => {
  return {
    root: { width: "100%" },
    dropdown: { marginBottom: "16px" },
  };
});

export default function DropdownWithTextFormItem(
  props: IDropdownWithTextFormItemProps
) {
  const {
    options,
    value,
    disabled,
    dropdownHelperText,
    textHelperText,
    dropdownLabel,
    textLabel,
    dropdownVariant,
    textVariant,
    className,
    dropdownPlaceholder,
    textPlaceholder,
    textError,
    dropdownError,
    helperText,
    error,
    onChange,
  } = props;

  const classes = useStyles();

  return (
    <div className={classnames(className, classes.root)}>
      <SingleSelectDropdownFormItem
        error={dropdownError}
        disabled={disabled}
        value={defaultTo(value, {}).dropdown}
        options={options}
        onChange={(dropdown) => onChange({ ...defaultTo(value, {}), dropdown })}
        variant={dropdownVariant}
        label={dropdownLabel}
        helperText={dropdownHelperText}
        className={classes.dropdown}
        placeholder={dropdownPlaceholder}
      />
      <TextFormItem
        multiline
        error={textError}
        disabled={disabled}
        value={defaultTo(value, {}).text}
        onChange={(text) => onChange({ ...defaultTo(value, {}), text })}
        variant={textVariant}
        label={textLabel}
        helperText={textHelperText}
        placeholder={textPlaceholder || "Enter additional information"}
      />
      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </div>
  );
}

DropdownWithTextFormItem.defaultProps = {
  value: {},
};
