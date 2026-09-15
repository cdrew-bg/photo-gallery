'use strict';

const path = require('node:path');

const RESERVED = new Set([
  'page',
  'layout',
  'route',
  'loading',
  'error',
  'not-found',
  'template',
  'default',
  'global-error',
  'instrumentation',
  'middleware',
  'sitemap',
  'robots',
  'manifest',
  'opengraph-image',
  'twitter-image',
  'icon',
  'apple-icon',
  'favicon',
]);

const KNOWN_ROLES = new Set([
  'component',
  'hook',
  'interface',
  'type',
  'class',
  'enum',
  'schema',
  'service',
]);

const PRIMARY_KIND = {
  TSInterfaceDeclaration: 'interface',
  TSTypeAliasDeclaration: 'type',
  ClassDeclaration: 'class',
  TSEnumDeclaration: 'enum',
};

const HOOK_NAME = /^use[A-Z0-9]/;

const declaredOf = (node) => {
  if (node.type === 'ExportNamedDeclaration') return node.declaration;
  if (node.type === 'ExportDefaultDeclaration') return node.declaration;
  return node;
};

const isFunctionInit = (init) =>
  Boolean(init) && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression');

const zodRooted = (node) => {
  let current = node;
  while (current && (current.type === 'CallExpression' || current.type === 'MemberExpression')) {
    current = current.type === 'CallExpression' ? current.callee : current.object;
  }
  return Boolean(current) && current.type === 'Identifier' && current.name === 'z';
};

const collect = (body) => {
  const facts = { importsZod: false, hasHook: false, hasRuntimeFn: false, hasZodSchema: false };
  const primary = [];
  for (const node of body) {
    if (node.type === 'ImportDeclaration' && node.source.value === 'zod') facts.importsZod = true;
    const decl = declaredOf(node);
    if (!decl) continue;
    if (PRIMARY_KIND[decl.type]) primary.push(PRIMARY_KIND[decl.type]);
    if (decl.type === 'FunctionDeclaration' && decl.id && HOOK_NAME.test(decl.id.name))
      facts.hasHook = true;
    if (decl.type === 'FunctionDeclaration' && decl.id && !HOOK_NAME.test(decl.id.name))
      facts.hasRuntimeFn = true;
    if (decl.type === 'VariableDeclaration') {
      for (const dtor of decl.declarations) {
        const name = dtor.id.type === 'Identifier' ? dtor.id.name : '';
        if (isFunctionInit(dtor.init))
          HOOK_NAME.test(name) ? (facts.hasHook = true) : (facts.hasRuntimeFn = true);
        if (dtor.init && zodRooted(dtor.init)) facts.hasZodSchema = true;
      }
    }
  }
  return { facts, primary };
};

const inferRole = (state) => {
  if (state.hasJsx) return 'component';
  const { facts, primary } = state;
  if (facts.hasHook) return 'hook';
  if (facts.hasRuntimeFn) return 'service';
  if (facts.importsZod && facts.hasZodSchema) return 'schema';
  if (primary.length === 1) return primary[0];
  return 'service';
};

const parseName = (filename) => {
  const ext = path.extname(filename).slice(1);
  const base = path.basename(filename, path.extname(filename));
  const segments = base.split('.');
  const last = segments[segments.length - 1];
  const role = segments.length >= 2 && KNOWN_ROLES.has(last) ? last : null;
  const stem = role ? segments.slice(0, -1).join('.') : base;
  return { ext, stem, role };
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Every source file states its role in its name — foo.component.tsx, user.interface.ts, order.schema.ts, greeting.service.ts. Framework-reserved and test files are exempt.',
    },
    schema: [],
    messages: {
      wrongRole:
        'Filename role `{{declared}}` does not match the file content ({{expected}}). Rename to `{{stem}}.{{expected}}.{{ext}}`.',
      missingRole:
        'Source files must state their role in the name. This file is a {{expected}} — rename to `{{stem}}.{{expected}}.{{ext}}`.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    const base = path.basename(filename);
    const first = base.split('.')[0];
    if (base.endsWith('.d.ts') || base.includes('.test.') || RESERVED.has(first)) return {};

    const state = { hasJsx: false, facts: null, primary: [] };
    return {
      'JSXElement, JSXFragment': () => {
        state.hasJsx = true;
      },
      Program(program) {
        const gathered = collect(program.body);
        state.facts = gathered.facts;
        state.primary = gathered.primary;
      },
      'Program:exit'(program) {
        const expected = inferRole(state);
        const { ext, stem, role } = parseName(filename);
        if (role === expected) return;
        const wantedExt = expected === 'component' ? 'tsx' : ext;
        context.report({
          node: program,
          messageId: role ? 'wrongRole' : 'missingRole',
          data: { declared: role || '(none)', expected, stem, ext: wantedExt },
        });
      },
    };
  },
};
