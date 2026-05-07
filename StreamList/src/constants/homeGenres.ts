/** Fixed home filter chips — TMDB movie genre ids (v3). */
export interface HomeGenreChip {
  readonly id: number | null;
  readonly label: string;
}

export const HOME_GENRE_CHIPS: readonly HomeGenreChip[] = [
  { id: null, label: 'All' },
  { id: 28, label: 'Action' },
  { id: 18, label: 'Drama' },
  { id: 35, label: 'Comedy' },
  { id: 878, label: 'Sci-Fi' },
  { id: 27, label: 'Horror' },
  { id: 99, label: 'Documentary' },
] as const;
