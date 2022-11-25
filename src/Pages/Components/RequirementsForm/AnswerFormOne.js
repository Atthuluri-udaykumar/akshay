import { Button, CircularProgress, Divider, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import FormItem from "./FormItem";
import { isLogicQuestion, isEmptyAnswer } from "./utils";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => {
  return {
    root: { width: "100%" },
    formItemsContainer: { width: "100%" },
    formItem: {
      margin: `${theme.spacing(3)} 0px`,
      display: "flex",
      justifyContent: "center",
    },
    submitBtn: { padding: "16px 0px" },
    routingContainer: { padding: "16px" },
    loadingText: { marginLeft: "16px" },
  };
});

// Returns the next logic question index or the last question index
// if there isn't one. Returns null for certain conditions like if
// there are no questions or the startIndex is already at the end
function getNextLogicQuestionIndex(form, startIndex = 0) {
  if (form.questions.length === 0) {
    return null;
  }

  if (form.questions.length <= startIndex) {
    return null;
  }

  let end = null;

  for (let i = startIndex; i < form.questions.length; i++) {
    end = i;
    const formItem = form.questions[i];

    if (isLogicQuestion(formItem.questionTemplate.questionTypeName)) {
      // stop only if the question has options mapped to other questions
      const hasOptionWithLogic = formItem.questionTemplate.options.find(
        (option) => {
          const destIndex = formItem.logic[option.optionId];
          return (
            destIndex !== undefined &&
            destIndex !== null &&
            // destIndex !== "end" &&
            destIndex !== ""
          );
        }
      );

      if (hasOptionWithLogic) {
        break;
      }
    }
  }

  return end;
}

// Returns an array of formItem/question indexes (positions)
// from the start index, stopping at the next logic question index (inclusive)
// or the end of the question list
function getNextQuestionsSlice(form, startIndex = 0) {
  const end = getNextLogicQuestionIndex(form, startIndex);

  if (end === null) {
    return [];
  }

  // add 1, cause we work with zero-based indexes
  const indexes = Array(end + 1 - startIndex)
    .fill(0)
    .map((empty, index) => {
      return startIndex + index;
    });

  return indexes;
}

