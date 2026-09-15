'use client';

import { useQuery } from '@tanstack/react-query';
import { getManifest } from './get-manifest.service';

const MANIFEST_STALE_TIME_MS = 300_000;

export function useManifest() {
  return useQuery({
    queryKey: ['manifest'],
    queryFn: () => getManifest(),
    staleTime: MANIFEST_STALE_TIME_MS,
  });
}
