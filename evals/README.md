# Evals

A minimal regression net for LLM behaviour. Each case in `cases/*.json` is a prompt plus a
substring the model's answer must contain:

```json
{
  "name": "capital-of-france",
  "prompt": "What is the capital of France? Answer with one word.",
  "expectContains": "Paris"
}
```

Run them with:

```bash
pnpm eval
```

The runner (`scripts/run-evals.mjs`) calls the Anthropic Messages API for each case and reports
pass/fail. If `ANTHROPIC_API_KEY` is unset it prints a skip line and exits 0, so it is safe in CI
without a key. Add a case whenever you change a prompt and want to lock in the behaviour you expect.

This is deliberately simple (substring match). Grow it toward richer scoring — an LLM judge,
structured-output validation with Zod, or latency/token budgets — as real prompts land.
