import { createHash } from 'node:crypto';
import { beforeAll, expect, it, vi } from 'vitest';
import {
  hashPassword,
  readLockedSnapshot,
  readUnlockFlag,
  subscribeUnlock,
  verifyPassword,
  writeUnlockFlag,
} from './password-gate.service';

const FAMILY_PASSWORD = 'open sesame';
const FRIENDS_PASSWORD = 'friends only';

beforeAll(() => {
  vi.stubEnv(
    'NEXT_PUBLIC_FAMILY_PASSWORD_HASH',
    createHash('sha256').update(FAMILY_PASSWORD).digest('hex'),
  );
  vi.stubEnv(
    'NEXT_PUBLIC_FRIENDS_PASSWORD_HASH',
    createHash('sha256').update(FRIENDS_PASSWORD).digest('hex'),
  );
});

it('hashes a password to the sha-256 hex digest', async () => {
  const expected = createHash('sha256').update(FAMILY_PASSWORD).digest('hex');
  expect(await hashPassword(FAMILY_PASSWORD)).toBe(expected);
});

it('returns the album name when the family password matches', async () => {
  expect(await verifyPassword(FAMILY_PASSWORD)).toBe('family');
});

it('returns the album name when the friends password matches', async () => {
  expect(await verifyPassword(FRIENDS_PASSWORD)).toBe('friends');
});

it('returns null for a wrong password', async () => {
  expect(await verifyPassword('wrong')).toBeNull();
});

it('reports locked when storage is unavailable', () => {
  expect(readUnlockFlag()).toBe(false);
});

it('always reports locked for the server snapshot', () => {
  expect(readLockedSnapshot()).toBe(false);
});

it('unlocks in memory and notifies subscribers even without storage', () => {
  let notified = false;
  const unsubscribe = subscribeUnlock(() => {
    notified = true;
  });
  writeUnlockFlag('family');
  expect(readUnlockFlag()).toBe(true);
  expect(notified).toBe(true);
  unsubscribe();
});
