'use strict';

const ROUTE_FILE = /(^|\/)route\.ts$/;
const ALLOWED = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'runtime',
  'dynamic',
  'revalidate',
  'fetchCache',
  'preferredRegion',
  'maxDuration',
]);

const reportName = (context, node, name) => {
  if (ALLOWED.has(name)) return;
  context.report({ node, messageId: 'onlyHandlers', data: { name } });
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'route.ts exports only HTTP method handlers and Next route config — business logic belongs in lib/',
    },
    schema: [],
    messages: {
      onlyHandlers:
        'route.ts may export only HTTP handlers (GET, POST, …) and Next route config. Move `{{name}}` into a lib/ module and import it here.',
    },
  },
  create(context) {
    if (!ROUTE_FILE.test(context.filename)) return {};
    return {
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          const decl = node.declaration;
          if (decl.type === 'FunctionDeclaration' && decl.id) {
            reportName(context, decl, decl.id.name);
            return;
          }
          if (decl.type === 'VariableDeclaration') {
            for (const declarator of decl.declarations) {
              if (declarator.id.type === 'Identifier')
                reportName(context, declarator, declarator.id.name);
            }
          }
          return;
        }
        for (const specifier of node.specifiers) {
          reportName(context, specifier, specifier.exported.name);
        }
      },
    };
  },
};
