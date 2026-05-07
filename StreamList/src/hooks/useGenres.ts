import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMovieGenres } from '../api/movies';
import { isApiError, isRequestAborted } from '../api/client';
import type { TmdbGenre } from '../api/types';

export interface UseGenresResult {
  genres: TmdbGenre[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGenres(): UseGenresResult {
  const [genres, setGenres] = useState<TmdbGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMovieGenres(ac.signal);
      if (abortRef.current !== ac) {
        return;
      }
      setGenres(res.genres);
    } catch (e) {
      if (isRequestAborted(e)) {
        return;
      }
      setError(isApiError(e) ? e.message : 'Failed to load genres');
      setGenres([]);
    } finally {
      if (abortRef.current === ac) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load().catch(() => {});
    return () => abortRef.current?.abort();
  }, [load]);

  return { genres, loading, error, refetch: load };
}
