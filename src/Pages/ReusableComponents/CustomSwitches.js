import React from "react";
import withStyles from '@mui/styles/withStyles';
import Switch from "@mui/material/Switch";

export const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    "&$checked": {
      transform: "translateX(16px)",
      color: theme.palette.common.white,
      "& + $track": {
        backgroundColor: "#52d869",
        opacity: 1,
        border: "none",
      },
    },
    "&$focusVisible $thumb": {
      color: "#52d869",
      border: "6px solid #fff",
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

export const AntSwitch = withStyles((theme) => {
  const width = 38;
  const height = 22;

  return {
    root: {
      width,
      height,
      padding: 0,
      display: "flex",
    },
    switchBase: {
      padding: 2,
      // color: theme.palette.grey[100],

      "&$checked": {
        // transform: "translateX(12px)",
        transform: "translateX(16px)",
        color: theme.palette.common.white,
        "& + $track": {
          opacity: 1,
          backgroundColor: "#1890ff",
          // borderColor: "#1890ff",
          // borderColor: theme.palette.primary.main,
        },
      },
    },
    thumb: {
      width: 18,
      height: 18,
      // boxShadow: "none",
      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    },
    track: {
      // border: `1px solid ${theme.palette.grey[700]}`,
      borderRadius: height / 2,
      opacity: 1,
      // backgroundColor: theme.palette.common.white,
      backgroundColor: "rgba(0,0,0,.25)",
    },
    checked: {},
  };
})(Switch);
