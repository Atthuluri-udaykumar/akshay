import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";
import { useToggle } from "../hooks/useToggle";
import DateFormItem from "./RequirementsForm/DateFormItem";
import Tooltip from "@mui/material/Tooltip";

export interface IDateToggleSwitchProps {
  value?: string | null;
  onChange: (value?: string | null) => void;
}

const DateToggleSwitch: React.FC<IDateToggleSwitchProps> = (props) => {
  const { value, onChange } = props;
  const { isToggled, toggle } = useToggle(!!value);
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggle();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Grid container spacing={2}>    
          <Grid item xs={4}>
          <label>Effective Date</label>
          <Tooltip title="Effective Date">           
            <Switch
              checked={isToggled}
              onChange={handleSwitchChange}
              name="isToggled"
              inputProps={{ "aria-label": "toggle checkbox" }}
            />
            </Tooltip>
          </Grid>   
        <Grid item xs={8}>
          {isToggled && (
            <DateFormItem
              value={value}
              onChange={onChange}
              //helperText="Effective Date"
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
export default DateToggleSwitch;
