import pino from 'pino';
import { loadEnv } from './env.service';

const env = loadEnv();

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});
