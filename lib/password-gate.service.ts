import { loadEnv } from '@/lib/env.service';

const UNLOCK_STORAGE_KEY = 'gallery-unlocked';
const UNLOCK_VALUE = '1';
const HEX_RADIX = 16;
const HEX_PAD = 2;

const listeners = new Set<() => void>();

let unlockedInMemory = false;

export async function hashPassword(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(HEX_RADIX).padStart(HEX_PAD, '0'))
    .join('');
}

export async function verifyPassword(input: string): Promise<boolean> {
  const expected = loadEnv().NEXT_PUBLIC_GALLERY_PASSWORD_HASH;
  if (!expected) {
    return false;
  }
  return (await hashPassword(input)) === expected;
}

export function readUnlockFlag(): boolean {
  if (unlockedInMemory) {
    return true;
  }
  try {
    return localStorage.getItem(UNLOCK_STORAGE_KEY) === UNLOCK_VALUE;
  } catch {
    return false;
  }
}

export function readLockedSnapshot(): boolean {
  return false;
}

export function subscribeUnlock(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function writeUnlockFlag(): void {
  unlockedInMemory = true;
  try {
    localStorage.setItem(UNLOCK_STORAGE_KEY, UNLOCK_VALUE);
  } catch {
    return undefined;
  } finally {
    for (const listener of listeners) {
      listener();
    }
  }
}
