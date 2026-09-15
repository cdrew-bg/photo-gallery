'use strict';

const path = require('node:path');

const FOLDER = { class: 'classes', enum: 'enums', type: 'types', interface: 'interfaces' };

const KNOWN_ROLES = new Set([
  'component',
  'hook',
  'interface',
  'type',
  'class',
  'enum',
  'schema',
  'service',
  'lint',
]);

const roleOf = (filename) => {
  const base = path.basename(filename);
  if (base.includes('.test.') || base.endsWith('.d.ts')) return null;
  const segments = path.basename(base, path.extname(base)).split('.');
  const last = segments[segments.length - 1];
  return segments.length >= 2 && KNOWN_ROLES.has(last) ? last : null;
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Interface, type, class and enum files live in a kind-named folder — interfaces/, types/, classes/, enums/.',
    },
    schema: [],
    messages: {
      wrongFolder:
        'A {{role}} file belongs in a `{{folder}}/` folder within its directory. Move it to `{{folder}}/{{base}}`.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    const folder = FOLDER[roleOf(filename)];
    if (!folder) return {};
    if (path.basename(path.dirname(filename)) === folder) return {};
    return {
      Program(node) {
        context.report({
          node,
          messageId: 'wrongFolder',
          data: { role: roleOf(filename), folder, base: path.basename(filename) },
        });
      },
    };
  },
};
