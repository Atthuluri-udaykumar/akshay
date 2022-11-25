import React from "react";
import {
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  FormHelperText,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { IOption } from "../../../global/types";
import { defaultTo } from "lodash";

export interface ICheckboxesFormItemProps {
  value?: string[];
  label?: string;
  disabled?: boolean;
  options: IOption[];
  error?: boolean;
  helperText?: string;
  onChange: (value?: string[]) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  formControl: {},
}));

export default function CheckboxesFormItem(props: ICheckboxesFormItemProps) {
  const { options, disabled, helperText, label, error, onChange } = props;
  const classes = useStyles();
  const handleChange = (event) => {
    const optionId = event.target.name;
    const newValue = [...defaultTo(value, [])];
    const index = newValue.indexOf(optionId);

    if (index === -1) {
      newValue.push(optionId);
    } else {
      newValue.splice(index, 1);
    }

    onChange(newValue);
  };

  let value = props.value;
  value = Array.isArray(value) ? value : [];

  return (
    <div className={classes.root}>
      <FormControl
        error={error}
        component="fieldset"
        className={classes.formControl}
      >
        <FormLabel component="legend">{label}</FormLabel>
        <FormGroup>
          {options.map((option) => {
            const optionId = option.optionId;
            return (
              <FormControlLabel
                key={optionId}
                control={
                  <Checkbox
                    disabled={disabled}
                    checked={(Array.isArray(value) ? value : []).includes(
                      optionId.toString()
                    )}
                    onChange={handleChange}
                    name={optionId.toString()}
                  />
                }
                label={option.optionText}
              />
            );
          })}
        </FormGroup>
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </div>
  );
}

CheckboxesFormItem.defaultProps = {
  value: [],
};
