'use client';

import { formatDuration } from '@/lib/duration.service';
import { thumbUrl } from '@/lib/image-url.service';
import type { ImageEntry } from '@/lib/manifest.schema';
import { useSelection } from '@/stores/selection.service';

interface PhotoTileProps {
  readonly entry: ImageEntry;
  readonly onOpen: () => void;
}

export function PhotoTile({ entry, onOpen }: PhotoTileProps) {
  const selected = useSelection((state) => state.selected.has(entry.id));
  const toggle = useSelection((state) => state.toggle);
  return (
    <li className="group relative mb-3 break-inside-avoid sm:mb-4">
      <button
        type="button"
        onClick={onOpen}
        className={`block w-full overflow-hidden rounded-xl ring-offset-2 ring-offset-zinc-950 transition duration-200 ${selected ? 'ring-2 ring-zinc-100' : 'ring-0'}`}
      >
        <img
          src={thumbUrl(entry.id)}
          alt={entry.filename}
          width={entry.width}
          height={entry.height}
          loading="lazy"
          className={`h-auto w-full transition duration-300 group-hover:scale-[1.02] ${selected ? 'brightness-75' : 'group-hover:brightness-110'}`}
        />
      </button>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => toggle(entry.id)}
        aria-label={`Select ${entry.filename}`}
        className={`absolute left-3 top-3 h-5 w-5 cursor-pointer appearance-none rounded-md border transition checked:border-zinc-100 checked:bg-zinc-100 ${selected ? 'opacity-100' : 'border-white/60 bg-black/30 opacity-100 backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'}`}
      />
      {selected ? (
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3 h-5 w-5 p-1 text-zinc-900"
        >
          <path
            d="M4 10.5 8 14.5 16 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      {entry.type === 'video' ? (
        <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <svg viewBox="0 0 12 12" aria-hidden="true" className="h-2.5 w-2.5">
            <path d="M2.5 1.5 10.5 6 2.5 10.5Z" fill="currentColor" />
          </svg>
          {entry.durationSeconds ? formatDuration(entry.durationSeconds) : 'Video'}
        </span>
      ) : null}
    </li>
  );
}
