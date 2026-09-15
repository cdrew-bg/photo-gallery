import { expect, it, vi } from 'vitest';
import type { SaveFileOptions } from './save-file.service';
import { downloadZip } from './zip-download.service';
import type { ZipProgress } from '@/features/gallery/interfaces/zip-progress.interface';
import type { BinaryFetchLike } from '@/features/gallery/types/binary-fetch-like.type';
import type { ImageEntry } from '@/lib/manifest.schema';

const ENTRY_COUNT = 10;
const POOL_LIMIT = 4;
const FETCH_DELAY_MS = 2;
const FAIL_STATUS = 500;
const OK_STATUS = 200;

const flakyFetch: BinaryFetchLike = (url) =>
  Promise.resolve({
    ok: !url.includes('id1.'),
    status: url.includes('id1.') ? FAIL_STATUS : OK_STATUS,
    arrayBuffer: () => Promise.resolve(new Uint8Array([1]).buffer),
  });

function makeEntries(count: number): ImageEntry[] {
  return Array.from({ length: count }, (unused, index) => ({
    id: `id${index}`,
    filename: `photo-${index}.jpg`,
    ext: 'jpg',
    contentType: 'image/jpeg',
    width: 100,
    height: 100,
    bytes: 3,
    takenAt: '2026-09-01T12:00:00.000Z',
  }));
}

function okFetch(): BinaryFetchLike {
  return () =>
    Promise.resolve({
      ok: true,
      status: OK_STATUS,
      arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
    });
}

it('zips every fetched image and saves one blob', async () => {
  const saves: SaveFileOptions[] = [];
  const result = await downloadZip({
    entries: makeEntries(3),
    onProgress: vi.fn(),
    fetchImpl: okFetch(),
    saveImpl: (options) => saves.push(options),
  });
  expect(result.done).toBe(3);
  expect(result.failed).toHaveLength(0);
  expect(saves).toHaveLength(1);
  expect(saves[0]?.filename).toBe('gallery.zip');
  expect((saves[0]?.bytes as Blob).size).toBeGreaterThan(0);
});

it('caps concurrent fetches at the pool limit', async () => {
  let active = 0;
  let peak = 0;
  const trackingFetch: BinaryFetchLike = async () => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS));
    active -= 1;
    return {
      ok: true,
      status: OK_STATUS,
      arrayBuffer: () => Promise.resolve(new Uint8Array([1]).buffer),
    };
  };
  await downloadZip({
    entries: makeEntries(ENTRY_COUNT),
    onProgress: vi.fn(),
    fetchImpl: trackingFetch,
    saveImpl: vi.fn(),
  });
  expect(peak).toBeLessThanOrEqual(POOL_LIMIT);
});

it('collects failures and reports progress', async () => {
  const updates: ZipProgress[] = [];
  const result = await downloadZip({
    entries: makeEntries(3),
    onProgress: (progress) => updates.push(progress),
    fetchImpl: flakyFetch,
    saveImpl: vi.fn(),
  });
  expect(result.failed).toEqual(['photo-1.jpg']);
  expect(result.done).toBe(2);
  expect(updates).toHaveLength(3);
});

it('deduplicates repeated filenames inside the zip', async () => {
  const entries = makeEntries(2).map((entry) => ({ ...entry, filename: 'same.jpg' }));
  const result = await downloadZip({
    entries,
    onProgress: vi.fn(),
    fetchImpl: okFetch(),
    saveImpl: vi.fn(),
  });
  expect(result.done).toBe(2);
});
