import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { promisify } from 'node:util';
import { ingestPhoto, ingestVideo, PHOTO_TYPES, VIDEO_TYPES } from './ingest-media.mjs';

const ARGS_OFFSET = 2;
const EXIT_ERROR = 1;
const ID_HASH_LENGTH = 12;
const JSON_INDENT = 2;
const USAGE =
  'usage: node scripts/ingest.mjs --source <dir> --repo <image-repo-dir> --album <name> [--push] [--force]';

const run = promisify(execFile);

function parseArgs(argv) {
  const args = { source: '', repo: '', album: '', push: false, force: false };
  for (let index = ARGS_OFFSET; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source') {
      args.source = argv[index + 1] ?? '';
      index += 1;
    } else if (arg === '--repo') {
      args.repo = argv[index + 1] ?? '';
      index += 1;
    } else if (arg === '--album') {
      args.album = argv[index + 1] ?? '';
      index += 1;
    } else if (arg === '--push') {
      args.push = true;
    } else if (arg === '--force') {
      args.force = true;
    }
  }
  return args;
}

function loadManifest(repoDir) {
  const manifestPath = join(repoDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    return [];
  }
  const entries = JSON.parse(readFileSync(manifestPath, 'utf8'));
  return entries.map((entry) => (entry.type ? entry : { ...entry, type: 'photo' }));
}

function isSupported(name) {
  const ext = extname(name).toLowerCase();
  return Object.hasOwn(PHOTO_TYPES, ext) || Object.hasOwn(VIDEO_TYPES, ext);
}

async function ingestFile({ sourcePath, repoDir, id }) {
  const ext = extname(sourcePath).toLowerCase();
  if (Object.hasOwn(VIDEO_TYPES, ext)) {
    return ingestVideo({ sourcePath, repoDir, id });
  }
  return ingestPhoto({ sourcePath, repoDir, id });
}

async function pushRepo(repoDir) {
  await run('git', ['add', '-A'], { cwd: repoDir });
  await run('git', ['commit', '-m', 'ingest media'], { cwd: repoDir });
  await run('git', ['push'], { cwd: repoDir });
}

async function ingestNewSources({ args, manifest }) {
  const known = new Set(manifest.map((entry) => entry.id));
  const names = await readdir(args.source);
  const sources = names.filter((name) => isSupported(name)).map((name) => join(args.source, name));
  let added = 0;
  for (const sourcePath of sources) {
    const bytes = await readFile(sourcePath);
    const id = createHash('sha256').update(bytes).digest('hex').slice(0, ID_HASH_LENGTH);
    if (known.has(id) && !args.force) {
      continue;
    }
    const entry = {
      ...(await ingestFile({ sourcePath, repoDir: args.repo, id })),
      album: args.album,
    };
    const withoutStale = manifest.filter((existing) => existing.id !== entry.id);
    manifest.length = 0;
    manifest.push(...withoutStale, entry);
    known.add(id);
    added += 1;
    console.log(`ingested ${entry.filename} as ${entry.id} (${entry.type})`);
  }
  return added;
}

async function writeManifest({ repoDir, manifest }) {
  manifest.sort((left, right) => right.takenAt.localeCompare(left.takenAt));
  await writeFile(
    join(repoDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, JSON_INDENT)}\n`,
  );
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.source || !args.repo || !args.album) {
    console.error(USAGE);
    process.exit(EXIT_ERROR);
  }
  await mkdir(join(args.repo, 'images'), { recursive: true });
  await mkdir(join(args.repo, 'thumbs'), { recursive: true });
  const manifest = loadManifest(args.repo);
  const added = await ingestNewSources({ args, manifest });
  await writeManifest({ repoDir: args.repo, manifest });
  console.log(`manifest now has ${manifest.length} entries (${added} new)`);
  if (args.push && added > 0) {
    await pushRepo(args.repo);
    console.log('pushed image repo');
  }
}

await main();
