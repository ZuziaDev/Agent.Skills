#!/usr/bin/env sh
set -eu

SOURCE_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
DESTINATION="${HOME}/.agents/skills/zuzia-discord-architect"

mkdir -p "$(dirname "$DESTINATION")"
rm -rf "$DESTINATION"
cp -R "$SOURCE_DIR" "$DESTINATION"

printf 'Installed Zuzia Discord Architect to %s\n' "$DESTINATION"
printf 'Restart Codex if the skill does not appear automatically.\n'
