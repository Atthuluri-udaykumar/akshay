// One time initialization
const devMode =
  window.location.search.includes("dev") ||
  process.env?.NODE_ENV === "development";

function logStack(excludeFnsFrom) {
  if (Error.captureStackTrace) {
    const trace = {};
    Error.captureStackTrace(trace, excludeFnsFrom);
  }
}

export function appConsoleLog(...args) {
  if (devMode) {
    logStack(appConsoleLog);
  }
}

export function appConsoleError(...args) {
  if (devMode) {
    logStack(appConsoleError);
  }
}
