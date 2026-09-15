import { beforeEach, expect, it } from 'vitest';
import { useSelection } from './selection.service';

beforeEach(() => {
  useSelection.getState().clear();
});

it('toggles an id in and out of the selection', () => {
  useSelection.getState().toggle('a1');
  expect(useSelection.getState().selected.has('a1')).toBe(true);
  useSelection.getState().toggle('a1');
  expect(useSelection.getState().selected.has('a1')).toBe(false);
});

it('selects all provided ids', () => {
  useSelection.getState().selectAll(['a1', 'b2', 'c3']);
  expect(useSelection.getState().selected.size).toBe(3);
});

it('clears the selection', () => {
  useSelection.getState().selectAll(['a1', 'b2']);
  useSelection.getState().clear();
  expect(useSelection.getState().selected.size).toBe(0);
});
