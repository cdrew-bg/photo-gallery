import { expect, it } from 'vitest';
import { manifestSchema } from './manifest.schema';

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

it('accepts a valid manifest', () => {
  expect(manifestSchema.parse([validEntry])).toHaveLength(1);
});

it('rejects an entry with unknown keys', () => {
  expect(() => manifestSchema.parse([{ ...validEntry, extra: true }])).toThrow();
});

it('rejects a non-iso takenAt', () => {
  expect(() => manifestSchema.parse([{ ...validEntry, takenAt: 'yesterday' }])).toThrow();
});
