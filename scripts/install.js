#!/usr/bin/env node

import { copyFile, mkdir, readdir, readFile, writeFile, cp } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const HOME = homedir();
const INNER_OS_HOME = join(HOME, ".inner-os");
const VALID_FREQUENCIES = new Set(["low", "normal", "high"]);

const PLATFORMS = {
  cursor: {
    name: "Cursor",
    hooksConfig: join(HOME, ".cursor", "hooks.json"),
    hooksDir: join(HOME, ".cursor"),
  },
  codex: {
    name: "Codex CLI",
    hooksConfig: join(HOME, ".codex", "hooks.json"),
    hooksDir: join(HOME, ".codex"),
    agentsMd: join(HOME, ".codex", "AGENTS.md"),
  },
  opencode: {
    name: "OpenCode CLI",
    pluginsDir: join(HOME, ".config", "opencode", "plugins"),
    instructionsDir: join(HOME, ".config", "opencode"),
  },
  hermes: {
    name: "Hermes Agent",
    skillDir: join(HOME, ".hermes", "skills", "personality", "inner-os"),
    pluginDir: join(HOME, ".hermes", "plugins", "inner-os"),
  },
  openclaw: {
    name: "OpenClaw",
    skillDir: join(HOME, ".openclaw", "skills", "inner-os"),
    extensionsDir: join(HOME, ".openclaw", "extensions", "ai-inner-os"),
  },
};

// ── Helpers ──────────────────────────────────────────────

async function copyDir(src, dest) {
  await cp(src, dest, { recursive: true, force: true });
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

function withFrequencyOverride(content, frequency) {
  if (frequency === "normal") return content;

  return `${content.trimEnd()}

## 当前安装频率覆盖

Inner OS 当前安装频率为 \`${frequency}\`。请按该频率执行：${
    frequency === "high"
      ? "阶段推进、工具结果、失败重试或发现问题时，优先输出一条简短 `▎InnerOS：` 独白。"
      : "只在关键判断、失败恢复、重要结论前输出。"
  }
`;
}

async function copySharedCore(frequency) {
  console.log("\n📦 Copying shared core to ~/.inner-os/ ...");
  await ensureDir(INNER_OS_HOME);

  // hooks/lib/
  await copyDir(join(REPO_ROOT, "hooks", "lib"), join(INNER_OS_HOME, "hooks", "lib"));

  // protocol/
  await ensureDir(join(INNER_OS_HOME, "protocol"));
  await copyFile(join(REPO_ROOT, "protocol", "SKILL.md"), join(INNER_OS_HOME, "protocol", "SKILL.md"));

  // personas/ (all presets + custom dir)
  await copyDir(join(REPO_ROOT, "personas"), join(INNER_OS_HOME, "personas"));

  // skills/ (optional, explicitly invoked capabilities)
  await copyDir(join(REPO_ROOT, "skills"), join(INNER_OS_HOME, "skills"));

  // state/ (create empty)
  await ensureDir(join(INNER_OS_HOME, "state"));

  // config
  await writeFile(
    join(INNER_OS_HOME, "config.json"),
    JSON.stringify({ frequency }, null, 2) + "\n",
    "utf8",
  );

  // scripts/
  await ensureDir(join(INNER_OS_HOME, "scripts"));
  await copyFile(join(REPO_ROOT, "scripts", "switch-persona.js"), join(INNER_OS_HOME, "scripts", "switch-persona.js"));

  console.log("  ✓ hooks/lib/, protocol/, personas/, skills/, scripts/");
  console.log(`  ✓ frequency → ${frequency}`);
}

// ── Helpers: merge hooks.json ────────────────────────────

const INNER_OS_CMD_TAG = ".inner-os";

/**
 * Merge Inner OS hooks into an existing Cursor hooks.json.
 * Preserves user-defined hooks for other events and within same events.
 */
async function mergeCursorHooksJson(target, newHooks) {
  let existing = { version: 1, hooks: {} };
  try {
    existing = JSON.parse(await readFile(target, "utf8"));
    if (!existing.hooks) existing.hooks = {};
  } catch {
    // file doesn't exist or invalid JSON
  }

  for (const [event, hooks] of Object.entries(newHooks)) {
    if (!existing.hooks[event]) {
      existing.hooks[event] = [];
    }
    // Remove old Inner OS hooks (identified by command path containing .inner-os)
    existing.hooks[event] = existing.hooks[event].filter(
      (h) => !h.command || !h.command.includes(INNER_OS_CMD_TAG),
    );
    // Append our hooks
    existing.hooks[event].push(...hooks);
  }

  await writeFile(target, JSON.stringify(existing, null, 2) + "\n", "utf8");
}

/**
 * Merge Inner OS hooks into an existing Codex hooks.json.
 * Codex uses nested matcher groups: { hooks: { EventName: [{ matcher, hooks: [...] }] } }
 */
async function mergeCodexHooksJson(target, newHooks) {
  let existing = { hooks: {} };
  try {
    existing = JSON.parse(await readFile(target, "utf8"));
    if (!existing.hooks) existing.hooks = {};
  } catch {
    // file doesn't exist or invalid JSON
  }

  for (const [event, groups] of Object.entries(newHooks)) {
    if (!existing.hooks[event]) {
      existing.hooks[event] = [];
    }
    // Remove old Inner OS hook groups
    existing.hooks[event] = existing.hooks[event].filter(
      (g) => !g.hooks?.some((h) => h.command?.includes(INNER_OS_CMD_TAG)),
    );
    // Append our groups
    existing.hooks[event].push(...groups);
  }

  await writeFile(target, JSON.stringify(existing, null, 2) + "\n", "utf8");
}

// ── Helpers: marker-based file append ───────────────────

const INNER_OS_START = "<!-- INNER_OS_START -->";
const INNER_OS_END = "<!-- INNER_OS_END -->";

/**
 * Append or replace Inner OS content in a shared file (e.g. AGENTS.md).
 * Uses marker comments to identify the Inner OS block.
 */
async function markerAppend(target, content) {
  let existing = "";
  try {
    existing = await readFile(target, "utf8");
  } catch {
    // file doesn't exist yet
  }

  const block = `${INNER_OS_START}\n${content}\n${INNER_OS_END}`;

  const startIdx = existing.indexOf(INNER_OS_START);
  const endIdx = existing.indexOf(INNER_OS_END);

  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    // Replace existing block
    const before = existing.slice(0, startIdx);
    const after = existing.slice(endIdx + INNER_OS_END.length);
    await writeFile(target, before + block + after, "utf8");
  } else if (existing.trim()) {
    // Append to existing file
    await writeFile(target, existing.trimEnd() + "\n\n" + block + "\n", "utf8");
  } else {
    // New file
    await writeFile(target, block + "\n", "utf8");
  }
}

