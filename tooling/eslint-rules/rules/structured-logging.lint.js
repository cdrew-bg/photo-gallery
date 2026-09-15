'use strict';

const LOG_METHODS = new Set(['info', 'warn', 'error', 'debug', 'fatal', 'trace']);
const LOGGER_NAME = /^log(ger)?$/i;

const isLoggerReceiver = (object) =>
  (object.type === 'Identifier' && LOGGER_NAME.test(object.name)) ||
  (object.type === 'MemberExpression' &&
    !object.computed &&
    object.property.type === 'Identifier' &&
    LOGGER_NAME.test(object.property.name));

const isDynamicString = (arg) =>
  (arg.type === 'TemplateLiteral' && arg.expressions.length > 0) ||
  (arg.type === 'BinaryExpression' && arg.operator === '+');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Log messages are static strings; dynamic values go in the metadata object (pino convention)',
    },
    schema: [],
    messages: {
      staticMessage:
        "Log message must be a static string — put dynamic values in the metadata object: log.{{method}}({ id }, 'static message'). Keeps logs aggregatable.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.property.type !== 'Identifier' ||
          !LOG_METHODS.has(node.callee.property.name) ||
          !isLoggerReceiver(node.callee.object)
        ) {
          return;
        }
        const messageArg = node.arguments.find(isDynamicString);
        if (messageArg) {
          context.report({
            node: messageArg,
            messageId: 'staticMessage',
            data: { method: node.callee.property.name },
          });
        }
      },
    };
  },
};
