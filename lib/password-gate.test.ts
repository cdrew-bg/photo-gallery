import { createHash } from 'node:crypto';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import {
  hashPassword,
  readLockedSnapshot,
  readUnlockFlag,
  readUnlockedAlbums,
  readUnlockedAlbumsStr,
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

afterEach(() => {
  vi.unstubAllGlobals();
});

it('reads albums from localStorage when available', () => {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (key === 'gallery-unlocked-friends' ? '1' : null),
    setItem: () => {},
  });
  expect(readUnlockedAlbums().has('friends')).toBe(true);
});

it('serializes unlocked albums as comma-joined string in fixed order', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => '1',
    setItem: () => {},
  });
  expect(readUnlockedAlbumsStr()).toBe('family,friends');
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
