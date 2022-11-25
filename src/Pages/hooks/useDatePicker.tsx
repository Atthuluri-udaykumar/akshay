import React from "react";
import DatePicker from "@mui/lab/DatePicker";
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

export interface IDatePickerProps {
  value?: string;
  label?: string;
  variant?: "dialog" | "inline" | "static";
  disabled?: boolean;
  format?: string;
  placeholder?: string;
  onChange: (value?: string | null) => void;
}

export default function useDateFormItem(props: IDatePickerProps) {
  const { value, label, variant, disabled, format, placeholder, onChange } =
    props;

  const [selectDate, setSelectedDate] = React.useState<Date | null>(
    new Date("2020-01-01")
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        autoOk
        disableToolbar
        disabled={disabled}
        variant={variant || "inline"}
        format={format || "MM/dd/yyyy"}
        margin="normal"
        label={label}
        value={selectDate}
        placeholder={placeholder}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          "aria-label": "change date",
        }}
      />
    </LocalizationProvider>
  );
}

