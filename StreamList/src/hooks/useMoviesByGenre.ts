import { useCallback } from 'react';
import { fetchDiscoverByGenre } from '../api/movies';
import type { MovieSummary, PaginatedResponse } from '../api/types';
import { usePaginatedMovieQuery } from './usePaginatedMovieQuery';

export function useMoviesByGenre(genreId: number | null) {
  const fetchPage = useCallback(
    async (p: number, signal: AbortSignal): Promise<PaginatedResponse<MovieSummary>> => {
      if (genreId === null) {
        return { results: [], page: 1, total_pages: 1, total_results: 0 };
      }
      return fetchDiscoverByGenre(genreId, p, signal);
    },
    [genreId],
  );
  return usePaginatedMovieQuery(`genre-${genreId ?? 'none'}`, fetchPage, genreId !== null);
}
