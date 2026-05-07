import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isApiError } from '../api/client';
import { searchMulti } from '../api/movies';
import type { MultiSearchResult } from '../api/types';

const RECENT_KEY = 'streamlist_recent_searches_v1';
const DEBOUNCE_MS = 400;
const MAX_RECENT = 10;

export interface SearchData {
  results: MultiSearchResult[];
  page: number;
  totalPages: number;
  query: string;
  recentSearches: string[];
}

export interface UseSearchResult {
  data: SearchData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchText: string;
  setSearchText: (q: string) => void;
  loadMore: () => Promise<void>;
  clearRecent: () => Promise<void>;
  pushRecent: (term: string) => Promise<void>;
}

async function readRecent(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

async function writeRecent(list: string[]): Promise<void> {
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

export function useSearch(): UseSearchResult {
  const [searchText, setSearchText] = useState('');
  const [debounced, setDebounced] = useState('');
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchText.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchText]);

  const runQuery = useCallback(async (query: string, page: number, append: boolean) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const rid = ++requestIdRef.current;
    if (!query) {
      const recent = await readRecent();
      setData({
        results: [],
        page: 1,
        totalPages: 1,
        query: '',
        recentSearches: recent,
      });
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await searchMulti(query, page, ac.signal);
      if (rid !== requestIdRef.current) {
        return;
      }
      const filtered: MultiSearchResult[] = res.results.filter(
        r => r.media_type === 'movie' || r.media_type === 'tv',
      );
      const recent = await readRecent();
      setData(prev => ({
        results: append ? [...(prev?.results ?? []), ...filtered] : filtered,
        page: res.page,
        totalPages: res.total_pages,
        query,
        recentSearches: recent,
      }));
    } catch (e) {
      if (axios.isCancel(e)) {
        return;
      }
      if (rid !== requestIdRef.current) {
        return;
      }
      setError(isApiError(e) ? e.message : 'Search failed');
    } finally {
      if (rid === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void runQuery(debounced, 1, false);
  }, [debounced, runQuery]);

  const refetch = useCallback(async () => {
    await runQuery(debounced, 1, false);
  }, [debounced, runQuery]);

  const loadMore = useCallback(async () => {
    const q = data?.query ?? '';
    if (!q || !data || data.page >= data.totalPages) {
      return;
    }
    await runQuery(q, data.page + 1, true);
  }, [data, runQuery]);

  const clearRecent = useCallback(async () => {
    await AsyncStorage.removeItem(RECENT_KEY);
    setData(prev =>
      prev
        ? {
            ...prev,
            recentSearches: [],
          }
        : prev,
    );
  }, []);

  const pushRecent = useCallback(async (term: string) => {
    const t = term.trim();
    if (!t) {
      return;
    }
    const prev = await readRecent();
    const next = [t, ...prev.filter(x => x.toLowerCase() !== t.toLowerCase())];
    await writeRecent(next);
    setData(cur =>
      cur
        ? {
            ...cur,
            recentSearches: next,
          }
        : cur,
    );
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    loadMore,
    clearRecent,
    pushRecent,
  };
}
