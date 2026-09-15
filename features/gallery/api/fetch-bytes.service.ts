import type { BinaryFetchLike } from '@/features/gallery/types/binary-fetch-like.type';
import { ApiError } from '@/lib/classes/api-error.class';

export interface FetchBytesOptions {
  readonly url: string;
  readonly fetchImpl: BinaryFetchLike;
}

export async function fetchBytes({
  url,
  fetchImpl,
}: FetchBytesOptions): Promise<Uint8Array<ArrayBuffer>> {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new ApiError('Image fetch failed', response.status);
  }
  return new Uint8Array(await response.arrayBuffer());
}
