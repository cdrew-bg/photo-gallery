import { create } from 'zustand';

export const useSelection = create<{
  readonly selected: ReadonlySet<string>;
  readonly toggle: (id: string) => void;
  readonly selectAll: (ids: readonly string[]) => void;
  readonly clear: () => void;
}>((set) => ({
  selected: new Set<string>(),
  toggle: (id) =>
    set((state) => {
      const next = new Set(state.selected);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selected: next };
    }),
  selectAll: (ids) => set(() => ({ selected: new Set(ids) })),
  clear: () => set(() => ({ selected: new Set<string>() })),
}));
