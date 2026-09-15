import { AppError } from './app-error.class';

export class LlmError extends AppError {
  constructor(message: string) {
    super(message, 'llm_error');
  }
}
