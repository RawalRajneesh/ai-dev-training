import { useCallback, useEffect, useRef, useState } from 'react';
import { isApiError, isRequestAborted } from '../api/client';
import type { MovieSummary, PaginatedResponse } from '../api/types';

export interface UsePaginatedMovieQueryResult {
  items: MovieSummary[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePaginatedMovieQuery(
  resetKey: string,
  fetchPage: (page: number, signal: AbortSignal) => Promise<PaginatedResponse<MovieSummary>>,
  enabled: boolean,
): UsePaginatedMovieQueryResult {
  const [items, setItems] = useState<MovieSummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortInitialRef = useRef<AbortController | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const snapshotRef = useRef({ page: 0, hasMore: true, loadingMore: false, loading: true });
  snapshotRef.current = { page, hasMore, loadingMore, loading };

  const runInitial = useCallback(async () => {
    abortInitialRef.current?.abort();
    const ac = new AbortController();
    abortInitialRef.current = ac;
    setLoading(true);
    setError(null);
    setLoadingMore(false);
    if (!enabledRef.current) {
      setItems([]);
      setPage(0);
      setHasMore(false);
      setLoading(false);
      return;
    }
    try {
      const res = await fetchPage(1, ac.signal);
      if (abortInitialRef.current !== ac) {
        return;
      }
      setItems(res.results);
      setPage(1);
      setHasMore(res.page < res.total_pages);
    } catch (e) {
      if (isRequestAborted(e)) {
        return;
      }
      setError(isApiError(e) ? e.message : 'Failed to load');
      setItems([]);
      setPage(0);
      setHasMore(false);
    } finally {
      if (abortInitialRef.current === ac) {
        setLoading(false);
      }
    }
  }, [fetchPage]);

  useEffect(() => {
    runInitial().catch(() => {});
    return () => abortInitialRef.current?.abort();
  }, [resetKey, runInitial]);

  const loadMore = useCallback(async (): Promise<void> => {
    const s = snapshotRef.current;
    if (!enabledRef.current || !s.hasMore || s.loadingMore || s.loading) {
      return;
    }
    const nextPage = s.page + 1;
    setLoadingMore(true);
    try {
      const ac = new AbortController();
      const res = await fetchPage(nextPage, ac.signal);
      setItems(prev => [...prev, ...res.results]);
      setPage(nextPage);
      setHasMore(res.page < res.total_pages);
    } catch (e) {
      if (!isRequestAborted(e) && isApiError(e)) {
        setError(e.message);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage]);

  const refetch = useCallback(async () => {
    await runInitial();
  }, [runInitial]);

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}
