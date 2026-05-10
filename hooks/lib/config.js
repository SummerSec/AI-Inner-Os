import { readFile } from "node:fs/promises";

import { CONFIG_PATH, DEFAULT_FREQUENCY, FREQUENCY_THRESHOLDS } from "./constants.js";

export function normalizeFrequency(value) {
  const frequency = String(value || "").toLowerCase();
  return Object.hasOwn(FREQUENCY_THRESHOLDS, frequency)
    ? frequency
    : DEFAULT_FREQUENCY;
}

export async function readInnerOsConfig() {
  const envFrequency = process.env.INNER_OS_FREQUENCY;
  if (envFrequency) {
    return { frequency: normalizeFrequency(envFrequency) };
  }

  try {
    const raw = await readFile(CONFIG_PATH, "utf8");
    const config = JSON.parse(raw);
    return {
      ...config,
      frequency: normalizeFrequency(config.frequency),
    };
  } catch {
    return { frequency: DEFAULT_FREQUENCY };
  }
}

export function getReminderThreshold(frequency = DEFAULT_FREQUENCY) {
  return FREQUENCY_THRESHOLDS[normalizeFrequency(frequency)];
}
