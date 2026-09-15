'use strict';

const SPEC_FILE = /\.spec\.tsx?$/;

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Tests are *.test.ts colocated next to the code — no __tests__/ dirs, no *.spec.ts',
    },
    schema: [],
    messages: {
      wrongLocation:
        'Tests are `*.test.ts` colocated next to the code — no `__tests__/` folders, no `*.spec.ts` (CLAUDE.md "Testing").',
    },
  },
  create(context) {
    return {
      Program(node) {
        const file = context.filename;
        if (file.includes('/__tests__/') || SPEC_FILE.test(file)) {
          context.report({ node, messageId: 'wrongLocation' });
        }
      },
    };
  },
};
