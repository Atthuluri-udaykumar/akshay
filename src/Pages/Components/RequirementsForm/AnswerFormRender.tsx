import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { IFormItem, QuestionsAnswersMap, IQuestionAnswer } from "./types";
import { Button, Box, Theme, Grid, Tooltip, Typography } from "@mui/material";
import FormItem from "./FormItem";
import { merge, defaultTo } from "lodash";
import DateToggleSwitch from "../DateToggleSwitch";
import ButtonInput from "../../ReusableComponents/form/ButtonInput";

export interface IAnswerFormRenderProps {
  countryName?:string,
  formName?:string,
  isComplete?: boolean;
  formItems: IFormItem[];
  answers: QuestionsAnswersMap;
  onAnswer: (answer: IQuestionAnswer, index: number) => void;
  onSubmit: (value: QuestionsAnswersMap) => void;
  onFinalize: (value: QuestionsAnswersMap) => void;
  onCancel: () => void;
}

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: { width: "75%", paddingLeft: "10px" },
    formItemsContainer: {
      width: "100%",
      marginBlock: "3px",
      borderWidth: "3px",
      backgroundColor: "#fbfbfb",
    },
    formItem: {
      margin: `${theme.spacing(3)} 0px`,
      display: "flex",
      justifyContent: "left",
      paddingLeft: "12px",
    },
    btnContainer: { padding: "16px 12px" },
    finalizeBtn: {
      padding: "0 16px",
      display: "inline-block",
    },
    routingContainer: { padding: "16px" },
    loadingText: { marginLeft: "16px" },
  };
});

const AnswerFormRender: React.FC<IAnswerFormRenderProps> = (props) => {
  const {
    countryName,
    formName,
    isComplete,
    formItems,
    answers,
    onAnswer,
    onSubmit,
    onFinalize,
    onCancel,
  } = props;
  const classes = useStyles();
  const formItemNodes = formItems.map((formItem, index) => {
    let answer: IQuestionAnswer | null = null;
    if (answers[formItem.questionTemplateId]) {
      answer = answers[formItem.questionTemplateId];
    }

    return (
      <React.Fragment key={formItem.formItemId}>
        <div className={classes.formItem}>
          <Grid container spacing={3} direction="row" alignItems="left">
            <Grid item xs={7}>
              <FormItem
                formItem={formItem}
                onChange={(value) => {
                  onAnswer({ ...defaultTo(answer, {}), value }, index);
                }}
                value={answer?.value}
              />
            </Grid>
            <Grid item xs={5}>
              <DateToggleSwitch
                value={answer?.effectiveDate}
                onChange={(effectiveDate) => {
                  onAnswer(
                    merge(
                      { effectiveDate } ? { ...answer, effectiveDate } : answer
                    ),
                    index
                  );
                }}
              />
            </Grid>
          </Grid>
        </div>
      </React.Fragment>
    );
  });

  return (
    <div className={classes.root}>
      <Typography variant="h6" component="div">{formName} | {countryName}</Typography>
      <Box borderRight={1} borderBottom={1}>
        <div className={classes.formItemsContainer}>{formItemNodes}</div>
        <div className={classes.btnContainer}>
          <Button
            disableElevation
            variant="contained"
            color="primary"
            onClick={() => {
              onSubmit(answers);
            }}
          >
            Save
          </Button>
          <div className={classes.finalizeBtn}>
            <Button
              disabled={!isComplete}
              disableElevation
              variant="contained"
              color="primary"
              onClick={() => {
                onFinalize(answers);
              }}
            >
              Finalize
            </Button>
            <ButtonInput
              disabled={!isComplete}
              text="Cancel"
              variant="contained"
              color="primary"
              onClick={onCancel}
            />
          </div>
        </div>
      </Box>
    </div>
  );
};

export default AnswerFormRender;
