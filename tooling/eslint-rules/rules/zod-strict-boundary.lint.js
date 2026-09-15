'use strict';

const isZodObjectCall = (node) =>
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'z' &&
  node.callee.property.name === 'object';

const chainHasStrict = (node) => {
  let current = node;
  while (
    current.parent &&
    current.parent.type === 'MemberExpression' &&
    current.parent.object === current &&
    current.parent.parent &&
    current.parent.parent.type === 'CallExpression' &&
    current.parent.parent.callee === current.parent
  ) {
    if (!current.parent.computed && current.parent.property.name === 'strict') return true;
    current = current.parent.parent;
  }
  return false;
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Boundary schemas must chain .strict() on z.object so unknown properties are rejected',
    },
    fixable: 'code',
    schema: [],
    messages: {
      requireStrict:
        'Boundary z.object() must chain .strict() — unknown request properties are rejected at the boundary, never silently dropped.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isZodObjectCall(node)) return;
        if (chainHasStrict(node)) return;
        context.report({
          node,
          messageId: 'requireStrict',
          fix: (fixer) => fixer.insertTextAfter(node, '.strict()'),
        });
      },
    };
  },
};
