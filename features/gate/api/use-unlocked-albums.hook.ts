'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { readUnlockedAlbumsStr, subscribeUnlock } from '@/lib/password-gate.service';

function readEmptyStr(): string {
  return '';
}

export function useUnlockedAlbums(): ReadonlySet<string> {
  const str = useSyncExternalStore(subscribeUnlock, readUnlockedAlbumsStr, readEmptyStr);
  return useMemo(() => new Set(str ? str.split(',') : []), [str]);
}
