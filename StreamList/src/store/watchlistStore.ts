import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MediaType } from '../api/types';

export interface WatchlistItem {
  key: string;
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  addedAt: number;
}

interface WatchlistState {
  hydrated: boolean;
  items: WatchlistItem[];
  setHydrated: (value: boolean) => void;
  addItem: (item: Omit<WatchlistItem, 'key' | 'addedAt'> & { key?: string }) => void;
  removeItem: (key: string) => void;
  isSaved: (mediaType: MediaType, tmdbId: number) => boolean;
}

function makeKey(mediaType: MediaType, tmdbId: number): string {
  return `${mediaType}:${tmdbId}`;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      items: [],
      setHydrated: value => set({ hydrated: value }),
      addItem: entry => {
        const key = entry.key ?? makeKey(entry.mediaType, entry.tmdbId);
        const exists = get().items.some(i => i.key === key);
        if (exists) {
          return;
        }
        const row: WatchlistItem = {
          key,
          mediaType: entry.mediaType,
          tmdbId: entry.tmdbId,
          title: entry.title,
          posterPath: entry.posterPath,
          addedAt: Date.now(),
        };
        set(state => ({ items: [row, ...state.items] }));
      },
      removeItem: key =>
        set(state => ({
          items: state.items.filter(i => i.key !== key),
        })),
      isSaved: (mediaType, tmdbId) =>
        get().items.some(i => i.mediaType === mediaType && i.tmdbId === tmdbId),
    }),
    {
      name: 'streamlist-watchlist',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ items: state.items }),
      onRehydrateStorage: () => {
        return () => {
          useWatchlistStore.getState().setHydrated(true);
        };
      },
    },
  ),
);
