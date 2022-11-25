import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import makeStyles from '@mui/styles/makeStyles';
import { Typography } from "@mui/material";
import PropTypes from "prop-types";
import LoadErrorComponent from "./LoadErrorComponent";

const useStyles = makeStyles((theme) => ({
  loadingIcon: {
    color: "grey",
    display: "inline-block",
    marginRight: "16px",
  },
}));

function LoadStateAndError(props) {
  const {
    loading,
    loadingMessage,
    error,
    style,
    className,
    padHeight,
    reloadFunc,
  } = props;

  const classes = useStyles();

  if (loading) {
    return (
      <div style={style} className={className}>
        <CircularProgress size={16} className={classes.loadingIcon} />
        <Typography variant="body1" style={{ display: "inline-block" }}>
          {loadingMessage}
        </Typography>
      </div>
    );
  } else if (error) {
    return (
      <LoadErrorComponent
        padHeight={padHeight}
        message={error}
        reloadData={reloadFunc}
      />
    );
  }

  return null;
}

LoadStateAndError.defaultProps = {
  loadingMessage: "Loading",
  padHeight: false,
};

LoadStateAndError.propTypes = {
  loading: PropTypes.bool,
  padHeight: PropTypes.bool,
  loadingMessage: PropTypes.string,
  error: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  reloadFunc: PropTypes.func,
};

export default LoadStateAndError;
