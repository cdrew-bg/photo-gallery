import { expect, it } from 'vitest';
import { formatDuration } from './duration.service';

it('formats sub-minute durations with padded seconds', () => {
  expect(formatDuration(7)).toBe('0:07');
});

it('formats minute durations', () => {
  expect(formatDuration(83)).toBe('1:23');
});

it('rounds fractional seconds without overflowing the minute', () => {
  expect(formatDuration(59.6)).toBe('1:00');
});
