import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Paper, Typography } from "@mui/material";
import PropTypes from "prop-types";
import cx from "classnames";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      padding: "16px",
    },
    answerContainer: {
      marginTop: theme.spacing(4),
    },
    required: {
      color: "red",
      display: "inline-block",
    },
    title: {
      fontSize: "16px",
    },
  };
});

const SectionItem = (props) => {
  const { title, description, required, className, children } = props;
  const classes = useStyles();
  return (
    <Paper
      elevation={0}
      variant="outlined"
      className={cx(classes.root, className)}
    >
      <Typography variant="h6" className={classes.title}>
        {title}
        {required && <span className={classes.required}>*</span>}
      </Typography>
      {description && <Typography variant="body1">{description}</Typography>}
      <div className={classes.answerContainer}>{children}</div>
    </Paper>
  );
};

SectionItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default SectionItem;
