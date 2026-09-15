import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const TEMPLATE_DIR = 'scripts/templates';
const ARGS_OFFSET = 2;
const EXIT_ERROR = 1;
const USAGE = 'usage: pnpm gen <service|schema|route|component|page> <name> [route-dir]';

const RECIPES = {
  service: [
    { template: 'service.ts.tmpl', out: (ctx) => `lib/${ctx.kebab}.service.ts` },
    { template: 'service.test.ts.tmpl', out: (ctx) => `lib/${ctx.kebab}.test.ts` },
  ],
  schema: [{ template: 'schema.schema.ts.tmpl', out: (ctx) => `lib/${ctx.kebab}.schema.ts` }],
  route: [
    { template: 'route.ts.tmpl', out: (ctx) => `app/api/${ctx.path}/route.ts` },
    { template: 'route.schema.ts.tmpl', out: (ctx) => `app/api/${ctx.path}/route.schema.ts` },
    { template: 'route.test.ts.tmpl', out: (ctx) => `app/api/${ctx.path}/route.test.ts` },
  ],
  component: [
    { template: 'component.tsx.tmpl', out: (ctx) => `${ctx.dir}/${ctx.kebab}.component.tsx` },
    { template: 'component.test.tsx.tmpl', out: (ctx) => `${ctx.dir}/${ctx.kebab}.test.tsx` },
  ],
  page: [
    { template: 'page.tsx.tmpl', out: (ctx) => `app/${ctx.path}/page.tsx` },
    { template: 'page.test.tsx.tmpl', out: (ctx) => `app/${ctx.path}/page.test.tsx` },
  ],
};

function toKebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

function toPascal(value) {
  return toKebab(value)
    .split('-')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
}

function toCamel(value) {
  return toPascal(value).replace(/^[A-Z]/, (ch) => ch.toLowerCase());
}

function toSnake(value) {
  return toKebab(value).replace(/-/g, '_');
}

function buildContext({ rawName, extra }) {
  const parts = rawName.split('/').filter(Boolean);
  const base = parts.pop() ?? rawName;
  const path = [...parts, toKebab(base)].join('/');
  const dir = extra ? `app/${toKebab(extra)}` : 'components';
  return {
    kebab: toKebab(base),
    pascal: toPascal(base),
    camel: toCamel(base),
    snake: toSnake(base),
    path,
    dir,
  };
}

function render({ template, context }) {
  return readFileSync(`${TEMPLATE_DIR}/${template}`, 'utf8')
    .replaceAll('__KEBAB__', context.kebab)
    .replaceAll('__PASCAL__', context.pascal)
    .replaceAll('__CAMEL__', context.camel)
    .replaceAll('__SNAKE__', context.snake);
}

function emit({ recipe, context }) {
  const created = [];
  for (const step of recipe) {
    const out = step.out(context);
    if (existsSync(out)) {
      process.stderr.write(`gen: refusing to overwrite ${out}\n`);
      process.exit(EXIT_ERROR);
    }
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, render({ template: step.template, context }));
    created.push(out);
  }
  return created;
}

function main() {
  const [type, rawName, extra] = process.argv.slice(ARGS_OFFSET);
  const recipe = RECIPES[type];
  if (!recipe || !rawName) {
    process.stderr.write(`${USAGE}\n`);
    process.exit(EXIT_ERROR);
  }
  const created = emit({ recipe, context: buildContext({ rawName, extra }) });
  process.stdout.write(`gen: created\n${created.map((path) => `  ${path}`).join('\n')}\n`);
  process.stdout.write('next: pnpm check:quick\n');
}

main();