// Form answer layout One, show all the questions that can show
// as a list until it encounters a logic question and pauses, waits for
// the user to answer and does the same thing over again until all the
// questions in that logic line are answered
const AnswerFormOne = (props) => {
  const { form, onSubmit } = props;
  const classes = useStyles();

  // openQuestions is an array of formItem indexes or positions in the form
  const [openQuestions, setOpenQuestions] = React.useState(() => {
    return getNextQuestionsSlice(form, 0);
  });

  // an array of answers mapping one-to-one with openQuestions
  const [answers, setAnswers] = React.useState([]);

  const [routingAt, setShowRoutingAt] = React.useState(-1);

  // a flag to store if all the questions have been answered and can
  // be submitted
  const [isComplete, setIsComplete] = React.useState(false);

  /**
   *               /-> End
   * q1 -> q2 -> q3 -> q4 -> q5 -> q6 -> q7 -> q8 -> End
   *               \-> q5 -> q7 -> q8 -> End
   *                     \-> q8 -> End
   */

  /**
   * sort q by index
   * [q1, q2, q3*, q4, q5*, q6, q7, q8]
   * [q1, q2, q3]
   * option 1 for q3 -> set isComplete = true
   * option 3 for q3
   * [q1, q2, q3, q5]
   *
   * [q1, q2, q3, q4, q5]
   * option 1 for q5
   * [q1, q2, q3, q4, q5, q7, q8] set isComplete = true
   */

  // form logic for saving question answers and other side effects
  // [index] param is the formItem index in openQuestions
  // [answer] param is the question answer, and it's either a string or an array of strings
  // depending on the question type
  const onAnswerQuestion = (index, answer) => {
    // save answer for immediate feedback
    let newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);

    let newOpenQuestions = [...openQuestions];
    const formItemIndex = newOpenQuestions[index];
    const formItem = form.questions[formItemIndex];
    const hasLogic = isLogicQuestion(
      formItem.questionTemplate.questionTypeName
    );

    const destIndex = hasLogic
      ? formItem.logic[answer] || index + 1
      : index + 1;

    let nextSlice = [];
    let shouldEnd =
      openQuestions.length === form.questions.length ||
      openQuestions[openQuestions.length - 1] ===
        form.questions[form.questions.length - 1].index;

    if (destIndex === "end") {
      shouldEnd = true;
    } else {
      nextSlice = getNextQuestionsSlice(form, destIndex);
    }

    // only logic questions require routing
    if (hasLogic) {
      setShowRoutingAt(index);

      if (isEmptyAnswer(answer)) {
        newOpenQuestions = newOpenQuestions.slice(0, index + 1);
        newAnswers = newAnswers.slice(0, index + 1);
        setOpenQuestions(newOpenQuestions);
        setAnswers(newAnswers);
        return;
      } else if (nextSlice.length > 0) {
        const matchingSlice = openQuestions.slice(
          index + 1,
          index + 1 + nextSlice.length
        );

        let shouldAddSlice = nextSlice.length !== matchingSlice.length;

        for (let i = 0; i < nextSlice.length && shouldAddSlice === false; i++) {
          if (nextSlice[i] !== matchingSlice[i]) {
            shouldAddSlice = true;
            break;
          }
        }

        if (shouldAddSlice) {
          newOpenQuestions = newOpenQuestions.slice(0, index + 1);
          newAnswers = newAnswers.slice(0, index + 1);
          newOpenQuestions = newOpenQuestions.concat(nextSlice);
          setOpenQuestions(newOpenQuestions);
          setAnswers(newAnswers);
        }
      }

      setShowRoutingAt(-1);
    }

    if (shouldEnd === false) {
      const lastOpenFormItem =
        form.questions[newOpenQuestions[newOpenQuestions.length - 1]];

      shouldEnd =
        lastOpenFormItem &&
        isLogicQuestion(lastOpenFormItem.questionTemplate.questionTypeName) &&
        !isEmptyAnswer(newAnswers[openQuestions.length - 1]) &&
        lastOpenFormItem.logic[newAnswers[openQuestions.length - 1]] === "end";
    }

    if (shouldEnd) {
      const unansweredIndex = newOpenQuestions.findIndex((unused, index) =>
        isEmptyAnswer(newAnswers[index])
      );

      if (unansweredIndex === -1) {
        setIsComplete(true);
      } else {
        setIsComplete(false);
      }
    }
  };

  const submitQuestions = () => {
    const questionsAndAnswers = openQuestions.map((formItemIndex, index) => {
      const formItem = form.questions[formItemIndex];
      const answer = answers[index];
      return { formItem, answer };
    });

    onSubmit(questionsAndAnswers);
  };

  if (form.questions.length === 0) {
    return (
      <Typography variant="body1">
        Form <em>{form.name}</em> has no questions available
      </Typography>
    );
  }

  const isRouting = routingAt !== -1;
  const stopIndex = isRouting ? routingAt + 1 : openQuestions.length;
  const openQuestionsSlice = openQuestions.slice(0, stopIndex);
  const formItemNodes = openQuestionsSlice.map((formItemIndex, index) => {
    const formItem = form.questions[formItemIndex];
    return (
      <React.Fragment key={formItemIndex}>
        {index !== 0 && <Divider />}
        <div className={classes.formItem}>
          <div style={{ minWidth: "400px" }}>
            <FormItem
              formItem={formItem}
              onChange={(value) => onAnswerQuestion(index, value)}
              value={answers[index]}
            />
          </div>
        </div>
      </React.Fragment>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.formItemsContainer}>{formItemNodes}</div>
      {isRouting && (
        <div className={classes.routingContainer}>
          <CircularProgress size={16} />
          <Typography variant="body2" className={classes.loadingText}>
            Loading questions
          </Typography>
        </div>
      )}
      {isComplete && (
        <div className={classes.submitBtn}>
          <Button
            disableElevation
            variant="contained"
            color="primary"
            onClick={submitQuestions}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

AnswerFormOne.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AnswerFormOne;
