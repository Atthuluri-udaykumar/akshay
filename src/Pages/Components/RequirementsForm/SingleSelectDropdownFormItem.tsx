import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import classnames from "classnames";
import { IOption } from "../../../global/types";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100%",
  },
  dropdown: { width: "100%" },
  formControl: { width: "100%" },
}));

export interface ISingleSelectDropdownFormItemProps {
  value?: string | IOption;
  label?: string;
  disabled?: boolean;
  variant?: "standard" | "outlined" | "filled";
  helperText?: string;
  className?: string;
  placeholder?: string;
  useIdAsValue?: boolean;
  error?: boolean;
  options: IOption[];
  onChange: (value: string) => void;
}

export default function SingleSelectDropdownFormItem(
  props: ISingleSelectDropdownFormItemProps
) {
  const {
    options,
    value,
    disabled,
    label,
    variant,
    helperText,
    placeholder,
    className,
    useIdAsValue,
    error,
    onChange,
  } = props;

  const classes = useStyles();
  const [memoizedMenuItems, optionsMap] = React.useMemo(() => {
    const map = {};
    const itemsNodes = options.map((option) => {
      map[option.optionId] = option;
      return (
        <MenuItem
          key={option.optionId}
          value={option.optionId}
          title={option.optionText}
        >
          {option.optionText}
        </MenuItem>
      );
    });

    return [itemsNodes, map];
  }, [options]);

  const handleChange = (event) => {
    if (useIdAsValue) {
      onChange(event.target.value);
    } else {
      onChange(optionsMap[event.target.value]);
    }
  };

  return (
    <div className={classnames(classes.root, className)}>
      <FormControl
        error={error}
        variant={variant || "outlined"}
        className={classes.formControl}
      >
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          disabled={disabled}
          value={useIdAsValue ? value : (value as IOption)?.optionId}
          onChange={handleChange}
          label={label}
          placeholder={placeholder || "Select answer"}
          className={classes.dropdown}
        >
          {memoizedMenuItems}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </div>
  );
}

SingleSelectDropdownFormItem.defaultProps = {
  useIdAsValue: true,
};
