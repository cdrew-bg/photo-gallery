import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOLS_PATH = join(HERE, 'tools.json');
const PROTOCOL_VERSION = '2024-11-05';
const SERVER_NAME = 'project-dev-mcp';
const SERVER_VERSION = '1.0.0';
const MAX_OUTPUT_CHARS = 60_000;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const EMPTY_SCHEMA = { type: 'object', properties: {}, additionalProperties: false };

const manifest = JSON.parse(readFileSync(TOOLS_PATH, 'utf8'));
const toolsByName = new Map(manifest.tools.map((tool) => [tool.name, tool]));

function log(message) {
  process.stderr.write(`[${SERVER_NAME}] ${message}\n`);
}

function send(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function reply(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function fail(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

function truncate(text) {
  if (text.length <= MAX_OUTPUT_CHARS) return text;
  return `${text.slice(0, MAX_OUTPUT_CHARS)}\n…output truncated…`;
}

function runScript(tool) {
  const result = spawnSync('pnpm', ['--silent', 'run', tool.script], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });
  const body = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  const ok = result.status === 0;
  const header = `$ pnpm ${tool.script} → ${ok ? 'PASS' : `FAIL (exit ${result.status})`}`;
  return { ok, text: truncate(`${header}\n\n${body || '(no output)'}`) };
}

function listTools() {
  return manifest.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: EMPTY_SCHEMA,
  }));
}

function callTool(id, params) {
  const tool = toolsByName.get(params?.name);
  if (!tool) {
    fail(id, INVALID_PARAMS, `unknown tool: ${params?.name}`);
    return;
  }
  const { ok, text } = runScript(tool);
  reply(id, { content: [{ type: 'text', text }], isError: !ok });
}

function initialize(id) {
  reply(id, {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: { tools: {} },
    serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
  });
}

function dispatch(message) {
  const { id, method, params } = message;
  if (method === 'initialize') return initialize(id);
  if (method === 'tools/list') return reply(id, { tools: listTools() });
  if (method === 'tools/call') return callTool(id, params);
  if (method === 'ping') return reply(id, {});
  if (typeof method === 'string' && method.startsWith('notifications/')) return undefined;
  if (id !== undefined) fail(id, METHOD_NOT_FOUND, `unknown method: ${method}`);
  return undefined;
}

function handleLine(line) {
  const trimmed = line.trim();
  if (trimmed.length === 0) return;
  try {
    dispatch(JSON.parse(trimmed));
  } catch (error) {
    log(`parse error: ${error.message}`);
  }
}

function main() {
  log(`ready with ${manifest.tools.length} tools`);
  let buffer = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    let index = buffer.indexOf('\n');
    while (index !== -1) {
      handleLine(buffer.slice(0, index));
      buffer = buffer.slice(index + 1);
      index = buffer.indexOf('\n');
    }
  });
  process.stdin.on('end', () => process.exit(0));
}

main();
