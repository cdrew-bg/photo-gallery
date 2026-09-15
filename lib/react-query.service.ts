import type { DefaultOptions } from '@tanstack/react-query';

const STALE_TIME_MS = 60_000;

export const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: STALE_TIME_MS,
  },
};
