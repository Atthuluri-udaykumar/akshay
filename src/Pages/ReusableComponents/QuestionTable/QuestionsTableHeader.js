import React from "react";
import { Checkbox } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from "prop-types";
import { questionTableColumns } from "./columns";

const padding = 16;
const useStyles = makeStyles((theme) => ({
  checkbox: {
    width: 42 + padding * 2,
  },
  actions: {
    width: 54 + padding * 2,
    textAlign: "center",
  },
  column: {
    padding,
    textAlign: "left",
  },
  row: {
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
}));

const QuestionsTableHeader = (props) => {
  const { checked, onCheck, disabled, indeterminate } = props;
  const classes = useStyles();

  return (
    <thead>
      <tr className={classes.row}>
        <th key="checkbox" className={classes.checkbox}>
          <Checkbox
            color="primary"
            disabled={disabled}
            indeterminate={indeterminate}
            checked={checked || false}
            onChange={onCheck}
            inputProps={{
              "aria-label":
                checked || indeterminate
                  ? "Deselect selected questions"
                  : "Select all question",
            }}
          />
        </th>
        <th key="actions" className={classes.actions}>
          Actions
        </th>
        {questionTableColumns.map((item) => (
          <th
            key={item.id}
            style={{ width: item.width }}
            className={classes.column}
          >
            {item.headerName}
          </th>
        ))}
      </tr>
    </thead>
  );
};

QuestionsTableHeader.propTypes = {
  checked: PropTypes.bool,
  onCheck: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  indeterminate: PropTypes.bool,
};

export default QuestionsTableHeader;
