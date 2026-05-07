import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isApiError } from '../api/client';
import {
  fetchMovieCredits,
  fetchMovieDetail,
  fetchSimilarMovies,
  fetchSimilarTv,
  fetchTvCredits,
  fetchTvDetail,
} from '../api/movies';
import type { DetailBundle, MediaType } from '../api/types';

export interface UseMovieDetailArgs {
  mediaType: MediaType;
  id: number;
}

export interface UseMovieDetailResult {
  data: DetailBundle | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMovieDetail({ mediaType, id }: UseMovieDetailArgs): UseMovieDetailResult {
  const [data, setData] = useState<DetailBundle | null>(null);
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
      if (mediaType === 'movie') {
        const outcomes = await Promise.allSettled([
          fetchMovieDetail(id, ac.signal),
          fetchMovieCredits(id, ac.signal),
          fetchSimilarMovies(id, ac.signal),
        ]);
        const detail =
          outcomes[0].status === 'fulfilled'
            ? ({ mediaType: 'movie' as const, detail: outcomes[0].value })
            : null;
        const credits =
          outcomes[1].status === 'fulfilled' ? outcomes[1].value : null;
        const similar =
          outcomes[2].status === 'fulfilled' ? outcomes[2].value.results : [];
        setData({
          detail,
          credits,
          similarMovies: similar,
          similarTv: [],
        });
        if (outcomes[0].status === 'rejected') {
          const reason = outcomes[0].reason;
          setError(isApiError(reason) ? reason.message : 'Failed to load title');
        }
      } else {
        const outcomes = await Promise.allSettled([
          fetchTvDetail(id, ac.signal),
          fetchTvCredits(id, ac.signal),
          fetchSimilarTv(id, ac.signal),
        ]);
        const detail =
          outcomes[0].status === 'fulfilled'
            ? ({ mediaType: 'tv' as const, detail: outcomes[0].value })
            : null;
        const credits =
          outcomes[1].status === 'fulfilled' ? outcomes[1].value : null;
        const similar =
          outcomes[2].status === 'fulfilled' ? outcomes[2].value.results : [];
        setData({
          detail,
          credits,
          similarMovies: [],
          similarTv: similar,
        });
        if (outcomes[0].status === 'rejected') {
          const reason = outcomes[0].reason;
          setError(isApiError(reason) ? reason.message : 'Failed to load title');
        }
      }
    } catch (e) {
      if (axios.isCancel(e)) {
        return;
      }
      setError(isApiError(e) ? e.message : 'Failed to load title');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id, mediaType]);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { data, loading, error, refetch: load };
}
