import { RuleTester } from 'eslint';
import { it } from 'vitest';
import rule from './no-log-and-throw.lint';

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

it('catch blocks log XOR throw, never both', () => {
  tester.run('no-log-and-throw', rule, {
    valid: [
      "try { work(); } catch (err) { logger.error({ err }, 'work failed'); }",
      'try { work(); } catch (err) { throw new DomainError(err); }',
      "try { work(); } catch (err) { metrics.count('fail'); throw err; }",
    ],
    invalid: [
      {
        code: "try { work(); } catch (err) { logger.error({ err }, 'work failed'); throw err; }",
        errors: [{ messageId: 'logXorThrow' }],
      },
      {
        code: "try { work(); } catch (err) { this.log.warn('failed'); throw new Error('nope'); }",
        errors: [{ messageId: 'logXorThrow' }],
      },
    ],
  });
});
