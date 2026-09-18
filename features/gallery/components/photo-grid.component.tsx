'use client';

import { useState } from 'react';
import { Lightbox } from './lightbox.component';
import { PhotoTile } from './photo-tile.component';
import { SelectionToolbar } from './selection-toolbar.component';
import { useManifest } from '@/features/gallery/api/use-manifest.hook';
import { useUnlockedAlbums } from '@/features/gate/api/use-unlocked-albums.hook';

export function PhotoGrid() {
  const query = useManifest();
  const unlockedAlbums = useUnlockedAlbums();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (query.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-sm tracking-wide text-zinc-500">Loading gallery…</p>
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p role="alert" className="text-sm text-zinc-400">
          Gallery unavailable — check your connection and refresh.
        </p>
      </div>
    );
  }
  const entries = query.data.filter((entry) => {
    if (unlockedAlbums.has('family')) return true;
    const { album } = entry;
    return album === undefined || unlockedAlbums.has(album);
  });
  return (
    <div className="min-h-screen">
      <SelectionToolbar entries={entries} />
      <ul className="fade-up mx-auto max-w-7xl columns-2 gap-3 px-3 pb-16 pt-4 sm:columns-3 sm:gap-4 sm:px-4 lg:columns-4">
        {entries.map((entry, index) => (
          <PhotoTile key={entry.id} entry={entry} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>
      {openIndex !== null && (
        <Lightbox
          entries={entries}
          index={openIndex}
          onNavigate={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
