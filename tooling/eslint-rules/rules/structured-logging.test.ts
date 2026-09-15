import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './structured-logging.lint';

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

it('log messages must be static; dynamic values go in metadata', () => {
  tester.run('structured-logging', rule, {
    valid: [
      "logger.info('server started');",
      "this.log.warn({ id }, 'failed to index');",
      'logger.error({ err }, `static template with no expressions`);',
      'notALogger.info(`value ${x}`);',
      "message.warn('unrelated receiver named message');",
    ],
    invalid: [
      {
        code: 'this.log.warn(`failed to index ${record.id}`);',
        errors: [{ messageId: 'staticMessage' }],
      },
      {
        code: "logger.error('failed for ' + userId);",
        errors: [{ messageId: 'staticMessage' }],
      },
      {
        code: 'log.info({ id }, `processed ${count} items`);',
        errors: [{ messageId: 'staticMessage' }],
      },
    ],
  });
});
