import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  ListItem,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Grid,
  List,
} from "@mui/material";
import { END, NONE } from "./constants";
import { IFormItem } from "./types";

const useStyles = makeStyles(() => {
  return {
    circularProgress: {
      color: "grey",
    },
    icon: {
      fontSize: "20px",
    },
    formControl: {
      width: "100%",
    },
    outerListItem: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    selectContainer: {
      justifyContent: "flex-end",
      marginLeft: "8px",
      maxWidth: "40%",
    },
    optionHeader: {
      display: "inline-block",
      marginRight: "12px",
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "1.57",
    },
  };
});

export interface IGotoQuestionProps {
  disabled: boolean;
  formItem: IFormItem;
  formItems: IFormItem[];
  handleOnUpdateGoto: (optionId: number, destQuestionId: number) => void;
}

const GotoQuestion: React.FC<IGotoQuestionProps> = (props) => {
  const { disabled, formItem, formItems, handleOnUpdateGoto } = props;
  const classes = useStyles();
  const question = formItem.questionTemplate!; // question is not null
  const gotos = formItem.logic || {}; // array inside an object with optionId as key
  const possibleDestFormItems = React.useMemo(() => {
    return formItems
      .filter((item) => item.index > formItem.index) // filter out items before current item in form
      .sort((item1, item2) => item1.index - item2.index); // sort by index ascending
  }, [formItem, formItems]);

  const internalOnChange = async (optionId, event) => {
    let destQuestionId = event.target.value;

    if (destQuestionId === NONE) {
      destQuestionId = "";
    }

    await handleOnUpdateGoto(optionId, destQuestionId);
  };

  const renderSelectGoto = (optionId) => {
    return (
      <FormControl className={classes.formControl}>
        <Select
          disabled={disabled}
          value={gotos[optionId] || NONE}
          onChange={(evt) => internalOnChange(optionId, evt)}
          placeholder="Select goto location"
        >
          <MenuItem key={NONE} value={NONE}>
            <em>No logic needed</em>
          </MenuItem>
          <MenuItem key={END} value={END}>
            <em>Go to end</em>
          </MenuItem>
          {possibleDestFormItems.map((item) => {
            const destNumber = item.index + 1;
            const label = `Goto question ${destNumber}`;

            return (
              <MenuItem
                key={item.questionTemplateId}
                value={item.questionTemplateId}
              >
                {label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  };

  const renderGotoLine = () => {
    const answers = question.options || [];

    return (
      <List>
        {answers.map((answer, index) => {
          const optionId = answer.optionId;

          return (
            <ListItem
              key={optionId}
              style={{ paddingLeft: "0px", paddingRight: "0px" }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>
                    <span className={classes.optionHeader}>
                      Option {index + 1}:
                    </span>
                    {answer.optionText}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  {renderSelectGoto(optionId)}
                </Grid>
              </Grid>
            </ListItem>
          );
        })}
      </List>
    );
  };

  return renderGotoLine();
};

export default GotoQuestion;
