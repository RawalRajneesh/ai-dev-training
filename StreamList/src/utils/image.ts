import { TMDB_IMAGE_BASE_URL } from '@env';

const TMDB_IMAGE_BASE_DEFAULT = 'https://image.tmdb.org/t/p';

const base =
  (TMDB_IMAGE_BASE_URL?.replace(/\/$/, '') ?? '').trim() || TMDB_IMAGE_BASE_DEFAULT;

export type PosterSize = 'w185' | 'w342' | 'w500' | 'w780' | 'original';

export function buildImageUrl(
  path: string | null | undefined,
  size: PosterSize,
): string | null {
  if (!path) {
    return null;
  }
  if (!base) {
    return null;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}/${size}${normalized}`;
}
