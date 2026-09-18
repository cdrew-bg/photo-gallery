import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  ANTHROPIC_API_KEY: z.string().optional(),
  NEXT_PUBLIC_IMAGE_REPO_BASE: z.string().default(''),
  NEXT_PUBLIC_FAMILY_PASSWORD_HASH: z.string().default(''),
  NEXT_PUBLIC_FRIENDS_PASSWORD_HASH: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function loadEnv(): Env {
  if (cached) return cached;
  cached = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_IMAGE_REPO_BASE: process.env.NEXT_PUBLIC_IMAGE_REPO_BASE,
    NEXT_PUBLIC_FAMILY_PASSWORD_HASH: process.env.NEXT_PUBLIC_FAMILY_PASSWORD_HASH,
    NEXT_PUBLIC_FRIENDS_PASSWORD_HASH: process.env.NEXT_PUBLIC_FRIENDS_PASSWORD_HASH,
  });
  return cached;
}
