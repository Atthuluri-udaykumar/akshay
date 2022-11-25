import { compact, trim, mergeWith } from "lodash";
import { format } from "date-fns";

export function checkParamExists(param, paramName) {
  if (!param && !paramName) {
    console.trace();
    throw new Error(`parameter 'param' not provided`);
  }

  if (!param) {
    console.trace();
    throw new Error(`parameter ${paramName} not provided`);
  }
}

export function checkFieldExists(data, fieldName, allowNull) {
  if (!data) {
    console.trace();
    throw new Error(`data is undefined or null`);
  }

  if (data && fieldName && !data[fieldName]) {
    const typeofValue = typeof data[fieldName];

    if (
      typeofValue === "undefined" ||
      (data[fieldName] === null && !allowNull)
    ) {
      console.trace();
      throw new Error(`data[${fieldName}] is undefined or null`);
    }
  }
}

export function capitalizeFirstLetter(str = "") {
  if (str.length > 0) {
    return `${str[0].toUpperCase()}${str.slice(1)}`;
  }

  return str;
}

export function devLogError(...error) {
  if (process.env.NODE_ENV === "development") {
    console.error(...error);
  }
}

export function removeDuplicateWhitespace(str, leaveEndingWhitespace = false) {
  str = trim(str);
  const splitStr = str.split(" ");
  const isLastCharWhiteSpace = splitStr[splitStr.length - 1] === "";
  let compactSplitStr = compact(splitStr);

  if (isLastCharWhiteSpace && leaveEndingWhitespace) {
    compactSplitStr.push("");
  }

  return compactSplitStr.join(" ");
}

export function isEmptyString(str) {
  return trim(str).length === 0;
}

export function promisifiedWait(ms = 1000) {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function sortItemsById(list, idField = "optionId") {
  return list.sort((item1, item2) => {
    return item1[idField] - item2[idField];
  });
}

export function sortItemsByName(list, nameField = "optionText") {
  return list.sort((item1, item2) => {
    const item1Name = item1[nameField].toUpperCase();
    const item2Name = item2[nameField].toUpperCase();

    if (item1Name > item2Name) {
      return 1;
    }

    if (item1Name < item2Name) {
      return -1;
    }

    return 0;
  });
}

// arrayUpdateStrategy - how to merge data:
// merge - using deep merge
// concat - concats the array
// replace - replace the array with the new one
export function mergeData(
  resource,
  data,
  meta = { arrayUpdateStrategy: "concat" }
) {
  return mergeWith(resource, data, (value1, value2) => {
    if (Array.isArray(value1) && value2) {
      if (meta.arrayUpdateStrategy === "concat") {
        return value1.concat(value2);
      } else if (meta.arrayUpdateStrategy === "replace") {
        return value1;
      }

      // no need to handle the merge option
    }
  });
}
export function formatDate(time) {
  const dateFormat = "EEE, MMM d, yyyy";
  const date = new Date(time);
  return format(date, dateFormat);
}

export function indexItemsById(list, idField = "optionId") {
  return list.reduce((map, item) => {
    map[item[idField]] = item;
    return map;
  }, {});
}

export function removeNullOptionTexts(list) {
  return list.filter((item) => !!item.optionText);
}

export function getPlural(text, count) {
  return count === 1 ? text : `${text}s`;
}

export function decodeText(text) {
  try {
    return decodeURIComponent(text);
  } catch (error) {
    console.log(text);
    console.error(error);
    return text;
  }
}

export function tryParseJSON(data, defaultValue) {
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error(error);
    }
  }

  return defaultValue || data;
}
