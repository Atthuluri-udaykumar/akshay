import React from "react";
import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import {
  Input,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  FormHelperText,
  Chip,
  Checkbox,
  SelectProps,
  ListItemText,
  TextField,
  Autocomplete,
} from "@mui/material";
import { IOption } from "../../../global/types";

export interface IMultiSelectDropdownFormItemProps {
  value?: string[] | IOption[];
  mulitple?: boolean;
  label?: string;
  disabled?: boolean;
  helperText?: string;
  placeholder?: string;
  className?: string;
  useIdAsValue?: boolean;
  variant?: SelectProps["variant"];
  error?: boolean;
  renderValueType?: "chips" | "concat";
  useCheckbox?: boolean;
  options: IOption[];
  onChange: (value: string[]) => void;
}

const useStyles = makeStyles((theme) => ({
  root: { width: "100%" },
  formControl: { width: "100%" },
  dropdown: { width: "100%" },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(id, selected, theme) {
  return {
    fontWeight:
      selected.indexOf(id) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultiSelectDropdownFormItem(
  props: IMultiSelectDropdownFormItemProps
) {
  const {
    value,
    label,
    options,
    disabled,
    helperText,
    placeholder,
    className,
    error,
    useIdAsValue,
    useCheckbox,
    renderValueType,
    variant,
    onChange,
  } = props;

  const classes = useStyles();
  const theme = useTheme();

  const [targetRegionsValue, setTargetRegionsValue] = React.useState<IOption[]>(
    []
  );

  const optionsMap = React.useMemo(() => {
    const map = {};
    options.forEach((option) => {
      map[option.optionId] = option;
    });

    return map;
  }, [options]);

  const [memoizedSelectedIds, memoizedSelectedIdsMap] = React.useMemo(() => {
    let idsArray: string[] = [];
    let idsMap: Record<string, boolean> = {};

    if (useIdAsValue) {
      (value || []).forEach((item) => {
        if (optionsMap[item]) {
          idsMap[item] = true;
          idsArray.push(item);
        }
      });
    } else {
      (value || []).forEach((item) => {
        if (optionsMap[item.optionId]) {
          idsMap[item.optionId] = true;
          idsArray.push(item.optionId);
        }
      });
    }

    return [idsArray, idsMap];
  }, [value, useIdAsValue, optionsMap]);

  const memoizedMenuItems = React.useMemo(() => {
    const itemsNodes = options.map((option) => {
      if (useCheckbox) {
        return (
          <MenuItem key={option.optionId} value={option.optionId}>
            <Checkbox
              checked={!!memoizedSelectedIdsMap[option.optionId]}
              color="primary"
            />
            <ListItemText primary={option.optionText} />
          </MenuItem>
        );
      } else {
        return (
          <MenuItem
            key={option.optionId}
            value={option.optionId}
            style={getStyles(option.optionId, memoizedSelectedIds, theme)}
            title={option.optionText}
          >
            {option.optionText}
          </MenuItem>
        );
      }
    });

    return itemsNodes;
  }, [options]);

  const handleChange = (event) => {
    const newValue = event.target.value;

    if (useIdAsValue) {
      onChange(newValue);
    } else {
      onChange(newValue.map((id) => optionsMap[id]));
    }
  };

  const renderValueChips = React.useCallback(
    (selected) => (
      <div className={classes.chips}>
        {selected.map((value) => (
          <Chip
            key={value}
            label={optionsMap[value]?.optionText}
            className={classes.chip}
          />
        ))}
      </div>
    ),
    [optionsMap]
  );

  const renderValueConcat = React.useCallback(
    (selected) => {
      return selected
        .reduce((textArr, value) => {
          if (optionsMap[value]?.optionText) {
            textArr.push(optionsMap[value]?.optionText);
          }

          return textArr;
        }, [])
        .join(", ");
    },
    [optionsMap]
  );

  const renderValue = React.useCallback(
    (selected) => {
      return renderValueType === "chips"
        ? renderValueChips(selected)
        : renderValueConcat(selected);
    },
    [renderValueType, renderValueChips, renderValueConcat]
  );

  return (
    <div className={className}>
      <FormControl error={error} className={classes.formControl}>
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          multiple
          className={classes.dropdown}
          placeholder={placeholder || "Select answers"}
          disabled={disabled}
          value={memoizedSelectedIds}
          onChange={handleChange}
          input={<Input />}
          renderValue={renderValue}
          MenuProps={MenuProps}
          variant={variant}
        >
          {memoizedMenuItems}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </div>
    // <Autocomplete
    //   multiple
    //   options={options || []}
    //   getOptionLabel={(option: IOption) => option.optionText}
    //   isOptionEqualToValue={(option, value) =>
    //     option.optionId == value.optionId
    //   }
    //   value={targetRegionsValue || []}
    //   onChange={(e, value) => setTargetRegionsValue(value)}
    //   renderInput={(params) => (
    //     <TextField
    //       {...params}
    //       autoFocus
    //       inputProps={{
    //         ...params.InputProps,
    //         type: "search",
    //         endadornment: (
    //           <React.Fragment>{params.InputProps.endAdornment}</React.Fragment>
    //         ),
    //       }}
    //     />
    //   )}
    // />
  );
}

MultiSelectDropdownFormItem.defaultProps = {
  value: [],
  useIdAsValue: true,
  renderValueType: "chips",
};
