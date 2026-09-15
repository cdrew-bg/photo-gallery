'use strict';

const SCHEMA_FILE = /\.schema\.ts$/;
const OBJECT_BUILDERS = new Set(['object', 'strictObject', 'looseObject']);

const isZodObjectCall = (node) =>
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'z' &&
  node.callee.property.type === 'Identifier' &&
  OBJECT_BUILDERS.has(node.callee.property.name);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Boundary z.object() schemas live only in *.schema.ts, where .strict() and datetime rules apply',
    },
    schema: [],
    messages: {
      wrongLocation:
        'Define boundary z.object() schemas in a *.schema.ts file. Elsewhere they bypass zod-strict-boundary and require-datetime-zod, so unknown keys and z.date() slip through.',
    },
  },
  create(context) {
    if (SCHEMA_FILE.test(context.filename)) return {};
    return {
      CallExpression(node) {
        if (!isZodObjectCall(node)) return;
        context.report({ node, messageId: 'wrongLocation' });
      },
    };
  },
};
