import React from "react";
import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import QuestionsTableControls, {
  QuestionsViewType,
} from "./QuestionTableControls";
import QuestionsTable from "./QuestionsTable";
import QuestionsList from "./QuestionsList";
import PropTypes from "prop-types";
import QuestionTableSearchControls from "./QuestionSearchControls";
import LoadStateAndError from "../LoadStateAndError";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      padding: theme.spacing(2),
      height: "100%",
    },
    controlsContainer: {
      marginBottom: theme.spacing(4),
    },
  };
});

const QuestionsView = (props) => {
  const {
    searchProps,
    tableProps,
    controlsProps,
    questionsState,
    getQuestionsData,
  } = props;

  const classes = useStyles();
  const [viewType, setViewType] = React.useState(QuestionsViewType.Table);
  const loadNodes = [];
  const searchNodes = [];

  if (questionsState.showLoading || questionsState.loadError) {
    loadNodes.push(
      <LoadStateAndError
        key="questions-load-state"
        loading={questionsState.showLoading}
        loadingMessage="Loading question templates..."
        error={questionsState.loadError}
        reloadFunc={() => getQuestionsData()}
      />
    );
  }

  let content = null;

  if (loadNodes.length === 0) {
    content = (
      <React.Fragment>
        <div className={classes.controlsContainer}>
          <QuestionTableSearchControls {...searchProps} />
        </div>
        <QuestionsTableControls
          {...controlsProps}
          viewType={viewType}
          onChangeViewType={setViewType}
        />
        {viewType === QuestionsViewType.Table ? (
          <QuestionsTable {...tableProps} />
        ) : (
          <QuestionsList {...tableProps} />
        )}
      </React.Fragment>
    );
  }

  return (
    <div className={classes.root}>
      <Typography variant="h2">Question Search</Typography>
      {loadNodes}
      {searchNodes}
      {content}
    </div>
  );
};

QuestionsView.propTypes = {
  getQuestionsData: PropTypes.func.isRequired,
  tableProps: PropTypes.shape(QuestionsTable.propTypes).isRequired,
  searchProps: PropTypes.shape(QuestionTableSearchControls.propTypes)
    .isRequired,

  questionsState: PropTypes.shape({
    showLoading: PropTypes.bool,
    loadError: PropTypes.string,
  }).isRequired,

  controlsProps: PropTypes.shape({
    isAddToFormsDisabled: PropTypes.bool,
    disabled: PropTypes.bool,
    onAddToForms: PropTypes.func.isRequired,
    selectedCount: PropTypes.number.isRequired,
  }).isRequired,
};

export default QuestionsView;

