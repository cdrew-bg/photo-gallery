import { fetchBytes } from './fetch-bytes.service';
import { type SaveFileOptions, saveFile } from './save-file.service';
import type { BinaryFetchLike } from '@/features/gallery/types/binary-fetch-like.type';
import { imageUrl } from '@/lib/image-url.service';
import type { ImageEntry } from '@/lib/manifest.schema';

export interface DownloadImageOptions {
  readonly entry: ImageEntry;
  readonly fetchImpl?: BinaryFetchLike;
  readonly saveImpl?: (options: SaveFileOptions) => void;
}

export async function downloadImage({
  entry,
  fetchImpl,
  saveImpl,
}: DownloadImageOptions): Promise<void> {
  const doSave = saveImpl ?? saveFile;
  const bytes = await fetchBytes({ url: imageUrl(entry), fetchImpl: fetchImpl ?? fetch });
  doSave({ bytes, contentType: entry.contentType, filename: entry.filename });
}
