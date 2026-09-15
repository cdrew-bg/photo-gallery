'use client';

import type { ZipProgress } from '@/features/gallery/interfaces/zip-progress.interface';

interface DownloadProgressProps {
  readonly progress: ZipProgress;
}

export function DownloadProgress({ progress }: DownloadProgressProps) {
  return (
    <span className="flex items-center gap-2 text-sm">
      <progress value={progress.done} max={progress.total} />
      {progress.done}/{progress.total}
      {progress.failed.length > 0 && (
        <span className="text-red-600">{progress.failed.length} failed</span>
      )}
    </span>
  );
}
