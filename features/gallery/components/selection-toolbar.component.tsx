'use client';

import { useState } from 'react';
import { DownloadProgress } from './download-progress.component';
import { downloadZip } from '@/features/gallery/api/zip-download.service';
import type { ZipProgress } from '@/features/gallery/interfaces/zip-progress.interface';
import type { ImageEntry } from '@/lib/manifest.schema';
import { useNotifications } from '@/stores/notifications.service';
import { useSelection } from '@/stores/selection.service';

interface SelectionToolbarProps {
  readonly entries: readonly ImageEntry[];
}

export function SelectionToolbar({ entries }: SelectionToolbarProps) {
  const selected = useSelection((state) => state.selected);
  const selectAll = useSelection((state) => state.selectAll);
  const clear = useSelection((state) => state.clear);
  const addNotification = useNotifications((state) => state.addNotification);
  const [progress, setProgress] = useState<ZipProgress | null>(null);
  const chosen = entries.filter((entry) => selected.has(entry.id));
  async function startZip() {
    setProgress({ done: 0, total: chosen.length, failed: [] });
    try {
      const result = await downloadZip({ entries: chosen, onProgress: setProgress });
      if (result.failed.length > 0) {
        addNotification({ type: 'warning', title: 'Some images failed to download' });
      }
    } catch {
      addNotification({ type: 'error', title: 'Zip download failed' });
    }
    setProgress(null);
  }
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-white/95 p-3">
      <span className="text-sm">{selected.size} selected</span>
      <button
        type="button"
        onClick={() => selectAll(entries.map((entry) => entry.id))}
        className="rounded border px-3 py-1 text-sm"
      >
        Select all
      </button>
      <button
        type="button"
        onClick={clear}
        disabled={selected.size === 0}
        className="rounded border px-3 py-1 text-sm disabled:opacity-40"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={() => {
          void startZip();
        }}
        disabled={chosen.length === 0 || progress !== null}
        className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-40"
      >
        Download {chosen.length > 0 ? chosen.length : ''} as zip
      </button>
      {progress ? <DownloadProgress progress={progress} /> : null}
    </div>
  );
}
