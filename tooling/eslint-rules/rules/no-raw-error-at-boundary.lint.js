'use strict';

const BUILTIN_ERRORS = new Set([
  'Error',
  'TypeError',
  'RangeError',
  'SyntaxError',
  'EvalError',
  'ReferenceError',
  'URIError',
  'AggregateError',
]);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Throw a typed AppError family at boundaries, never a raw built-in Error — callers cannot branch on an untyped Error',
    },
    schema: [],
    messages: {
      rawError:
        'Throw an AppError family from lib/errors.ts (LlmError, ValidationError, …), not `throw new {{name}}()`. Boundary callers branch on the typed code; a raw Error is uncatchable by kind.',
    },
  },
  create(context) {
    return {
      ThrowStatement(node) {
        const { argument } = node;
        if (!argument || argument.type !== 'NewExpression') return;
        if (argument.callee.type !== 'Identifier') return;
        const { name } = argument.callee;
        if (!BUILTIN_ERRORS.has(name)) return;
        context.report({ node, messageId: 'rawError', data: { name } });
      },
    };
  },
};
