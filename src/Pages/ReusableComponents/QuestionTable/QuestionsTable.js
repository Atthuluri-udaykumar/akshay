import React from "react";
import PropTypes from "prop-types";
import { Alert, Pagination } from '@mui/material';
import { Paper } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import QuestionsTableHeader from "./QuestionsTableHeader";
import QuestionsTableBody from "./QuestionsTableBody";
import LoadStateAndError from "../LoadStateAndError";

const useStyles = makeStyles((theme) => ({
  table: {
    tableLayout: "fixed",
    width: "100%",
    borderCollapse: "collapse",

    "& th": {
      fontWeight: 500,
      lineHeight: "1.5rem",
    },

    "& .MuiCheckbox-root": {
      padding: 0,
    },
  },
  navigation: {
    marginTop: theme.spacing(2),
  },
  paper: {
    width: "100%",
    height: "500px",
    overflow: "auto",
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  loadingPaper: {
    width: "100%",
    height: "200px",
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
  },
  nothingFoundRoot: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
}));

const QuestionsTable = (props) => {
  const {
    disabled,
    disableHeader,
    onEdit,
    checkedRowsMap,
    headerIndeterminate,
    headerChecked,
    page,
    totalPages,
    onNavigate,
    pageRows,
    loading,
    error,
    reloadFunc,
    onCheck,
    onCheckAll,
  } = props;

  const classes = useStyles();
  const hasData = pageRows && pageRows.length > 0;
  const showLoadingOrError = loading || error;

  return (
    <React.Fragment>
      {!showLoadingOrError && !hasData && (
        <Alert severity="info" className={classes.nothingFoundRoot}>
          Nothing found!
        </Alert>
      )}
      {!showLoadingOrError && hasData && (
        <Paper className={classes.paper} elevation={0} variant="outlined">
          <table className={classes.table}>
            <QuestionsTableHeader
              checked={headerChecked}
              disabled={disabled || disableHeader}
              indeterminate={headerIndeterminate}
              onCheck={onCheckAll}
            />
            <QuestionsTableBody
              disabled={disabled}
              rows={pageRows}
              onEdit={onEdit}
              checkedRowsMap={checkedRowsMap}
              onCheck={onCheck}
            />
          </table>
        </Paper>
      )}
      {showLoadingOrError && (
        <Paper
          className={classes.loadingPaper}
          elevation={0}
          variant="outlined"
        >
          <LoadStateAndError
            loading={loading}
            loadingMessage="Loading questions..."
            error={error}
            reloadFunc={reloadFunc}
          />
        </Paper>
      )}
      <Pagination
        disabled={disabled}
        count={totalPages}
        variant="outlined"
        shape="rounded"
        page={page}
        className={classes.navigation}
        onChange={(evt, nextPage) => onNavigate(nextPage)}
      />
    </React.Fragment>
  );
};

QuestionsTable.propTypes = {
  disabled: PropTypes.bool,

  // Used to disable the check all box when the user is searhcing.
  // See onCheckAll function in QuestionsViewContainer for explanation.
  disableHeader: PropTypes.bool,
  checkedRowsMap: PropTypes.object,
  headerIndeterminate: PropTypes.bool,
  headerChecked: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.string,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  reloadFunc: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  pageRows: PropTypes.array.isRequired,
  onCheck: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCheckAll: PropTypes.func.isRequired,
};

export default QuestionsTable;
