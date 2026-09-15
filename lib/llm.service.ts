import { z } from 'zod';
import { LlmError } from './classes/llm-error.class';
import { loadEnv } from './env.service';
import type { CompleteOptions } from './interfaces/complete-options.interface';
import type { Completion } from './interfaces/completion.interface';
import { logger } from './logger.service';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-sonnet-5';
const DEFAULT_MAX_TOKENS = 1024;

const responseSchema = z.object({
  content: z.array(z.object({ type: z.string(), text: z.string().optional() })),
  usage: z.object({ input_tokens: z.number(), output_tokens: z.number() }),
});

export async function complete(options: CompleteOptions): Promise<Completion> {
  const {
    prompt,
    model = DEFAULT_MODEL,
    maxTokens = DEFAULT_MAX_TOKENS,
    apiKey = loadEnv().ANTHROPIC_API_KEY,
    fetchImpl = fetch,
  } = options;
  if (!apiKey) throw new LlmError('ANTHROPIC_API_KEY is not set');

  const startedAt = Date.now();
  const response = await fetchImpl(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) throw new LlmError(`Anthropic request failed with status ${response.status}`);

  const parsed = responseSchema.parse(await response.json());
  const latencyMs = Date.now() - startedAt;
  const text = parsed.content.map((block) => block.text ?? '').join('');
  logger.info(
    {
      model,
      inputTokens: parsed.usage.input_tokens,
      outputTokens: parsed.usage.output_tokens,
      latencyMs,
    },
    'llm completion',
  );
  return {
    text,
    inputTokens: parsed.usage.input_tokens,
    outputTokens: parsed.usage.output_tokens,
    latencyMs,
  };
}