// ── Cursor ───────────────────────────────────────────────

async function installCursor() {
  console.log("\n🖱  Installing for Cursor ...");

  // Copy cursor hooks to ~/.inner-os/cursor/hooks/
  await copyDir(join(REPO_ROOT, "cursor", "hooks"), join(INNER_OS_HOME, "cursor", "hooks"));

  // Inner OS hooks with absolute paths
  const innerOsHooks = {
    sessionStart: [
      {
        command: `node ${join(INNER_OS_HOME, "cursor", "hooks", "session-start.js")}`,
        type: "command",
        timeout: 5,
      },
    ],
    postToolUse: [
      {
        command: `node ${join(INNER_OS_HOME, "cursor", "hooks", "post-tool-use.js")}`,
        type: "command",
        timeout: 5,
      },
    ],
    stop: [
      {
        command: `node ${join(INNER_OS_HOME, "cursor", "hooks", "stop.js")}`,
        type: "command",
        timeout: 5,
      },
    ],
  };

  // Copy .mdc rule file as fallback
  await ensureDir(join(INNER_OS_HOME, "cursor", "rules"));
  await copyFile(
    join(REPO_ROOT, "cursor", "rules", "inner-os-protocol.mdc"),
    join(INNER_OS_HOME, "cursor", "rules", "inner-os-protocol.mdc"),
  );

  await ensureDir(PLATFORMS.cursor.hooksDir);
  // Merge into existing hooks.json instead of overwriting
  await mergeCursorHooksJson(PLATFORMS.cursor.hooksConfig, innerOsHooks);

  console.log(`  ✓ hooks.json → ${PLATFORMS.cursor.hooksConfig}（已合并，保留用户已有 hooks）`);
  console.log(`  ✓ hook scripts → ${join(INNER_OS_HOME, "cursor", "hooks")}/`);
  console.log("  ℹ  Also copy .mdc rule to project: cp ~/.inner-os/cursor/rules/inner-os-protocol.mdc .cursor/rules/");
}

// ── Codex ────────────────────────────────────────────────

