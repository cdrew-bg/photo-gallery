import { AppError } from './app-error.class';

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'validation_error');
  }
}
