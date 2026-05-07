import { useCallback } from 'react';
import { fetchTrendingMovies } from '../api/movies';
import { usePaginatedMovieQuery } from './usePaginatedMovieQuery';

export function useTrendingMovies() {
  const fetchPage = useCallback(
    (p: number, signal: AbortSignal) => fetchTrendingMovies(p, signal),
    [],
  );
  return usePaginatedMovieQuery('trending', fetchPage, true);
}
