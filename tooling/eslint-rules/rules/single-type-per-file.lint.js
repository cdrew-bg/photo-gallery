'use strict';

const PRIMARY = {
  TSInterfaceDeclaration: 'interface',
  TSTypeAliasDeclaration: 'type',
  ClassDeclaration: 'class',
};

const inner = (node) => {
  if (node.type === 'ExportNamedDeclaration') return node.declaration;
  if (node.type === 'ExportDefaultDeclaration') return node.declaration;
  return node;
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'A file declares at most one top-level interface, type alias, or class; each gets its own file.',
    },
    schema: [],
    messages: {
      multiple:
        'This file already declares a top-level {{firstKind}} `{{firstName}}`. Move {{kind}} `{{name}}` into its own file — one interface, type, or class per file.',
    },
  },
  create(context) {
    return {
      Program(program) {
        let first = null;
        for (const node of program.body) {
          const decl = inner(node);
          if (!decl) continue;
          const kind = PRIMARY[decl.type];
          if (!kind) continue;
          const name = decl.id && decl.id.name ? decl.id.name : '(anonymous)';
          if (!first) {
            first = { kind, name };
            continue;
          }
          context.report({
            node,
            messageId: 'multiple',
            data: { firstKind: first.kind, firstName: first.name, kind, name },
          });
        }
      },
    };
  },
};
