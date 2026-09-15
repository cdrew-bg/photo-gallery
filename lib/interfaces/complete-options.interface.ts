import type { FetchLike } from '@/lib/types/fetch-like.type';

export interface CompleteOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  apiKey?: string;
  fetchImpl?: FetchLike;
}
