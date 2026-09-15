import { expect, it } from 'vitest';
import { cn } from './cn.service';

it('joins class names', () => {
  expect(cn('a', 'b')).toBe('a b');
});

it('drops falsy values', () => {
  expect(cn('a', false, undefined, 'b')).toBe('a b');
});

it('resolves conflicting tailwind utilities in favor of the last', () => {
  expect(cn('px-2', 'px-4')).toBe('px-4');
});
