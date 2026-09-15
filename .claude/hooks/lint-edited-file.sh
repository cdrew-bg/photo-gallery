#!/bin/bash
set -u

INPUT=$(cat)
FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // ""')

case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac
case "$FILE_PATH" in
  */dist/*|*/node_modules/*|*/.next/*|*/coverage/*|*/tooling/eslint-rules/*) exit 0 ;;
esac
[ -f "$FILE_PATH" ] || exit 0

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
[ -f "$ROOT/.claude/guardrails-unlock" ] && exit 0
cd "$ROOT" || exit 0

OUT=""
run_config() {
  local label="$1"; shift
  local result
  if ! result=$("$@" "$FILE_PATH" 2>&1); then
    OUT="${OUT}
[${label}]
${result}"
  fi
}

run_config "base" pnpm exec eslint --max-warnings 0
run_config "guardrails" pnpm exec eslint --no-inline-config --config eslint.guardrails.config.mjs
run_config "quality" pnpm exec eslint --no-inline-config --config eslint.quality.config.mjs

STATE_DIR="${TMPDIR:-/tmp}/claude-guardrails"
mkdir -p "$STATE_DIR"
KEY=$(printf '%s' "$FILE_PATH" | shasum | cut -d' ' -f1)
STATE_FILE="$STATE_DIR/$KEY"

if [ -z "$OUT" ]; then
  rm -f "$STATE_FILE"
  exit 0
fi

ATTEMPT=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
ATTEMPT=$((ATTEMPT + 1))
printf '%s' "$ATTEMPT" > "$STATE_FILE"

if [ "$ATTEMPT" -ge 3 ]; then
  printf 'CRITICAL: %s has failed guardrails linting %s times. STOP editing this file. Report the remaining violations to the user and ask how to proceed.\n%s\n' "$FILE_PATH" "$ATTEMPT" "$OUT" >&2
else
  printf 'Guardrails lint failed for %s (attempt %s/3). Fix these errors:\n%s\n' "$FILE_PATH" "$ATTEMPT" "$OUT" >&2
fi
exit 2
