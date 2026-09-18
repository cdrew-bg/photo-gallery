import { loadEnv } from '@/lib/env.service';

const ALBUMS = ['family', 'friends'] as const;
type Album = (typeof ALBUMS)[number];

const STORAGE_PREFIX = 'gallery-unlocked-';
const UNLOCK_VALUE = '1';
const HEX_RADIX = 16;
const HEX_PAD = 2;

const listeners = new Set<() => void>();
const unlockedInMemory = new Set<string>();

function albumHash(album: Album): string {
  const env = loadEnv();
  return album === 'family'
    ? env.NEXT_PUBLIC_FAMILY_PASSWORD_HASH
    : env.NEXT_PUBLIC_FRIENDS_PASSWORD_HASH;
}

export async function hashPassword(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(HEX_RADIX).padStart(HEX_PAD, '0'))
    .join('');
}

export async function verifyPassword(input: string): Promise<string | null> {
  const hash = await hashPassword(input);
  for (const album of ALBUMS) {
    const expected = albumHash(album);
    if (expected && hash === expected) {
      return album;
    }
  }
  return null;
}

export function readUnlockedAlbums(): Set<string> {
  const result = new Set(unlockedInMemory);
  for (const album of ALBUMS) {
    try {
      if (localStorage.getItem(`${STORAGE_PREFIX}${album}`) === UNLOCK_VALUE) {
        result.add(album);
      }
    } catch {
      void 0;
    }
  }
  return result;
}

export function readUnlockedAlbumsStr(): string {
  const unlocked = readUnlockedAlbums();
  return ALBUMS.filter((album) => unlocked.has(album)).join(',');
}

export function readUnlockFlag(): boolean {
  return readUnlockedAlbums().size > 0;
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

export function writeUnlockFlag(album: string): void {
  unlockedInMemory.add(album);
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${album}`, UNLOCK_VALUE);
  } catch {
    return undefined;
  } finally {
    for (const listener of listeners) {
      listener();
    }
  }
}
