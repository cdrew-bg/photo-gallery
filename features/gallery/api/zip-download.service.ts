import { zip } from 'fflate';
import { fetchBytes } from './fetch-bytes.service';
import { type SaveFileOptions, saveFile } from './save-file.service';
import type { ZipProgress } from '@/features/gallery/interfaces/zip-progress.interface';
import type { BinaryFetchLike } from '@/features/gallery/types/binary-fetch-like.type';
import { imageUrl } from '@/lib/image-url.service';
import type { ImageEntry } from '@/lib/manifest.schema';

const MAX_PARALLEL_FETCHES = 4;
const ZIP_FILENAME = 'gallery.zip';
const ZIP_CONTENT_TYPE = 'application/zip';
const STORE_ONLY = 0;

export interface ZipDownloadOptions {
  readonly entries: readonly ImageEntry[];
  readonly onProgress: (progress: ZipProgress) => void;
  readonly fetchImpl?: BinaryFetchLike;
  readonly saveImpl?: (options: SaveFileOptions) => void;
}

function uniqueName({
  entry,
  usedNames,
}: {
  readonly entry: ImageEntry;
  readonly usedNames: Set<string>;
}): string {
  const name = usedNames.has(entry.filename) ? `${entry.id}-${entry.filename}` : entry.filename;
  usedNames.add(name);
  return name;
}

async function runPool({
  count,
  worker,
}: {
  readonly count: number;
  readonly worker: (index: number) => Promise<void>;
}): Promise<void> {
  let cursor = 0;
  async function drain(): Promise<void> {
    const index = cursor;
    if (index >= count) {
      return;
    }
    cursor += 1;
    await worker(index);
    return drain();
  }
  const size = Math.min(MAX_PARALLEL_FETCHES, count);
  await Promise.all(Array.from({ length: size }, drain));
}

function buildZipBlob(
  files: readonly { readonly name: string; readonly bytes: Uint8Array<ArrayBuffer> }[],
): Promise<Blob> {
  const payload = Object.fromEntries(files.map((file) => [file.name, file.bytes]));
  return new Promise((resolve, reject) => {
    zip(payload, { level: STORE_ONLY }, (error, bytes) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(new Blob([new Uint8Array(bytes)], { type: ZIP_CONTENT_TYPE }));
    });
  });
}

export async function downloadZip(options: ZipDownloadOptions): Promise<ZipProgress> {
  const { entries, onProgress, fetchImpl, saveImpl } = options;
  const doFetch = fetchImpl ?? fetch;
  const doSave = saveImpl ?? saveFile;
  const usedNames = new Set<string>();
  const files: { name: string; bytes: Uint8Array<ArrayBuffer> }[] = [];
  const failed: string[] = [];
  await runPool({
    count: entries.length,
    worker: async (index) => {
      const entry = entries[index];
      if (!entry) {
        return;
      }
      try {
        const bytes = await fetchBytes({ url: imageUrl(entry), fetchImpl: doFetch });
        files.push({ name: uniqueName({ entry, usedNames }), bytes });
      } catch {
        failed.push(entry.filename);
      }
      onProgress({ done: files.length, total: entries.length, failed: [...failed] });
    },
  });
  if (files.length > 0) {
    const blob = await buildZipBlob(files);
    doSave({ bytes: blob, filename: ZIP_FILENAME, contentType: ZIP_CONTENT_TYPE });
  }
  return { done: files.length, total: entries.length, failed };
}
