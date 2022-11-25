import React from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { ExpandMoreRounded } from "@mui/icons-material";
import InvalidQuestionsList from "./InvalidQuestionsList";
import GoodFormsList from "./GoodFormsList";

const NEW_MARK = "New draft";
const EXISTING_MARK = "Existing draft";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& .MuiAccordionSummary-content.Mui-expanded": {
      marginTop: "12px",
      marginBottom: "12px",
    },
    "& .MuiListItemIcon-root": {
      minWidth: "auto",
    },
    "& .MuiAccordionSummary-root": {
      paddingLeft: "24px",
      paddingRight: "24px",
    },
    "& .MuiPaper-elevation1": {
      boxShadow: "none",
    },
  },
  wrapper: {
    width: "100%",
  },
  summaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  subHeading: {
    fontSize: theme.typography.pxToRem(15),
    padding: "0 24px",
  },
  accordionDetails: { paddingTop: "0px" },
  divider: {
    marginBottom: theme.spacing(1),
  },
  dot: {
    display: "inline-block",
    fontWeight: "bold",
  },
  mark: {
    display: "inline-block",
  },
}));

const AddToForm = (props) => {
  const {
    forms,
    invalidQuestions,
    toggleForm,
    disabled,
    toggleQuestionInForm,
  } = props;

  const classes = useStyles();
  const goodFormsNode = forms.map((form) => {
    const mark = form.formExists ? EXISTING_MARK : NEW_MARK;
    return (
      <Accordion key={form.formName}>
        <AccordionSummary expandIcon={<ExpandMoreRounded />}>
          <FormControlLabel
            aria-label="Toggle"
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
            control={
              <Checkbox
                checked={form.isActive}
                tabIndex={-1}
                color="primary"
                onChange={() => {
                  toggleForm(form, !form.isActive);
                }}
                disabled={disabled}
              />
            }
            label={
              <React.Fragment>
                <Typography variant="body2">
                  {form.formName} <span className={classes.dot}>&#183;</span>{" "}
                  <Typography variant="subtitle2" className={classes.mark}>
                    {mark}
                  </Typography>
                </Typography>
              </React.Fragment>
            }
          />
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <GoodFormsList
            disabled={disabled}
            form={form}
            toggleQuestionInForm={toggleQuestionInForm}
          />
        </AccordionDetails>
      </Accordion>
    );
  });

  const goodFormsWrappedNode = (
    <div className={classes.wrapper}>{goodFormsNode}</div>
  );

  const invalidQuestionsNode = <InvalidQuestionsList list={invalidQuestions} />;
  const hasInvalidQuestions = invalidQuestions.length > 0;
  const hasValidQuestions = forms.length > 0;
  const invalidQuestionsWrappedNode = hasInvalidQuestions && (
    <div className={classes.wrapper}>{invalidQuestionsNode}</div>
  );

  return (
    <div className={classes.root}>
      {hasValidQuestions && (
        <React.Fragment>
          <Typography gutterBottom variant="h6" className={classes.subHeading}>
            Valid Forms
          </Typography>
          {goodFormsWrappedNode}
        </React.Fragment>
      )}
      {hasInvalidQuestions && (
        <React.Fragment>
          {hasValidQuestions && (
            <Divider
              className={classes.divider}
              style={{ margin: hasValidQuestions ? "24px 0px" : 0 }}
            />
          )}
          <Typography gutterBottom variant="h6" className={classes.subHeading}>
            Invalid Questions
          </Typography>
          {invalidQuestionsWrappedNode}
        </React.Fragment>
      )}
    </div>
  );
};

AddToForm.propTypes = {
  forms: PropTypes.array.isRequired,
  invalidQuestions: PropTypes.array.isRequired,
  toggleForm: PropTypes.func.isRequired,
  toggleQuestionInForm: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default AddToForm;
