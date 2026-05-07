import { apiGet } from './client';
import type {
  Credits,
  MediaType,
  MovieDetail,
  MovieSummary,
  MultiSearchResult,
  PaginatedResponse,
  TmdbGenre,
  TvDetail,
  TvSummary,
} from './types';

export async function fetchMovieGenres(signal?: AbortSignal): Promise<{ genres: TmdbGenre[] }> {
  return apiGet<{ genres: TmdbGenre[] }>('/genre/movie/list', { signal });
}

export async function fetchTrendingMovies(
  page: number,
  signal?: AbortSignal,
): Promise<PaginatedResponse<MovieSummary>> {
  return apiGet<PaginatedResponse<MovieSummary>>('/trending/movie/week', {
    signal,
    params: { page },
  });
}

export async function fetchTopRatedMovies(
  page: number,
  signal?: AbortSignal,
): Promise<PaginatedResponse<MovieSummary>> {
  return apiGet<PaginatedResponse<MovieSummary>>('/movie/top_rated', {
    signal,
    params: { page },
  });
}

export async function fetchDiscoverByGenre(
  genreId: number,
  page: number,
  signal?: AbortSignal,
): Promise<PaginatedResponse<MovieSummary>> {
  return apiGet<PaginatedResponse<MovieSummary>>('/discover/movie', {
    signal,
    params: {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc',
    },
  });
}

export async function searchMulti(
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<PaginatedResponse<MultiSearchResult>> {
  return apiGet<PaginatedResponse<MultiSearchResult>>('/search/multi', {
    signal,
    params: { query, page },
  });
}

export async function fetchMovieDetail(
  id: number,
  signal?: AbortSignal,
): Promise<MovieDetail> {
  return apiGet<MovieDetail>(`/movie/${id}`, { signal });
}

export async function fetchMovieCredits(
  id: number,
  signal?: AbortSignal,
): Promise<Credits> {
  return apiGet<Credits>(`/movie/${id}/credits`, { signal });
}

export async function fetchSimilarMovies(
  id: number,
  signal?: AbortSignal,
): Promise<PaginatedResponse<MovieSummary>> {
  return apiGet<PaginatedResponse<MovieSummary>>(`/movie/${id}/similar`, {
    signal,
    params: { page: 1 },
  });
}

export async function fetchTvDetail(id: number, signal?: AbortSignal): Promise<TvDetail> {
  return apiGet<TvDetail>(`/tv/${id}`, { signal });
}

export async function fetchTvCredits(id: number, signal?: AbortSignal): Promise<Credits> {
  return apiGet<Credits>(`/tv/${id}/credits`, { signal });
}

export async function fetchSimilarTv(
  id: number,
  signal?: AbortSignal,
): Promise<PaginatedResponse<TvSummary>> {
  return apiGet<PaginatedResponse<TvSummary>>(`/tv/${id}/similar`, {
    signal,
    params: { page: 1 },
  });
}

export function pickPrimaryRuntime(
  mediaType: MediaType,
  movieRuntime: number | null | undefined,
  episodeRunTimes: number[] | undefined,
): number | null {
  if (mediaType === 'movie') {
    return movieRuntime ?? null;
  }
  const times = episodeRunTimes ?? [];
  if (times.length === 0) {
    return null;
  }
  return times[0] ?? null;
}
