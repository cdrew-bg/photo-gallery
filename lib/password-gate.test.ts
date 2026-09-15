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

const PASSWORD = 'open sesame';

beforeAll(() => {
  const hash = createHash('sha256').update(PASSWORD).digest('hex');
  vi.stubEnv('NEXT_PUBLIC_GALLERY_PASSWORD_HASH', hash);
});

it('hashes a password to the sha-256 hex digest', async () => {
  const expected = createHash('sha256').update(PASSWORD).digest('hex');
  expect(await hashPassword(PASSWORD)).toBe(expected);
});

it('accepts the configured password', async () => {
  expect(await verifyPassword(PASSWORD)).toBe(true);
});

it('rejects a wrong password', async () => {
  expect(await verifyPassword('wrong')).toBe(false);
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
  writeUnlockFlag();
  expect(readUnlockFlag()).toBe(true);
  expect(notified).toBe(true);
  unsubscribe();
});
