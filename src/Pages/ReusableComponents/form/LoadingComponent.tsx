import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { LinearProgress, CircularProgress } from "@mui/material";

export interface ILinearLoadingComponentProps {
  variant: "determinate" | "indeterminate" | "buffer" | "query";
  value?: number;
  valueBuffer?: number;
  color?: "primary" | "secondary" | "inherit";
}

export const LinearLoader = (props: ILinearLoadingComponentProps) => {
  const { variant, value, valueBuffer, color } = props;

  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgress
        variant={variant}
        value={value}
        valueBuffer={valueBuffer}
        color={color}
      />
    </Box>
  );
};

export const CicularLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 100 ? 0 : prevProgress + 10
      );
    }, 800);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Stack spacing={2} direction="row">
      <CircularProgress variant="determinate" value={progress} />
    </Stack>
  );
};
