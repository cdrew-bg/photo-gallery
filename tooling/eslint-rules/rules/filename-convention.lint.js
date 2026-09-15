'use strict';

const KEBAB_STEM = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DYNAMIC_SEGMENT = /^\[.+\]$/;

function stemOf(filename) {
  const base = filename.split('/').pop();
  const dot = base.indexOf('.');
  return base.slice(0, dot === -1 ? base.length : dot);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Source file names are kebab-case; Next.js special files already comply, dynamic [param] segments exempt',
    },
    schema: [],
    messages: {
      notKebab:
        'File name `{{base}}` is not kebab-case. Rename the file to `kebab-case` (lowercase words joined by hyphens); a class still lives in a kebab-cased file (CLAUDE.md "Code Style").',
    },
  },
  create(context) {
    return {
      Program(node) {
        const stem = stemOf(context.filename);
        if (DYNAMIC_SEGMENT.test(stem) || KEBAB_STEM.test(stem)) return;
        context.report({
          node,
          messageId: 'notKebab',
          data: { base: context.filename.split('/').pop() },
        });
      },
    };
  },
};
