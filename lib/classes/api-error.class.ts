import { AppError } from './app-error.class';

export class ApiError extends AppError {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message, 'api_error');
    this.status = status;
  }
}
