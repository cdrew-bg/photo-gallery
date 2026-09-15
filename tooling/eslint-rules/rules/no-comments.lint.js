'use strict';

const isShebang = (comment) =>
  comment.type === 'Shebang' ||
  (comment.loc.start.line === 1 && comment.loc.start.column === 0 && comment.value.startsWith('!'));

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow all comments; explanations belong in docs/ or an ADR',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noComments:
        'Comments are forbidden (including eslint directives). Make the code self-documenting; move WHY explanations to docs/ or an ADR. See CLAUDE.md "Code Style".',
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (isShebang(comment)) continue;
          context.report({
            loc: comment.loc,
            messageId: 'noComments',
            fix: (fixer) => fixer.removeRange(comment.range),
          });
        }
      },
    };
  },
};
