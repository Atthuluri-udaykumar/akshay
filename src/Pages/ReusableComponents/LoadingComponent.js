import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  loadingContainer: {
    padding: theme.spacing(2),
    height: "265px",
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
}));

function LoadingComponent(props) {
  const classes = useStyles();

  return (
    <div className={classes.loadingContainer}>
      <div style={{ margin: "auto" }}>
        <CircularProgress style={{ color: "grey" }} />
      </div>
    </div>
  );
}

LoadingComponent.propTypes = {};

export default LoadingComponent;
