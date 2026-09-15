'use strict';

const DECL_TYPES = new Set([
  'TSTypeAliasDeclaration',
  'TSInterfaceDeclaration',
  'TSEnumDeclaration',
]);

const KIND_LABEL = {
  TSTypeAliasDeclaration: 'type',
  TSInterfaceDeclaration: 'interface',
  TSEnumDeclaration: 'enum',
};

const isFunctionConst = (node) =>
  node.declarations.some(
    (declarator) =>
      declarator.init &&
      (declarator.init.type === 'ArrowFunctionExpression' ||
        declarator.init.type === 'FunctionExpression'),
  );

const inner = (node) => {
  if (node.type === 'ExportNamedDeclaration') return node.declaration;
  if (node.type === 'ExportDefaultDeclaration') return node.declaration;
  return node;
};

const classify = (node) => {
  if (node.type === 'ExportDefaultDeclaration') return 'impl';
  const decl = inner(node);
  if (!decl) return 'ignore';
  if (DECL_TYPES.has(decl.type)) return 'decl';
  if (decl.type === 'VariableDeclaration') return isFunctionConst(decl) ? 'impl' : 'decl';
  if (decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration') return 'impl';
  return 'ignore';
};

const describe = (node) => {
  const decl = inner(node);
  if (decl.type === 'VariableDeclaration') {
    const first = decl.declarations[0];
    const name = first && first.id.type === 'Identifier' ? first.id.name : 'const';
    return { name, kind: 'const' };
  }
  const name = decl.id && decl.id.name ? decl.id.name : 'declaration';
  return { name, kind: KIND_LABEL[decl.type] || 'declaration' };
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Module-level constants, type aliases, interfaces and enums are declared at the top of the file, before any function or class implementation.',
    },
    schema: [],
    messages: {
      outOfOrder:
        'Move {{kind}} `{{name}}` above the function/class implementations. Constants, types, interfaces and enums belong at the top of the file, below the imports.',
    },
  },
  create(context) {
    return {
      Program(program) {
        let seenImpl = false;
        for (const node of program.body) {
          const group = classify(node);
          if (group === 'impl') {
            seenImpl = true;
            continue;
          }
          if (group === 'decl' && seenImpl) {
            context.report({ node, messageId: 'outOfOrder', data: describe(node) });
          }
        }
      },
    };
  },
};
