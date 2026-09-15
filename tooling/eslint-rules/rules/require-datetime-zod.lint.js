'use strict';

const isZDate = (node) =>
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'z' &&
  node.callee.property.type === 'Identifier' &&
  node.callee.property.name === 'date';

const isZCoerceDate = (node) =>
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  node.callee.property.type === 'Identifier' &&
  node.callee.property.name === 'date' &&
  node.callee.object.type === 'MemberExpression' &&
  !node.callee.object.computed &&
  node.callee.object.object.type === 'Identifier' &&
  node.callee.object.object.name === 'z' &&
  node.callee.object.property.type === 'Identifier' &&
  node.callee.object.property.name === 'coerce';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Boundary schemas carry dates as ISO-8601 strings — use z.string().datetime({ offset: true }), never z.date() / z.coerce.date()',
    },
    schema: [],
    messages: {
      requireDatetime:
        'Dates cross the boundary as ISO-8601 strings — use z.string().datetime({ offset: true }) instead of z.date()/z.coerce.date(). Keeps the wire contract UTC and JSON-native.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (isZDate(node) || isZCoerceDate(node)) {
          context.report({ node, messageId: 'requireDatetime' });
        }
      },
    };
  },
};
