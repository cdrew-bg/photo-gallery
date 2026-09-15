'use strict';

const DEEP_PARENT = /^\.\.\/[^/]+\/.+/;

const check = (context, node) => {
  const { source } = node;
  if (!source || typeof source.value !== 'string') return;
  if (!DEEP_PARENT.test(source.value)) return;
  context.report({ node: source, messageId: 'deepImport', data: { path: source.value } });
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Import another module by its public entry, not by reaching into its internal files',
    },
    schema: [],
    messages: {
      deepImport:
        'Deep import `{{path}}` reaches past a sibling module into its implementation. Import the module by its public entry so the interface/implementation seam holds.',
    },
  },
  create(context) {
    return {
      ImportDeclaration: (node) => check(context, node),
      ExportNamedDeclaration: (node) => check(context, node),
      ExportAllDeclaration: (node) => check(context, node),
    };
  },
};
