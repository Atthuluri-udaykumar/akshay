import React from "react";
import { FULFILLED, wrapFnAsync } from "../../util_funcs/awaitPromises";

/**
 * React hook for managing async function call state
 * @param {function} fn
 * @param {object} options
 * - options.manual (boolean, default = false):
 *     whether you want this request triggered manually or automatically
 */

export default function useRequest(fn, { manual = false } = {}) {
  const [data, setData] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState();
  const [initialized, setInitialized] = React.useState(false);

  const internalGetData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const { value, reason, status } = await wrapFnAsync(fn);

    if (status === FULFILLED) {
      setData(value);
    } else {
      setError(reason);
    }

    setLoading(false);
  }, [fn]);

  React.useEffect(() => {
    // don't make another call if already initialized and
    // is not manual

    setInitialized(true);
    internalGetData();
  }, [internalGetData]);

  const result = React.useMemo(
    () => ({
      data,
      loading,
      initialized,
      error,
      run: internalGetData,
    }),
    [data, loading, initialized, error, internalGetData]
  );

  return result;
}
