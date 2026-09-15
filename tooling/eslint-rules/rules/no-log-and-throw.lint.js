'use strict';

const LOG_METHODS = new Set(['info', 'warn', 'error', 'debug', 'fatal', 'trace']);
const LOGGER_NAME = /^log(ger)?$/i;

const isLoggerCallStatement = (statement) => {
  if (statement.type !== 'ExpressionStatement') return false;
  const expr = statement.expression;
  if (expr.type !== 'CallExpression' || expr.callee.type !== 'MemberExpression') return false;
  const { callee } = expr;
  if (callee.computed || callee.property.type !== 'Identifier') return false;
  if (!LOG_METHODS.has(callee.property.name)) return false;
  const receiver = callee.object;
  return (
    (receiver.type === 'Identifier' && LOGGER_NAME.test(receiver.name)) ||
    (receiver.type === 'MemberExpression' &&
      !receiver.computed &&
      receiver.property.type === 'Identifier' &&
      LOGGER_NAME.test(receiver.property.name))
  );
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'A catch block either logs (and handles) or throws (for upstream logging) — never both',
    },
    schema: [],
    messages: {
      logXorThrow:
        'This catch block both logs and throws — the error gets reported twice. Log-and-handle, or throw and let the upstream handler log.',
    },
  },
  create(context) {
    return {
      CatchClause(node) {
        const statements = node.body.body;
        const logStatement = statements.find(isLoggerCallStatement);
        const throwsToo = statements.some((statement) => statement.type === 'ThrowStatement');
        if (logStatement && throwsToo) {
          context.report({ node: logStatement, messageId: 'logXorThrow' });
        }
      },
    };
  },
};
