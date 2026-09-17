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

const NAV_BUTTON_CLASS =
  'pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-zinc-200 backdrop-blur transition hover:border-white/40 hover:text-white disabled:opacity-0';

function formatTakenAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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
    <div
      role="dialog"
      aria-modal="true"
      className="fade-up fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">{entry.filename}</p>
          <p className="text-xs text-zinc-500">
            {formatTakenAt(entry.takenAt)} · {index + 1} of {entries.length}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => {
              void save();
            }}
            className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-900 transition hover:bg-white"
          >
            Download
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <img
          src={imageUrl(entry)}
          alt={entry.filename}
          className="h-full w-full object-contain px-2 pb-4"
        />
        <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
          <button
            type="button"
            onClick={() => onNavigate(index - 1)}
            disabled={index === 0}
            aria-label="Previous photo"
            className={NAV_BUTTON_CLASS}
          >
            ‹
          </button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <button
            type="button"
            onClick={() => onNavigate(index + 1)}
            disabled={index === entries.length - 1}
            aria-label="Next photo"
            className={NAV_BUTTON_CLASS}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
