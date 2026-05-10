import { resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

export const PLUGIN_ID = "ai-inner-os";
export const DEFAULT_PREFIX = "▎InnerOS：";

function dataDirFromEnv() {
  const dataDir = process.env.CLAUDE_PLUGIN_DATA;
  if (!dataDir) {
    return new URL("../../", import.meta.url);
  }

  return pathToFileURL(resolve(dataDir) + sep);
}

export const PLUGIN_DATA_DIR = dataDirFromEnv();
export const CONFIG_PATH = new URL("config.json", PLUGIN_DATA_DIR);
export const STATE_DIR = new URL("state/", PLUGIN_DATA_DIR);
export const SKILL_PATH = new URL("../../protocol/SKILL.md", import.meta.url);
export const MAX_RECENT_EVENTS = 10;
export const DEFAULT_FREQUENCY = "normal";
export const FREQUENCY_THRESHOLDS = {
  low: 6,
  normal: 3,
  high: 1,
};

export const EVENT_TYPES = {
  READ: "read",
  SEARCH: "search",
  EXECUTE: "execute",
  EDIT: "edit",
  VERIFY: "verify",
  OTHER: "other",
};

export const EVENT_RESULTS = {
  SUCCESS: "success",
  FAILURE: "failure",
  UNKNOWN: "unknown",
};

export const PERSONAS_DIR = new URL("../../personas/", import.meta.url);
export const CUSTOM_PERSONAS_DIR = new URL("personas/custom/", PLUGIN_DATA_DIR);
export const ACTIVE_PERSONA_FILE = new URL("personas/_active.json", PLUGIN_DATA_DIR);
export const DEFAULT_PERSONA = "default";
