import React from "react";
import { IconButton, Checkbox } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { EditRounded } from "@mui/icons-material";
import { questionTableColumns } from "./columns";
import PropTypes from "prop-types";
import QuestionTableCell from "./QuestionTableCell";

const useStyles = makeStyles((theme) => {
  const padding = 16;
  return {
    btn: {
      border: `1px solid ${theme.palette.grey[300]}`,
      borderRadius: "50%",
      width: "30px",
      height: "30px",
    },
    icon: {
      fontSize: "16px",
    },
    checkbox: {
      padding,
      textAlign: "center",
      verticalAlign: "top",
    },
    actions: {
      padding,
      textAlign: "center",
      verticalAlign: "top",
    },
    column: {
      padding,
      textAlign: "left",
      verticalAlign: "top",
    },
    row: {
      borderBottom: `1px solid ${theme.palette.grey[300]}`,

      "&:last-of-type": {
        borderBottom: "none",
      },
    },
  };
});

const QuestionsTableRow = (props) => {
  const { row, disabled, checked, onCheck, onEdit } = props;
  const classes = useStyles();

  return (
    <tr className={classes.row}>
      <td key="checkbox" className={classes.checkbox}>
        <Checkbox
          color="primary"
          disabled={disabled}
          checked={checked || false}
          onChange={onCheck}
          inputProps={{
            "aria-label": checked ? "Deselect question" : "Select question",
          }}
        />
      </td>
      <td key="actions" className={classes.actions}>
        <IconButton
          color="primary"
          aria-label="Edit"
          onClick={onEdit}
          className={classes.btn}
          disabled={disabled}
          size="large">
          <EditRounded className={classes.icon} />
        </IconButton>
      </td>
      {questionTableColumns.map((item) => (
        <td key={item.id} className={classes.column}>
          <QuestionTableCell value={row[item.field]} />
        </td>
      ))}
    </tr>
  );
};

QuestionsTableRow.propTypes = {
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onCheck: PropTypes.func.isRequired,
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default QuestionsTableRow;
