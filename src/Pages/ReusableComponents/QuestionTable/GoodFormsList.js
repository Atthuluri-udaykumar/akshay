import React from "react";
import PropTypes from "prop-types";
import { List, ListItem, Checkbox, ListItemIcon, ListItemText, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { questionTableColumnFields } from "./columns";

const NEW_MARK = "New";
const EXISTING_MARK = "Existing";

const useStyles = makeStyles((theme) => {
  return {
    dot: {
      display: "inline-block",
      fontWeight: "bold",
    },
    mark: {
      display: "inline-block",
    },
  };
});

const GoodFormsList = (props) => {
  const { form, disabled, toggleQuestionInForm } = props;
  const classes = useStyles();

  return (
    <List dense style={{ width: "100%", paddingTop: "0px" }}>
      {form.questions.map(
        ({ question, isActive, questionExists }, questionIndex) => {
          const mark = questionExists ? EXISTING_MARK : NEW_MARK;
          return (
            <ListItem
              dense
              button
              key={questionIndex}
              role={undefined}
              onClick={() => {
                if (form.isActive) {
                  toggleQuestionInForm(form, questionIndex, !isActive);
                }
              }}
              divider={questionIndex < form.questions.length - 1}
              disabled={!form.isActive}
            >
              <ListItemIcon>
                <Checkbox
                  disableRipple
                  edge="start"
                  checked={isActive}
                  tabIndex={-1}
                  color="primary"
                  disabled={!form.isActive || disabled}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span>
                    {question[questionTableColumnFields.questionText]}{" "}
                    <span className={classes.dot}>&#183;</span>{" "}
                    <Typography variant="subtitle2" className={classes.mark}>
                      {mark}
                    </Typography>
                  </span>
                }
              />
            </ListItem>
          );
        }
      )}
    </List>
  );
};

GoodFormsList.propTypes = {
  form: PropTypes.object.isRequired,
  toggleQuestionInForm: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default GoodFormsList;