async function installCodex() {
  console.log("\n📟 Installing for Codex CLI ...");

  // Copy codex hooks to ~/.inner-os/codex/hooks/
  await copyDir(join(REPO_ROOT, "codex", "hooks"), join(INNER_OS_HOME, "codex", "hooks"));

  // Inner OS hooks with absolute paths
  const innerOsHooks = {
    SessionStart: [
      {
        matcher: "startup|resume",
        hooks: [
          {
            type: "command",
            command: `node ${join(INNER_OS_HOME, "codex", "hooks", "session-start.js")}`,
            statusMessage: "Loading Inner OS protocol",
          },
        ],
      },
    ],
    PostToolUse: [
      {
        matcher: "Bash",
        hooks: [
          {
            type: "command",
            command: `node ${join(INNER_OS_HOME, "codex", "hooks", "post-tool-use.js")}`,
            statusMessage: "Tracking Inner OS events",
          },
        ],
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command",
            command: `node ${join(INNER_OS_HOME, "codex", "hooks", "session-stop.js")}`,
          },
        ],
      },
    ],
  };

  await ensureDir(PLATFORMS.codex.hooksDir);
  // Merge into existing hooks.json instead of overwriting
  await mergeCodexHooksJson(PLATFORMS.codex.hooksConfig, innerOsHooks);

  // Marker-based append for AGENTS.md — preserves user's existing content
  const agentsContent = await readFile(join(REPO_ROOT, "codex", "AGENTS.md"), "utf8");
  await markerAppend(PLATFORMS.codex.agentsMd, agentsContent);

  console.log(`  ✓ hooks.json → ${PLATFORMS.codex.hooksConfig}（已合并，保留用户已有 hooks）`);
  console.log(`  ✓ AGENTS.md → ${PLATFORMS.codex.agentsMd}（标记追加，保留用户已有内容）`);
  console.log(`  ✓ hook scripts → ${join(INNER_OS_HOME, "codex", "hooks")}/`);
  console.log("  ℹ  Enable hooks in ~/.codex/config.toml: [features] codex_hooks = true");
}

// ── OpenCode ─────────────────────────────────────────────

async function installOpenCode(frequency = "normal") {
  console.log("\n📝 Installing for OpenCode CLI ...");

  // Copy plugin file
  await ensureDir(PLATFORMS.opencode.pluginsDir);
  await copyFile(
    join(REPO_ROOT, "opencode", "plugins", "inner-os.js"),
    join(PLATFORMS.opencode.pluginsDir, "inner-os.js"),
  );

  // Copy instructions file
  await ensureDir(PLATFORMS.opencode.instructionsDir);
  const instructions = await readFile(
    join(REPO_ROOT, "opencode", "inner-os-rules.md"),
    "utf8",
  );
  await writeFile(
    join(PLATFORMS.opencode.instructionsDir, "inner-os-rules.md"),
    withFrequencyOverride(instructions, frequency),
    "utf8",
  );

  console.log(`  ✓ plugin → ${join(PLATFORMS.opencode.pluginsDir, "inner-os.js")}`);
  console.log(`  ✓ instructions → ${join(PLATFORMS.opencode.instructionsDir, "inner-os-rules.md")}`);
  console.log("  ℹ  Add to opencode.json if needed: { \"instructions\": [\"~/.config/opencode/inner-os-rules.md\"] }");
}

// ── Hermes ───────────────────────────────────────────────

async function installHermes() {
  console.log("\n🔮 Installing for Hermes Agent ...");

  await copyDir(join(REPO_ROOT, "hermes", "plugins", "inner-os"), PLATFORMS.hermes.pluginDir);

  await ensureDir(PLATFORMS.hermes.skillDir);
  await copyFile(
    join(REPO_ROOT, "hermes", "skills", "inner-os", "SKILL.md"),
    join(PLATFORMS.hermes.skillDir, "SKILL.md"),
  );

  console.log(`  ✓ plugin → ${PLATFORMS.hermes.pluginDir}/`);
  console.log(`  ✓ SKILL.md → ${PLATFORMS.hermes.skillDir}/`);
  console.log("  ℹ  Enable plugin with: hermes plugins enable inner-os");
}

// ── OpenClaw ─────────────────────────────────────────────

