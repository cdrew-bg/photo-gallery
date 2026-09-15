'use strict';

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

const isDateParse = (node) =>
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'Date' &&
  node.callee.property.type === 'Identifier' &&
  node.callee.property.name === 'parse';

const isNaiveNewDate = (node) => {
  if (node.callee.type !== 'Identifier' || node.callee.name !== 'Date') return false;
  if (node.arguments.length !== 1) return false;
  const arg = node.arguments[0];
  return arg.type === 'Literal' && typeof arg.value === 'string' && !ISO_UTC.test(arg.value);
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Locale-dependent date parsing is timezone-unsafe — parse only ISO-8601 strings with an explicit offset; never Date.parse or new Date(nonIsoString)',
    },
    schema: [],
    messages: {
      naiveParse:
        'Bare/locale-dependent date parsing is timezone-unsafe — parse only ISO-8601 strings with an explicit UTC offset (…Z). Avoid Date.parse() and new Date(nonIsoString).',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (isDateParse(node)) {
          context.report({ node, messageId: 'naiveParse' });
        }
      },
      NewExpression(node) {
        if (isNaiveNewDate(node)) {
          context.report({ node, messageId: 'naiveParse' });
        }
      },
    };
  },
};
