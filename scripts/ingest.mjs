import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { promisify } from 'node:util';
import exifr from 'exifr';
import sharp from 'sharp';

const ARGS_OFFSET = 2;
const EXIT_ERROR = 1;
const ID_HASH_LENGTH = 12;
const THUMB_WIDTH_PX = 400;
const JSON_INDENT = 2;
const ORIENTATION_SWAP_MIN = 5;
const USAGE =
  'usage: node scripts/ingest.mjs --source <dir> --repo <image-repo-dir> [--push] [--force]';

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
};

const run = promisify(execFile);

function parseArgs(argv) {
  const args = { source: '', repo: '', push: false, force: false };
  for (let index = ARGS_OFFSET; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source') {
      args.source = argv[index + 1] ?? '';
      index += 1;
    } else if (arg === '--repo') {
      args.repo = argv[index + 1] ?? '';
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
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

async function readTakenAt({ bytes, sourcePath }) {
  const exif = await exifr.parse(bytes).catch(() => null);
  if (exif?.DateTimeOriginal instanceof Date) {
    return exif.DateTimeOriginal.toISOString();
  }
  const stats = await stat(sourcePath);
  return stats.mtime.toISOString();
}

async function readDimensions(bytes) {
  const meta = await sharp(bytes).metadata();
  const swap = (meta.orientation ?? 0) >= ORIENTATION_SWAP_MIN;
  return {
    width: swap ? meta.height : meta.width,
    height: swap ? meta.width : meta.height,
  };
}

async function ingestFile({ sourcePath, repoDir }) {
  const bytes = await readFile(sourcePath);
  const ext = extname(sourcePath).toLowerCase();
  const id = createHash('sha256').update(bytes).digest('hex').slice(0, ID_HASH_LENGTH);
  const { width, height } = await readDimensions(bytes);
  await sharp(bytes)
    .rotate()
    .resize({ width: THUMB_WIDTH_PX })
    .webp()
    .toFile(join(repoDir, 'thumbs', `${id}.webp`));
  await copyFile(sourcePath, join(repoDir, 'images', `${id}${ext}`));
  return {
    id,
    filename: sourcePath.split('/').pop(),
    ext: ext.slice(1),
    contentType: CONTENT_TYPES[ext],
    width,
    height,
    bytes: bytes.length,
    takenAt: await readTakenAt({ bytes, sourcePath }),
  };
}

async function pushRepo(repoDir) {
  await run('git', ['add', '-A'], { cwd: repoDir });
  await run('git', ['commit', '-m', 'ingest images'], { cwd: repoDir });
  await run('git', ['push'], { cwd: repoDir });
}

async function collectSources(sourceDir) {
  const names = await readdir(sourceDir);
  return names
    .filter((name) => Object.hasOwn(CONTENT_TYPES, extname(name).toLowerCase()))
    .map((name) => join(sourceDir, name));
}

async function ingestNewSources({ args, manifest }) {
  const known = new Set(manifest.map((entry) => entry.id));
  const sources = await collectSources(args.source);
  let added = 0;
  for (const sourcePath of sources) {
    const bytes = await readFile(sourcePath);
    const id = createHash('sha256').update(bytes).digest('hex').slice(0, ID_HASH_LENGTH);
    if (known.has(id) && !args.force) {
      continue;
    }
    const entry = await ingestFile({ sourcePath, repoDir: args.repo });
    const withoutStale = manifest.filter((existing) => existing.id !== entry.id);
    manifest.length = 0;
    manifest.push(...withoutStale, entry);
    known.add(id);
    added += 1;
    console.log(`ingested ${entry.filename} as ${entry.id}`);
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
  if (!args.source || !args.repo) {
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
