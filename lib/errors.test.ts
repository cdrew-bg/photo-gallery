import { expect, it } from 'vitest';
import { AppError } from './classes/app-error.class';
import { LlmError } from './classes/llm-error.class';
import { ValidationError } from './classes/validation-error.class';

it('sets code and name on AppError', () => {
  const err = new AppError('boom', 'app_error');
  expect(err.code).toBe('app_error');
  expect(err.name).toBe('AppError');
});

it('LlmError carries the llm_error code', () => {
  expect(new LlmError('x').code).toBe('llm_error');
});

it('ValidationError carries the validation_error code', () => {
  expect(new ValidationError('x').code).toBe('validation_error');
});
