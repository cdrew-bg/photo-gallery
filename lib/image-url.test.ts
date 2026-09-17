import { expect, it } from 'vitest';
import { imageUrl, thumbUrl } from './image-url.service';
import type { ImageEntry } from './manifest.schema';

const entry: ImageEntry = {
  id: 'abc123def456',
  type: 'photo',
  filename: 'beach.jpg',
  ext: 'jpg',
  contentType: 'image/jpeg',
  width: 4032,
  height: 3024,
  bytes: 2048,
  takenAt: '2026-09-01T12:00:00.000Z',
};

it('builds the thumb url from the id', () => {
  expect(thumbUrl(entry.id)).toContain('/thumbs/abc123def456.webp');
});

it('builds the image url from id and extension', () => {
  expect(imageUrl(entry)).toContain('/images/abc123def456.jpg');
});
