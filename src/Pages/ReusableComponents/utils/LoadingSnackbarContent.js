import React from "react";
import classnames from "classnames";
import makeStyles from '@mui/styles/makeStyles';
import { Typography, CircularProgress } from "@mui/material";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
  loadingIcon: {
    display: "inline-block",
    marginRight: "16px",
  },
  root: {
    display: "flex",
    alignItems: "center",
  },
}));

const LoadingSnackbarContent = (props) => {
  const { message, className, style } = props;
  const classes = useStyles();

  return (
    <div style={style} className={classnames(classes.root, className)}>
      <CircularProgress size={18} className={classes.loadingIcon} />
      <Typography variant="body1" style={{ display: "inline-block" }}>
        {message}
      </Typography>
    </div>
  );
};

LoadingSnackbarContent.propTypes = {
  message: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
};

LoadingSnackbarContent.defaultProps = {
  message: "Loading",
};

export default LoadingSnackbarContent;
