import { ApiError } from '@/lib/classes/api-error.class';
import { loadEnv } from '@/lib/env.service';
import { type Manifest, manifestSchema } from '@/lib/manifest.schema';
import type { FetchLike } from '@/lib/types/fetch-like.type';

export async function getManifest(fetchImpl?: FetchLike): Promise<Manifest> {
  const doFetch: FetchLike = fetchImpl ?? fetch;
  const base = loadEnv().NEXT_PUBLIC_IMAGE_REPO_BASE;
  const response = await doFetch(`${base}/manifest.json`, { cache: 'no-store' });
  if (!response.ok) {
    throw new ApiError('Manifest fetch failed', response.status);
  }
  return manifestSchema.parse(await response.json());
}
