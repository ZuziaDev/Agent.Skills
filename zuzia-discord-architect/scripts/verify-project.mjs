#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const target = path.resolve(process.argv[2] ?? process.cwd());
const packagePath = path.join(target, "package.json");

if (!fs.existsSync(packagePath)) {
  console.error(`No package.json found in ${target}`);
  process.exit(2);
}

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
} catch (error) {
  console.error(`Invalid package.json: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(2);
}

function exists(name) {
  return fs.existsSync(path.join(target, name));
}

function detectPackageManager() {
  if (exists("pnpm-lock.yaml")) return "pnpm";
  if (exists("bun.lock") || exists("bun.lockb")) return "bun";
  if (exists("yarn.lock")) return "yarn";
  return "npm";
}

function executable(manager) {
  if (process.platform !== "win32") return manager;
  return manager === "npm" || manager === "pnpm" || manager === "yarn" ? `${manager}.cmd` : manager;
}

function runScript(manager, script, timeoutMs = 180000) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(executable(manager), ["run", script], {
      cwd: target,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, CI: process.env.CI ?? "1", NO_COLOR: process.env.NO_COLOR ?? "1" },
      shell: false,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 3000).unref();
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 120000) stdout = stdout.slice(-120000);
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 120000) stderr = stderr.slice(-120000);
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        script,
        ok: false,
        code: null,
        timedOut,
        durationMs: Date.now() - started,
        stdout,
        stderr: `${stderr}\n${error.message}`.trim(),
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        script,
        ok: code === 0 && !timedOut,
        code,
        timedOut,
        durationMs: Date.now() - started,
        stdout,
        stderr,
      });
    });
  });
}

const manager = detectPackageManager();
const scripts = pkg.scripts ?? {};
const preferred = [
  "format:check",
  "lint",
  "typecheck",
  "check",
  "test:unit",
  "test",
  "test:integration",
  "build",
  "smoke",
];

const selected = [];
for (const name of preferred) {
  if (scripts[name] && !selected.includes(name)) selected.push(name);
}

if (selected.includes("check")) {
  const redundant = new Set(["lint", "typecheck"]);
  for (let i = selected.length - 1; i >= 0; i -= 1) {
    if (redundant.has(selected[i])) selected.splice(i, 1);
  }
}

if (selected.length === 0) {
  console.error("No recognized verification scripts found.");
  process.exit(3);
}

const results = [];
for (const script of selected) {
  const result = await runScript(manager, script);
  results.push(result);
  const marker = result.ok ? "PASS" : "FAIL";
  console.error(`[${marker}] ${script} (${result.durationMs}ms)`);
  if (!result.ok) break;
}

const summary = {
  target,
  packageManager: manager,
  selected,
  passed: results.filter((item) => item.ok).map((item) => item.script),
  failed: results.filter((item) => !item.ok).map((item) => item.script),
  results,
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
process.exit(summary.failed.length === 0 ? 0 : 1);
