export const PLUGIN_ID = "ai-inner-os";
export const DEFAULT_PREFIX = "▎InnerOS：";
export const STATE_DIR = new URL("../../state/", import.meta.url);
export const SKILL_PATH = new URL("../../protocol/SKILL.md", import.meta.url);
export const MAX_RECENT_EVENTS = 10;

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
export const ACTIVE_PERSONA_FILE = new URL("../../personas/_active.json", import.meta.url);
export const DEFAULT_PERSONA = "default";
