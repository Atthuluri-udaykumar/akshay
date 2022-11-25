import { isNumber } from "lodash";

export function tryStringifyObject(
  data: any,
  defaultValue: any,
  stringifier: "String" | "JSON.stringify" = "String"
) {
  if (data || isNumber(data)) {
    return stringifier === "String" ? String(data) : JSON.stringify(data);
  }

  return defaultValue || data;
}

export function assertItem(item?: any, message?: string): asserts item {
  if (!item) {
    throw new Error(message || "item is null or undefined");
  }
}
