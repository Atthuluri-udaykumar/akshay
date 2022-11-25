import React from "react";
import { Button, IconButton } from "@mui/material";
import { TableChartOutlined, TocOutlined } from "@mui/icons-material";
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from "prop-types";

export const QuestionsViewType = Object.freeze({
  Table: "table",
  List: "list",
});

const useStyles = makeStyles((theme) => {
  return {
    root: {},
    controlsContainer: { display: "flex" },
    selectedCount: { marginTop: theme.spacing(1) },
    btn: {
      border: `1px solid ${theme.palette.grey[300]}`,
      borderRadius: "50%",
      marginLeft: "16px",
    },
    leftControls: {
      display: "flex",
      flex: 1,
      marginRight: "16px",
    },
  };
});

const QuestionsTableControls = (props) => {
  const {
    onAddToForms,
    isAddToFormsDisabled,
    viewType,
    disabled,
    selectedCount,
    onChangeViewType,
  } = props;

  const classes = useStyles();

  const controlsNode = (
    <div className={classes.controlsContainer}>
      <div className={classes.leftControls}>
        <Button
          disableElevation
          variant="contained"
          color="primary"
          disabled={disabled || isAddToFormsDisabled}
          onClick={onAddToForms}
        >
          Add Selected to Forms
        </Button>
      </div>
      {/* <div>
        <IconButton
          aria-label="Table view"
          title="Table view"
          primary={viewType === QuestionsViewType.Table}
          onClick={() => onChangeViewType(QuestionsViewType.Table)}
          className={classes.btn}
        >
          <TableChartOutlined />
        </IconButton>
        <IconButton
          aria-label="List view"
          title="List view"
          primary={viewType === QuestionsViewType.List}
          onClick={() => onChangeViewType(QuestionsViewType.List)}
          className={classes.btn}
        >
          <TocOutlined />
        </IconButton>
      </div> */}
    </div>
  );

  return (
    <div className={classes.root}>
      {controlsNode}
      {selectedCount > 0 && (
        <div className={classes.selectedCount}>
          {selectedCount} question{selectedCount === 1 ? "" : "s"} selected
        </div>
      )}
    </div>
  );
};

QuestionsTableControls.propTypes = {
  onAddToForms: PropTypes.func.isRequired,
  isAddToFormsDisabled: PropTypes.bool,
  disabled: PropTypes.bool,
  selectedCount: PropTypes.number.isRequired,
  viewType: PropTypes.string.isRequired,
  onChangeViewType: PropTypes.func.isRequired,
};

export default QuestionsTableControls;
