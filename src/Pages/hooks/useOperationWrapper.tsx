import React from "react";
import { SnackbarKey, useSnackbar } from "notistack";
import { delay } from "lodash";
import { useRequest } from "ahooks";
import LoadingSnackbarContent from "../ReusableComponents/utils/LoadingSnackbarContent";

export interface IOperationWrapperOptions {
  loadingMessage?: string;
  successMessage?: string;
  defaultErrorMessage?: string;
}

export function useOperationWrapper<Result, Params extends any[]>(
  func: (...args: Params) => Result | Promise<Result>,
  options: IOperationWrapperOptions = {
    loadingMessage: "Loading...",
    successMessage: "Operation successful.",
    defaultErrorMessage: "An error occurred.",
  }
) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const wrappedFunc = React.useCallback(
    async (...args: Params): Promise<Result | undefined> => {
      let loadingKey: SnackbarKey | undefined;

      try {
        loadingKey = enqueueSnackbar(
          <LoadingSnackbarContent message={options.loadingMessage} />,
          { variant: "default" }
        );

        const result = await func(...args);
        closeSnackbar(loadingKey);
        delay(() => {
          enqueueSnackbar(options.successMessage, {
            variant: "success",
          });
        }, 500);

        return result;
      } catch (error: any) {
        closeSnackbar(loadingKey);
        enqueueSnackbar(error?.message || options.defaultErrorMessage, {
          variant: "error",
        });
      }
    },

    [
      func,
      options.loadingMessage,
      options.successMessage,
      options.defaultErrorMessage,
    ]
  );

  return useRequest(wrappedFunc, { manual: true });
}
