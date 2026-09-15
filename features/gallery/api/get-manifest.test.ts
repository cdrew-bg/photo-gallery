import { afterEach, expect, it, vi } from 'vitest';
import { getManifest } from './get-manifest.service';

const validEntry = {
  id: 'abc123def456',
  filename: 'beach.jpg',
  ext: 'jpg',
  contentType: 'image/jpeg',
  width: 4032,
  height: 3024,
  bytes: 2048,
  takenAt: '2026-09-01T12:00:00.000Z',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

it('parses a valid manifest payload', async () => {
  vi.stubGlobal('fetch', () =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([validEntry]),
    }),
  );
  const manifest = await getManifest();
  expect(manifest).toHaveLength(1);
});

it('rejects a payload with an unexpected shape', async () => {
  vi.stubGlobal('fetch', () =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ id: 'only-an-id' }]),
    }),
  );
  await expect(getManifest()).rejects.toBeDefined();
});

it('throws a typed error on a failed response', async () => {
  vi.stubGlobal('fetch', () =>
    Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    }),
  );
  await expect(getManifest()).rejects.toMatchObject({ code: 'api_error', status: 404 });
});
