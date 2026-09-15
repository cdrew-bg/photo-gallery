'use client';

import { useState } from 'react';
import { Lightbox } from './lightbox.component';
import { PhotoTile } from './photo-tile.component';
import { SelectionToolbar } from './selection-toolbar.component';
import { useManifest } from '@/features/gallery/api/use-manifest.hook';

export function PhotoGrid() {
  const query = useManifest();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (query.isPending) {
    return <p className="p-4">Loading gallery…</p>;
  }
  if (query.isError) {
    return (
      <p role="alert" className="p-4">
        Gallery unavailable
      </p>
    );
  }
  const entries = query.data;
  return (
    <div>
      <SelectionToolbar entries={entries} />
      <ul className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
