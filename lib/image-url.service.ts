import { loadEnv } from '@/lib/env.service';
import type { ImageEntry } from '@/lib/manifest.schema';

export function thumbUrl(id: string): string {
  return `${loadEnv().NEXT_PUBLIC_IMAGE_REPO_BASE}/thumbs/${id}.webp`;
}

export function imageUrl(entry: ImageEntry): string {
  return `${loadEnv().NEXT_PUBLIC_IMAGE_REPO_BASE}/images/${entry.id}.${entry.ext}`;
}
