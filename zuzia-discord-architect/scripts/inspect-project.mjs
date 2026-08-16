#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const target = path.resolve(process.argv[2] ?? process.cwd());

function exists(relative) {
  return fs.existsSync(path.join(target, relative));
}

function readJson(relative) {
  const full = path.join(target, relative);
  if (!fs.existsSync(full)) return null;

  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (error) {
    return { __error: error instanceof Error ? error.message : String(error) };
  }
}

function walk(dir, limit = 2500) {
  const result = [];
  const ignored = new Set(["node_modules", ".git", "dist", "build", "coverage", ".next", ".turbo"]);

  function visit(current) {
    if (result.length >= limit) return;

    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (result.length >= limit) break;
      if (ignored.has(entry.name)) continue;

      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else result.push(full);
    }
  }

  visit(dir);
  return result;
}

function relative(file) {
  return path.relative(target, file).replaceAll(path.sep, "/");
}

function detectPackageManager() {
  if (exists("pnpm-lock.yaml")) return "pnpm";
  if (exists("bun.lock") || exists("bun.lockb")) return "bun";
  if (exists("yarn.lock")) return "yarn";
  if (exists("package-lock.json")) return "npm";
  if (exists("package.json")) return "npm";
  return "unknown";
}

const packageJson = readJson("package.json");
const files = walk(target);
const sourceFiles = files.filter((file) => /\.(?:[cm]?[jt]s|tsx)$/.test(file));
const text = sourceFiles
  .slice(0, 700)
  .map((file) => {
    try {
      return fs.readFileSync(file, "utf8");
    } catch {
      return "";
    }
  })
  .join("\n");

const dependencies = {
  ...(packageJson?.dependencies ?? {}),
  ...(packageJson?.devDependencies ?? {}),
};

const riskPatterns = [
  ["dangerous-eval", /\beval\s*\(|new\s+Function\s*\(/],
  ["shell-execution", /child_process|execSync|spawnSync|\bexec\s*\(/],
  ["token-in-source", /(?:DISCORD_?TOKEN|BOT_?TOKEN)\s*[:=]\s*["'`][^"'`$]{20,}/i],
  ["admin-permission", /Administrator|PermissionFlagsBits\.Administrator/],
  ["message-content-intent", /MessageContent/],
  ["presence-intent", /GuildPresences|Presence/],
  ["command-registration-on-ready", /ClientReady[\s\S]{0,2500}(?:applicationCommands|applicationGuildCommands|rest\.put|Routes\.application)/],
  ["unbounded-collector", /createMessageComponentCollector\s*\(\s*\{\s*(?![\s\S]{0,300}(?:time|max|idle))/],
  ["broad-any", /:\s*any\b|as\s+any\b/],
];

const risks = [];
for (const [name, pattern] of riskPatterns) {
  if (pattern.test(text)) risks.push(name);
}

const report = {
  target,
  packageManager: detectPackageManager(),
  package: packageJson
    ? {
        name: packageJson.name ?? null,
        version: packageJson.version ?? null,
        type: packageJson.type ?? "commonjs-default",
        engines: packageJson.engines ?? null,
        scripts: packageJson.scripts ?? {},
      }
    : null,
  language: exists("tsconfig.json") || sourceFiles.some((file) => /\.(?:ts|tsx|mts|cts)$/.test(file))
    ? "typescript"
    : "javascript-or-unknown",
  discord: {
    discordJs: dependencies["discord.js"] ?? null,
    apiTypes: dependencies["discord-api-types"] ?? null,
    voice: dependencies["@discordjs/voice"] ?? null,
  },
  infrastructure: {
    postgres: Boolean(dependencies.pg || dependencies.postgres || dependencies["@prisma/client"]),
    prisma: Boolean(dependencies["@prisma/client"]),
    drizzle: Boolean(dependencies["drizzle-orm"]),
    sqlite: Boolean(dependencies["better-sqlite3"] || dependencies.sqlite3),
    redis: Boolean(dependencies.redis || dependencies.ioredis),
    queue: Boolean(dependencies.bullmq || dependencies.bull),
    validation: dependencies.zod ?? dependencies.joi ?? dependencies.valibot ?? null,
    logger: dependencies.pino ?? dependencies.winston ?? null,
    tests: dependencies.vitest ?? dependencies.jest ?? dependencies.mocha ?? null,
  },
  files: {
    count: files.length,
    sourceCount: sourceFiles.length,
    hasEnvExample: exists(".env.example"),
    hasDockerfile: exists("Dockerfile"),
    hasCompose: exists("compose.yaml") || exists("compose.yml") || exists("docker-compose.yml"),
    hasGitHubActions: exists(".github/workflows"),
    hasAgents: exists("AGENTS.md"),
  },
  signals: {
    slashCommands: /SlashCommandBuilder|isChatInputCommand|applicationCommands/.test(text),
    prefixCommands: /messageCreate|startsWith\s*\([^)]*(?:prefix|["'`][!?.])/.test(text),
    components: /isButton|isStringSelectMenu|customId|custom_id/.test(text),
    modals: /isModalSubmit|ModalBuilder/.test(text),
    sharding: /ShardingManager|shards:\s*["']?auto/.test(text),
    ai: /openai|anthropic|chat\/completions|responses\.create|generateText/i.test(text),
  },
  risks,
  sampledFiles: sourceFiles.slice(0, 60).map(relative),
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
