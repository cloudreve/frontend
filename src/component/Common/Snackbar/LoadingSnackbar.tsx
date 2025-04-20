import { Box } from "@mui/material";
import MuiSnackbarContent from "@mui/material/SnackbarContent";
import { CustomContentProps } from "notistack";
import * as React from "react";
import { forwardRef, useEffect, useState } from "react";
import CircularProgress from "../CircularProgress.tsx";

declare module "notistack" {
  interface VariantOverrides {
    loading: {
      getProgress?: () => number;
    };
  }
}

interface LoadingSnackbarProps extends CustomContentProps {
  getProgress?: () => number;
}

const LoadingSnackbar = forwardRef<HTMLDivElement, LoadingSnackbarProps>((props, ref) => {
  const [progress, setProgress] = useState(0);
  const {
    // You have access to notistack props and options 👇🏼
    message,
    action,
    id,
    getProgress,
    // as well as your own custom props 👇🏼
    ...other
  } = props;

  useEffect(() => {
    var intervalId: NodeJS.Timeout;
    if (getProgress) {
      intervalId = setInterval(() => {
        setProgress(getProgress());
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [getProgress]);

  let componentOrFunctionAction: React.ReactNode = undefined;
  if (typeof action === "function") {
    componentOrFunctionAction = action(id);
  } else {
    componentOrFunctionAction = action;
  }

  return (
    <MuiSnackbarContent
      ref={ref}
      sx={{ borderRadius: "12px" }}
      message={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box>
            <CircularProgress
              size={20}
              sx={{ height: 20, mr: 2 }}
              variant={progress ? "determinate" : "indeterminate"}
              value={progress}
            />
          </Box>
          <Box>{message}</Box>
          {componentOrFunctionAction && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginLeft: "auto",
                paddingLeft: "16px",
                marginRight: "-8px",
              }}
            >
              {componentOrFunctionAction}
            </Box>
          )}
        </Box>
      }
    />
  );
});

export default LoadingSnackbar;
