import PropTypes from "prop-types";
import { IconButton, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { ExpandLessRounded, ExpandMoreRounded } from "@mui/icons-material";
import GotoQuestion from "./GotoQuestion";
import QuestionDetails from "./QuestionDetails";
import { isLogicQuestion } from "./utils";
import { isEmptyString } from "../../../util_funcs/reusables";

const useStyles = makeStyles((theme) => ({
  summary: {
    display: "flex",
  },
  questionText: {
    margin: `0px ${theme.spacing(2)}`,
    display: "flex",
    flex: 1,
  },
  content: {
    marginBottom: theme.spacing(2),
  },
  summaryContainer: { display: "flex", marginBottom: "8px" },
  questionNumberContainer: { display: "flex", alignItems: "center" },
  questionTextContainer: {
    display: "flex",
    margin: "0 16px",
    flex: 1,
    alignItems: "center",
  },
  listItemInnerContainer: { width: "100%" },
}));

const RequirementFormQuestionItem = (props) => {
  const {
    questionListIndex,
    formItem,
    onChangeOrder,
    handleOnUpdateGoto,
    disabled,
    formItems,
    questionsCount,
  } = props;

  const classes = useStyles();
  const question = formItem.questionTemplate;
  const isDropdown = isLogicQuestion(question.questionTypeName);
  const questionNumber = questionListIndex + 1;
  const canGoUp = questionListIndex !== 0;
  const canGoDown = questionListIndex < questionsCount - 1;

  const summaryNode = (
    <div className={classes.summaryContainer}>
      <div className={classes.questionNumberContainer}>
        <Typography variant="body1">{questionNumber}.</Typography>
      </div>
      <div className={classes.questionTextContainer}>
        <Typography className={classes.questionText}>
          {isEmptyString(question.questionText)
            ? "[No question text]"
            : question.questionText}
        </Typography>
      </div>
      <div>
        <IconButton
          edge="end"
          aria-label="Move question up"
          onClick={() => onChangeOrder(true)}
          disabled={disabled || !canGoUp}
          size="large">
          <ExpandLessRounded />
        </IconButton>
        <IconButton
          edge="end"
          aria-label="Move question down"
          onClick={() => onChangeOrder(false)}
          disabled={disabled || !canGoDown}
          size="large">
          <ExpandMoreRounded />
        </IconButton>
      </div>
    </div>
  );

  return (
    <div className={classes.listItemInnerContainer}>
      {summaryNode}
      <div className={classes.content}>
        <QuestionDetails question={question} />
      </div>
      {isDropdown && (
        <GotoQuestion
          formItem={formItem}
          handleOnUpdateGoto={handleOnUpdateGoto}
          disabled={disabled}
          formItems={formItems}
        />
      )}
    </div>
  );
};

RequirementFormQuestionItem.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  formItem: PropTypes.object.isRequired,
  formItems: PropTypes.array.isRequired,
  onChangeOrder: PropTypes.func.isRequired,
  handleOnUpdateGoto: PropTypes.func.isRequired,
  questionsCount: PropTypes.number.isRequired,
  questionListIndex: PropTypes.number.isRequired,
};

export default RequirementFormQuestionItem;
