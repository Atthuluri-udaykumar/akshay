import * as React from 'react';
import TextField from '@mui/material/TextField';
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from '@mui/material';
export interface ITextInputProps {
    label?: string;
    value?: any;
    disabled?: boolean;
    multiline?: boolean;
    type?:string;
    required?: boolean;
    rows?: number;
    helperText?: string;
    size?: 'small' | 'medium';
    placeholder?: string;
    error?: boolean;
    min?: number;
    max?: number;
    onChange:  (value: any) => void;
    onKeyDownDisable?: boolean;
  }

  /* css for showing up/down arrow permanently for number input field */
  const useStyles = makeStyles((theme:Theme) => {
    return {
      inputNumberField:{
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
            {
              opacity: 1,
            }
      }
    }
  })

const TextInput = (props:ITextInputProps)=> {
  const {label, value, type, required, disabled, multiline, helperText,rows, size, placeholder, error,min, max,onKeyDownDisable, onChange} = props;
  const classes = useStyles();

  return (
      <TextField
        className={type == 'number' ? classes.inputNumberField : ''}
        id={label}
        style={{ minWidth: 300, maxWidth: 300, margin: 20 }}
        required={required}
        label={label} 
        variant="standard"
        value={value}
        type={type}
        disabled={disabled}
        multiline={multiline}
        helperText={error ? helperText : ''}
        error={error}
        rows={rows}
        size={size}
        placeholder={placeholder}
        onChange={(evt)=> onChange(evt.target.value)}
        inputProps={{ min, max, 
          onKeyDown: (event) => {
            onKeyDownDisable ? event.preventDefault() : '';
       } }}
        />
  );
}

export default TextInput;