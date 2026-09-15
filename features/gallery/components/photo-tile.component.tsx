'use client';

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
    <li className="relative">
      <button type="button" onClick={onOpen} className="block w-full">
        <img
          src={thumbUrl(entry.id)}
          alt={entry.filename}
          width={entry.width}
          height={entry.height}
          loading="lazy"
          className="h-auto w-full rounded object-cover"
        />
      </button>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => toggle(entry.id)}
        aria-label={`Select ${entry.filename}`}
        className="absolute left-2 top-2 h-5 w-5"
      />
    </li>
  );
}
