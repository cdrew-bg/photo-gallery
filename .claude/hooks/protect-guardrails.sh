#!/bin/bash
set -u

INPUT=$(cat)
FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // ""')
[ -z "$FILE_PATH" ] && exit 0

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
REL="${FILE_PATH#"$ROOT"/}"

[ -f "$ROOT/.claude/guardrails-unlock" ] && exit 0

case "$REL" in
  eslint.config.mjs|eslint.*.config.mjs|tooling/eslint-rules/*|.claude/settings.json|.claude/hooks/*|package.json|lefthook.yml|commitlint.config.mjs)
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Guardrail configuration is protected: lint configs, local lint rules, hooks, and root package.json may not be modified by the agent. Do not weaken rules to make errors pass — fix the code instead. If you believe a rule makes the requested task impossible, STOP and report the conflict to the user with the specific rule and why. (Sanctioned rule development: ask the user to create .claude/guardrails-unlock.)"
      }
    }'
    ;;
esac
exit 0
