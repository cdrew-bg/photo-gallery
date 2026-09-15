'use client';

import { useEffect } from 'react';
import { downloadImage } from '@/features/gallery/api/download-image.service';
import { imageUrl } from '@/lib/image-url.service';
import type { ImageEntry } from '@/lib/manifest.schema';
import { useNotifications } from '@/stores/notifications.service';

interface LightboxProps {
  readonly entries: readonly ImageEntry[];
  readonly index: number;
  readonly onNavigate: (index: number) => void;
  readonly onClose: () => void;
}

export function Lightbox({ entries, index, onNavigate, onClose }: LightboxProps) {
  const addNotification = useNotifications((state) => state.addNotification);
  const entry = entries[index];
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        onNavigate(index - 1);
      }
      if (event.key === 'ArrowRight' && index < entries.length - 1) {
        onNavigate(index + 1);
      }
    }
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [index, entries.length, onClose, onNavigate]);
  if (!entry) {
    return null;
  }
  const save = () =>
    downloadImage({ entry }).catch(() =>
      addNotification({ type: 'error', title: 'Download failed' }),
    );
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between gap-2 p-3 text-white">
        <span className="truncate text-sm">{entry.filename}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              void save();
            }}
            className="rounded border border-white/40 px-3 py-1"
          >
            Download
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/40 px-3 py-1"
          >
            Close
          </button>
        </div>
      </div>
      <img
        src={imageUrl(entry)}
        alt={entry.filename}
        className="min-h-0 flex-1 object-contain px-2 pb-2"
      />
      <div className="flex justify-between p-3 text-white">
        <button
          type="button"
          onClick={() => onNavigate(index - 1)}
          disabled={index === 0}
          className="rounded border border-white/40 px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onNavigate(index + 1)}
          disabled={index === entries.length - 1}
          className="rounded border border-white/40 px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
