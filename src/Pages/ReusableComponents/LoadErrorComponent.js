import React from "react";
import PropTypes from "prop-types";
import Alert from '@mui/material/Alert';
import Button from "@mui/material/Button";
import makeStyles from '@mui/styles/makeStyles';
import cx from "classnames";
import { RefreshRounded } from "@mui/icons-material";

const useStyles = makeStyles((theme) => ({
  alertContainerPadHeight: {
    height: "265px",
  },
}));

function LoadErrorComponent(props) {
  const { message, reloadBtnText, padHeight, reloadData, className } = props;
  const classes = useStyles();

  return (
    <div
      className={cx(className, {
        [classes.alertContainerPadHeight]: padHeight,
      })}
    >
      <Alert
        severity="error"
        action={
          reloadData && (
            <Button
              disableElevation
              color="inherit"
              size="small"
              onClick={reloadData}
              startIcon={<RefreshRounded />}
            >
              {reloadBtnText}
            </Button>
          )
        }
      >
        {message}
      </Alert>
    </div>
  );
}

LoadErrorComponent.defaultProps = {
  reloadBtnText: "RELOAD",
  padHeight: true,
};

LoadErrorComponent.propTypes = {
  message: PropTypes.string.isRequired,
  reloadData: PropTypes.func,
  reloadBtnText: PropTypes.string,
  padHeight: PropTypes.bool,
  className: PropTypes.string,
};

export default LoadErrorComponent;
