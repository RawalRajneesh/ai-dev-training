export type MediaType = 'movie' | 'tv';

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MovieSummary {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  genre_ids?: number[];
}

export interface TvSummary {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date?: string;
  genre_ids?: number[];
}

export interface MovieDetail extends MovieSummary {
  runtime: number | null;
  genres: TmdbGenre[];
  tagline: string;
  status: string;
}

export interface TvDetail extends TvSummary {
  runtime: number | null;
  genres: TmdbGenre[];
  tagline: string;
  status: string;
  episode_run_time: number[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
}

export interface MultiSearchResult {
  id: number;
  media_type: MediaType;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
}

export type DetailPayload =
  | { mediaType: 'movie'; detail: MovieDetail }
  | { mediaType: 'tv'; detail: TvDetail };

export interface DetailBundle {
  detail: DetailPayload | null;
  credits: Credits | null;
  similarMovies: MovieSummary[];
  similarTv: TvSummary[];
}
