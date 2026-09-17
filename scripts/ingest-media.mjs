import { execFile } from 'node:child_process';
import { copyFile, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { promisify } from 'node:util';
import exifr from 'exifr';
import sharp from 'sharp';

const THUMB_WIDTH_PX = 400;
const ORIENTATION_SWAP_MIN = 5;

export const PHOTO_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
};

export const VIDEO_TYPES = {
  '.mov': 'video/mp4',
  '.mp4': 'video/mp4',
};

const run = promisify(execFile);

async function fileTakenAt(sourcePath) {
  const stats = await stat(sourcePath);
  return stats.mtime.toISOString();
}

async function exifTakenAt({ bytes, sourcePath }) {
  const exif = await exifr.parse(bytes).catch(() => null);
  if (exif?.DateTimeOriginal instanceof Date) {
    return exif.DateTimeOriginal.toISOString();
  }
  return fileTakenAt(sourcePath);
}

async function probeVideo(sourcePath) {
  const { stdout } = await run('ffprobe', [
    '-v',
    'quiet',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    sourcePath,
  ]);
  return JSON.parse(stdout);
}

function videoTakenAt({ probe, fallback }) {
  const creationTime = probe.format?.tags?.creation_time;
  if (!creationTime) {
    return fallback;
  }
  const parsed = new Date(creationTime);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

async function writeThumbFromFrame({ framePath, repoDir, id }) {
  const frame = sharp(framePath);
  const meta = await frame.metadata();
  await frame
    .resize({ width: THUMB_WIDTH_PX })
    .webp()
    .toFile(join(repoDir, 'thumbs', `${id}.webp`));
  return { width: meta.width, height: meta.height };
}

export async function ingestPhoto({ sourcePath, repoDir, id }) {
  const bytes = await readFile(sourcePath);
  const ext = extname(sourcePath).toLowerCase();
  const meta = await sharp(bytes).metadata();
  const swap = (meta.orientation ?? 0) >= ORIENTATION_SWAP_MIN;
  await sharp(bytes)
    .rotate()
    .resize({ width: THUMB_WIDTH_PX })
    .webp()
    .toFile(join(repoDir, 'thumbs', `${id}.webp`));
  await copyFile(sourcePath, join(repoDir, 'images', `${id}${ext}`));
  return {
    id,
    type: 'photo',
    filename: sourcePath.split('/').pop(),
    ext: ext.slice(1),
    contentType: PHOTO_TYPES[ext],
    width: swap ? meta.height : meta.width,
    height: swap ? meta.width : meta.height,
    bytes: bytes.length,
    takenAt: await exifTakenAt({ bytes, sourcePath }),
  };
}

export async function ingestVideo({ sourcePath, repoDir, id }) {
  const probe = await probeVideo(sourcePath);
  const outPath = join(repoDir, 'images', `${id}.mp4`);
  await run('ffmpeg', ['-y', '-i', sourcePath, '-c', 'copy', '-movflags', '+faststart', outPath]);
  const framePath = join(tmpdir(), `ingest-frame-${id}.png`);
  await run('ffmpeg', ['-y', '-i', sourcePath, '-frames:v', '1', framePath]);
  const { width, height } = await writeThumbFromFrame({ framePath, repoDir, id });
  await rm(framePath, { force: true });
  const outStat = await stat(outPath);
  return {
    id,
    type: 'video',
    filename: sourcePath.split('/').pop(),
    ext: 'mp4',
    contentType: 'video/mp4',
    width,
    height,
    bytes: outStat.size,
    durationSeconds: Math.round(Number(probe.format?.duration ?? 0)) || 1,
    takenAt: videoTakenAt({ probe, fallback: await fileTakenAt(sourcePath) }),
  };
}
