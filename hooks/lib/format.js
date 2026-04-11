import { DEFAULT_PREFIX } from "./constants.js";

export function getInnerOsPrefix() {
  return DEFAULT_PREFIX;
}

export function formatInnerOsLine(text) {
  return `${getInnerOsPrefix()}${text}`.trim();
}
