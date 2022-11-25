import React from "react";
import PropTypes from "prop-types";
import { Checkbox, List, ListItem } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import QuestionsListItem from "./QuestionsListItem";
import { questionTableColumnFields } from "./columns";

const useStyles = makeStyles((theme) => {
  return {
    root: {},
    listActionsContainer: { marginBottom: "16px" },
    list: {},
  };
});

const QuestionsList = (props) => {
  const {
    rows,
    disabled,
    checkedRowsMap,
    headerIndeterminate,
    headerChecked,
    onEdit,
    onCheckAll,
    onCheck,
  } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.listActionsContainer}>
        <Checkbox
          color="primary"
          disabled={disabled}
          indeterminate={headerIndeterminate}
          checked={headerChecked}
          onChange={onCheckAll}
          inputProps={{
            "aria-label":
            headerChecked || headerIndeterminate
                ? "Uncheck selected questions"
                : "Check all question",
          }}
        />
      </div>
      <List dense className={classes.list} component="div" role="list">
        {rows.map((row, i) => {
          const showDivider = i !== rows.length - 1;

          return (
            <QuestionsListItem
              key={row[questionTableColumnFields.questionId]}
              checked={
                checkedRowsMap[row[questionTableColumnFields.questionId]]
              }
              disabled={disabled}
              onCheck={() => onCheck(row[questionTableColumnFields.questionId])}
              onEdit={() => onEdit(row[questionTableColumnFields.questionId])}
              row={row}
              showDivider={showDivider}
            />
          );
        })}
        <ListItem />
      </List>
    </div>
  );
};

QuestionsList.propTypes = {
  disabled: PropTypes.bool,
  checkedRowsMap: PropTypes.object,
  onCheck: PropTypes.func.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEdit: PropTypes.func.isRequired,
  headerIndeterminate: PropTypes.bool,
  headerChecked: PropTypes.bool,
  onCheckAll: PropTypes.func.isRequired,
};

export default QuestionsList;
