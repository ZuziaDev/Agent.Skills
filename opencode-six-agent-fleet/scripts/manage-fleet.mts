import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const coreAgents = [
  "architecture-reviewer",
  "bug-investigator",
  "implementer",
  "log-analyst",
  "security-auditor",
  "test-engineer",
] as const;

const claudeAgents = [
  "claude-api-contract-guardian",
  "claude-code-reviewer",
  "claude-dependency-auditor",
  "claude-docs-reviewer",
  "claude-performance-profiler",
  "claude-release-gatekeeper",
] as const;

const expectedAgents = [...coreAgents, ...claudeAgents] as const;

const command = process.argv[2] ?? "validate";
const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const openCodeRoot = join(homedir(), ".config", "opencode");
const sourceAgents = join(skillRoot, "assets", "agents");
const targetAgents = join(openCodeRoot, "agents");
const targetSkill = join(openCodeRoot, "skills", "opencode-six-agent-fleet");
const globalRules = join(openCodeRoot, "AGENTS.md");

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function install(): Promise<void> {
  await mkdir(targetAgents, { recursive: true });
  for (const name of expectedAgents) {
    await cp(join(sourceAgents, `${name}.md`), join(targetAgents, `${name}.md`), { force: true });
  }
  await mkdir(targetSkill, { recursive: true });
  for (const entry of ["SKILL.md", "references", "scripts", "assets", "agents"]) {
    await cp(join(skillRoot, entry), join(targetSkill, entry), { recursive: true, force: true });
  }
  if (!(await exists(globalRules))) {
    await writeFile(globalRules, await readFile(join(skillRoot, "assets", "global-AGENTS.md"), "utf8"), "utf8");
  }
  await validate();
}

async function validateAgent(path: string, name: string): Promise<void> {
  const content = await readFile(path, "utf8");
  const required = ["description:", "mode: subagent", "permission:", "task: deny", "external_directory: deny"];
  for (const marker of required) {
    if (!content.includes(marker)) {
      throw new Error(`${name} is missing ${marker}`);
    }
  }
  if (name !== "implementer" && !content.includes("edit: deny")) {
    throw new Error(`${name} must be read-only`);
  }
  if (name === "implementer" && !content.includes("edit: allow")) {
    throw new Error("implementer must be the write owner");
  }
  if (name.startsWith("claude-") && !content.includes("model: antigravity-manager/claude-")) {
    throw new Error(`${name} must use a Claude model`);
  }
}

async function validate(): Promise<void> {
  const installed = (await readdir(targetAgents))
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.slice(0, -3));
  for (const name of expectedAgents) {
    if (!installed.includes(name)) {
      throw new Error(`Missing OpenCode agent: ${name}`);
    }
    await validateAgent(join(targetAgents, `${name}.md`), name);
  }
  const installedSkill = await readFile(join(targetSkill, "SKILL.md"), "utf8");
  if (!installedSkill.includes("name: opencode-six-agent-fleet")) {
    throw new Error("OpenCode skill is not installed correctly");
  }
  process.stdout.write(`Validated ${expectedAgents.length} OpenCode agents and the shared skill.\n`);
}

if (command === "install") {
  await install();
} else if (command === "validate") {
  await validate();
} else {
  throw new Error(`Unknown command: ${command}`);
}
