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
  const allSelected = chosen.length === entries.length && entries.length > 0;
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
    <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <div className="mr-auto">
          <h2 className="text-base font-semibold tracking-tight text-zinc-50">Photo Gallery</h2>
          <p className="text-xs text-zinc-500">
            {entries.length} photos
            {chosen.length > 0 ? ` · ${chosen.length} selected` : ''}
          </p>
        </div>
        {progress ? (
          <DownloadProgress progress={progress} />
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (allSelected ? clear() : selectAll(entries.map((entry) => entry.id)))}
              className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
            >
              {allSelected ? 'Clear all' : 'Select all'}
            </button>
            {chosen.length > 0 ? (
              <button
                type="button"
                onClick={clear}
                className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                void startZip();
              }}
              disabled={chosen.length === 0}
              className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Download{chosen.length > 0 ? ` ${chosen.length}` : ''} as zip
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
