import { useCallback } from 'react';
import { fetchTopRatedMovies } from '../api/movies';
import { usePaginatedMovieQuery } from './usePaginatedMovieQuery';

export function useTopRatedMovies() {
  const fetchPage = useCallback(
    (p: number, signal: AbortSignal) => fetchTopRatedMovies(p, signal),
    [],
  );
  return usePaginatedMovieQuery('topRated', fetchPage, true);
}
