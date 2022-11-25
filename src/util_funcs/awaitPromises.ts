/**
 * waits for promises like Promise.all, but returns individual results
 * inputPromises is an array of objects with these fields:
 *    id: string - required, unique
 *    promise: Promise - required
 */
export function awaitPromises(inputPromises) {
  const promises = inputPromises.map(({ promise, ...rest }) => {
    return new Promise(async (resolve) => {
      try {
        const result = await promise;
        resolve({ ...rest, result, success: true });
      } catch (error) {
        resolve({ ...rest, error, failed: true });
      }
    });
  });

  return Promise.all(promises);
}

export const FULFILLED = "fulfilled";
export const REJECTED = "rejected";

export interface IWrappedAsyncFnResult<T = any, E = any> {
  value?: T;
  extra?: E;
  reason?: any;
  status: typeof FULFILLED | typeof REJECTED;
}

export function wrapPromise<T, E = any>(
  promise: Promise<T>,
  extra?: E
): Promise<IWrappedAsyncFnResult<T, E>> {
  return new Promise((resolve) => {
    promise
      .then((value) => {
        resolve({ value, extra, status: FULFILLED });
      })
      .catch((reason) => {
        resolve({ reason, extra, status: REJECTED });
      });
  });
}

export function wrapFnAsync<T, E = any>(
  fn: () => Promise<T>,
  extra?: E
): Promise<IWrappedAsyncFnResult<T, E>> {
  return new Promise(async (resolve) => {
    try {
      const value = await fn();
      resolve({ value, extra, status: FULFILLED });
    } catch (reason) {
      console.error(reason);
      resolve({ reason, extra, status: REJECTED });
    }
  });
}
