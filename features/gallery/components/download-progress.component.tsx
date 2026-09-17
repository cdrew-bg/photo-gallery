'use client';

import type { ZipProgress } from '@/features/gallery/interfaces/zip-progress.interface';

interface DownloadProgressProps {
  readonly progress: ZipProgress;
}

export function DownloadProgress({ progress }: DownloadProgressProps) {
  return (
    <div className="flex min-w-48 items-center gap-3">
      <progress value={progress.done} max={progress.total} className="flex-1" />
      <span className="text-xs tabular-nums text-zinc-400">
        {progress.done}/{progress.total}
      </span>
      {progress.failed.length > 0 ? (
        <span className="text-xs text-red-400">{progress.failed.length} failed</span>
      ) : null}
    </div>
  );
}