async function installOpenClaw() {
  console.log("\n🐾 Installing for OpenClaw ...");

  // Install skill
  await ensureDir(PLATFORMS.openclaw.skillDir);
  await copyFile(
    join(REPO_ROOT, "openclaw", "skills", "inner-os", "SKILL.md"),
    join(PLATFORMS.openclaw.skillDir, "SKILL.md"),
  );

  // Install plugin (extension)
  await ensureDir(join(PLATFORMS.openclaw.extensionsDir, "openclaw"));
  await copyFile(
    join(REPO_ROOT, "openclaw.plugin.json"),
    join(PLATFORMS.openclaw.extensionsDir, "openclaw.plugin.json"),
  );
  await copyFile(
    join(REPO_ROOT, "package.json"),
    join(PLATFORMS.openclaw.extensionsDir, "package.json"),
  );
  await copyFile(
    join(REPO_ROOT, "openclaw", "index.js"),
    join(PLATFORMS.openclaw.extensionsDir, "openclaw", "index.js"),
  );
  await copyDir(
    join(REPO_ROOT, "openclaw", "skills"),
    join(PLATFORMS.openclaw.extensionsDir, "openclaw", "skills"),
  );

  console.log(`  ✓ SKILL.md → ${PLATFORMS.openclaw.skillDir}/`);
  console.log(`  ✓ plugin → ${PLATFORMS.openclaw.extensionsDir}/`);
}

// ── Main ─────────────────────────────────────────────────

const INSTALLERS = {
  cursor: installCursor,
  codex: installCodex,
  opencode: installOpenCode,
  hermes: installHermes,
  openclaw: installOpenClaw,
};

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    console.log("AI Inner OS — 全局安装脚本");
    console.log("");
    console.log("用法：node scripts/install.js [options]");
    console.log("");
    console.log("  --all                 安装到所有平台");
    console.log("  --platform <name>     安装到指定平台");
    console.log("                        可选：cursor, codex, opencode, hermes, openclaw");
    console.log("  --frequency <level>   设置 Inner OS 触发频率：low, normal, high（默认 normal）");
    console.log("  --list                列出可安装的平台");
    console.log("  --help                显示帮助");
    console.log("");
    console.log("示例：");
    console.log("  node scripts/install.js --all");
    console.log("  node scripts/install.js --platform cursor");
    console.log("  node scripts/install.js --platform codex --platform opencode");
    console.log("  node scripts/install.js --all --frequency high");
    process.exit(0);
  }

  if (args[0] === "--list") {
    console.log("可安装的平台：");
    for (const [key, info] of Object.entries(PLATFORMS)) {
      console.log(`  ${key.padEnd(12)} ${info.name}`);
    }
    process.exit(0);
  }

  // Parse platforms to install
  const targets = new Set();
  let frequency = "normal";

  if (args.includes("--all")) {
    for (const key of Object.keys(PLATFORMS)) {
      targets.add(key);
    }
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--platform" && args[i + 1]) {
      const name = args[i + 1].toLowerCase();
      if (!PLATFORMS[name]) {
        console.error(`错误：未知平台 "${name}"。运行 --list 查看可用平台。`);
        process.exit(1);
      }
      targets.add(name);
      i++;
    }

    if (args[i] === "--frequency" && args[i + 1]) {
      const value = args[i + 1].toLowerCase();
      if (!VALID_FREQUENCIES.has(value)) {
        console.error(`错误：未知频率 "${value}"。可选：low, normal, high。`);
        process.exit(1);
      }
      frequency = value;
      i++;
    }
  }

  if (targets.size === 0) {
    console.error("错误：请指定 --all 或 --platform <name>。运行 --help 查看用法。");
    process.exit(1);
  }

  console.log("AI Inner OS 全局安装");
  console.log(`目标平台：${[...targets].map((t) => PLATFORMS[t].name).join(", ")}`);
  console.log(`触发频率：${frequency}`);

  // Step 1: Copy shared core
  await copySharedCore(frequency);

  // Step 2: Install for each platform
  for (const target of targets) {
    await INSTALLERS[target](frequency);
  }

  // Summary
  console.log("\n✅ 安装完成！");
  console.log("");
  console.log("人设切换（全局）：");
  console.log(`  node ${join(INNER_OS_HOME, "scripts", "switch-persona.js")} --list`);
  console.log(`  node ${join(INNER_OS_HOME, "scripts", "switch-persona.js")} sarcastic`);
  console.log(`  node ${join(INNER_OS_HOME, "scripts", "switch-persona.js")} default`);
  console.log("");
  console.log("GitHub: https://github.com/SummerSec/AI-Inner-Os");
  console.log("如果觉得好用，请给个 ⭐ Star 支持！");
}

main().catch((err) => {
  console.error("安装失败：", err.message);
  process.exit(1);
});
