import React from "react";
import PropTypes from "prop-types";
import { List, ListItem, ListItemText, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { questionTableColumnFields } from "./columns";

const useStyles = makeStyles((theme) => {
  return {
    dot: {
      display: "inline-block",
      fontWeight: "bold",
    },
    mark: {
      display: "inline-block",
    },
    listItem: {
      paddingLeft: "8px",
      paddingRight: "8px",
    },
  };
});

const InvalidQuestionsList = (props) => {
  const { list } = props;
  const classes = useStyles();

  return (
    <List dense style={{ width: "100%", paddingTop: "0px" }}>
      {list.map(({ question, issue }, questionIndex) => {
        return (
          <ListItem
            dense
            key={questionIndex}
            divider={questionIndex < list.length - 1}
          >
            <ListItemText
              primary={
                <Typography variant="body2">
                  {question[questionTableColumnFields.questionText]?.trim() ||
                    "[No question text]"}{" "}
                  <span className={classes.dot}>&#183;</span>{" "}
                  <Typography variant="subtitle2" className={classes.mark}>
                    {issue}
                  </Typography>
                </Typography>
              }
              className={classes.listItem}
            />
          </ListItem>
        );
      })}
    </List>
  );
};

InvalidQuestionsList.propTypes = {
  list: PropTypes.array.isRequired,
};

export default InvalidQuestionsList;
