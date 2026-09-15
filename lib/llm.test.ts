import { expect, it } from 'vitest';
import { LlmError } from './classes/llm-error.class';
import { complete } from './llm.service';
import type { FetchLike } from './types/fetch-like.type';

const OK_STATUS = 200;
const ERROR_STATUS = 500;

const failFetch: FetchLike = () =>
  Promise.resolve({ ok: false, status: ERROR_STATUS, json: () => Promise.resolve({}) });

const okFetch: FetchLike = () =>
  Promise.resolve({
    ok: true,
    status: OK_STATUS,
    json: () =>
      Promise.resolve({
        content: [{ type: 'text', text: 'hello' }],
        usage: { input_tokens: 5, output_tokens: 7 },
      }),
  });

it('returns completion text and token usage', async () => {
  const result = await complete({ prompt: 'hi', apiKey: 'test', fetchImpl: okFetch });
  expect(result.text).toBe('hello');
  expect(result.inputTokens).toBe(5);
  expect(result.outputTokens).toBe(7);
});

it('throws LlmError when the api key is missing', async () => {
  await expect(complete({ prompt: 'hi', apiKey: '', fetchImpl: okFetch })).rejects.toBeInstanceOf(
    LlmError,
  );
});

it('throws LlmError on a non-ok response', async () => {
  await expect(
    complete({ prompt: 'hi', apiKey: 'test', fetchImpl: failFetch }),
  ).rejects.toBeInstanceOf(LlmError);
});
