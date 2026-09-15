'use strict';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'vi.mock targets a package specifier (system boundary), never a relative internal module',
    },
    schema: [],
    messages: {
      boundaryOnly:
        'Mock at system boundaries only — vi.mock a package specifier, not an internal module. Restructure the code to inject the dependency instead (CLAUDE.md "Testing").',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          !node.callee.computed &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'vi' &&
          node.callee.property.name === 'mock' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal' &&
          typeof node.arguments[0].value === 'string' &&
          node.arguments[0].value.startsWith('.')
        ) {
          context.report({ node: node.arguments[0], messageId: 'boundaryOnly' });
        }
      },
    };
  },
};
