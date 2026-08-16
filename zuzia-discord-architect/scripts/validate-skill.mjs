#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? process.cwd());
const required = [
  "SKILL.md",
  "agents/openai.yaml",
  "references/architecture.md",
  "references/security.md",
  "references/feature-catalog.md",
  "references/ai-systems.md",
  "references/migration.md",
  "references/verification.md",
  "references/operations.md",
  "references/compatibility.md",
  "scripts/inspect-project.mjs",
  "scripts/verify-project.mjs",
];

const errors = [];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing ${file}`);
}

const skillPath = path.join(root, "SKILL.md");
if (fs.existsSync(skillPath)) {
  const skill = fs.readFileSync(skillPath, "utf8");
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatter) {
    errors.push("SKILL.md has no YAML frontmatter");
  } else {
    if (!/^name:\s*\S+/m.test(frontmatter[1])) errors.push("Frontmatter has no name");
    if (!/^description:\s*.+/m.test(frontmatter[1])) errors.push("Frontmatter has no description");
  }

  const references = [...skill.matchAll(/`((?:references|assets|scripts)\/[^`]+)`/g)].map((match) => match[1]);
  for (const reference of references) {
    if (!fs.existsSync(path.join(root, reference))) {
      errors.push(`Broken referenced path: ${reference}`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log("Skill package validation passed.");
