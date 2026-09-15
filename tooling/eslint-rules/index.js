'use strict';

module.exports = {
  meta: { name: 'eslint-plugin-local' },
  rules: {
    'no-comments': require('./rules/no-comments.lint'),
    'zod-strict-boundary': require('./rules/zod-strict-boundary.lint'),
    'structured-logging': require('./rules/structured-logging.lint'),
    'no-log-and-throw': require('./rules/no-log-and-throw.lint'),
    'test-file-location': require('./rules/test-file-location.lint'),
    'no-internal-vi-mock': require('./rules/no-internal-vi-mock.lint'),
    'no-server-date-formatting': require('./rules/no-server-date-formatting.lint'),
    'require-datetime-zod': require('./rules/require-datetime-zod.lint'),
    'no-naive-date-parse': require('./rules/no-naive-date-parse.lint'),
    'boundary-schema-location': require('./rules/boundary-schema-location.lint'),
    'no-raw-error-at-boundary': require('./rules/no-raw-error-at-boundary.lint'),
    'route-exports-only-handlers': require('./rules/route-exports-only-handlers.lint'),
    'no-deep-module-import': require('./rules/no-deep-module-import.lint'),
    'filename-convention': require('./rules/filename-convention.lint'),
    'declarations-at-top': require('./rules/declarations-at-top.lint'),
    'single-type-per-file': require('./rules/single-type-per-file.lint'),
    'filename-role-suffix': require('./rules/filename-role-suffix.lint'),
    'kind-folder': require('./rules/kind-folder.lint'),
  },
};
