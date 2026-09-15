import { expect, it } from 'vitest';
import { queryConfig } from './react-query.service';

it('disables refetch on window focus', () => {
  expect(queryConfig.queries?.refetchOnWindowFocus).toBe(false);
});

it('disables retry', () => {
  expect(queryConfig.queries?.retry).toBe(false);
});

it('sets a positive stale time', () => {
  expect(queryConfig.queries?.staleTime).toBeGreaterThan(0);
});
