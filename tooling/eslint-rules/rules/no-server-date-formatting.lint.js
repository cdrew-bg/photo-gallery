'use strict';

const BANNED_METHODS = new Set([
  'toLocaleString',
  'toLocaleDateString',
  'toLocaleTimeString',
  'toDateString',
  'toTimeString',
]);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Server code must emit ISO-8601 UTC (.toISOString()); locale/date formatting belongs to the client rendering layer only',
    },
    schema: [],
    messages: {
      noFormatting:
        'Server must emit ISO-8601 UTC — use .toISOString() instead of .{{method}}(). Locale formatting belongs in the client rendering layer only.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type !== 'MemberExpression' ||
          callee.computed ||
          callee.property.type !== 'Identifier' ||
          !BANNED_METHODS.has(callee.property.name)
        ) {
          return;
        }
        context.report({
          node: callee.property,
          messageId: 'noFormatting',
          data: { method: callee.property.name },
        });
      },
    };
  },
};
