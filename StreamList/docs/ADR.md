# Architectural Decision Record — StreamList

## 1. Folder layout (`src/`)

**Decision:** Organize code by technical layer (`api`, `hooks`, `screens`, `components`, `navigation`, `store`, `theme`, `utils`) with `components/common` for shared UI and per-feature folders under `components/` where it improves clarity.

**Why:** Matches the training spec, keeps API access and TMDB typing centralized, and makes navigation and screen boundaries obvious for review and testing.

## 2. API access via Axios and hooks

**Decision:** All HTTP calls go through `src/api/client.ts` (`apiGet` + bearer token). Screens never call Axios directly; each primary surface uses dedicated hooks (home: `useTrendingMovies`, `useTopRatedMovies`, `useMoviesByGenre`, `useGenres`; search: `useSearch`; detail: `useMovieDetail`) returning list state, `loading`, `error`, and `refetch` / `loadMore` as appropriate.

**Why:** Single place for auth headers and error normalization; easier to mock in tests and to enforce “no inline fetch” rules.

## 3. Watchlist persistence and hydration

**Decision:** Zustand `persist` middleware with AsyncStorage; store exposes `hydrated` flipped in `onRehydrateStorage` so the Watchlist UI can wait before treating the list as authoritative.

**Why:** Avoids flashing an empty list before persisted items load, while keeping client-only state simple without a remote backend.

## 4. Navigation structure

**Decision:** Bottom tabs (Home, Search, Watchlist, Profile) with a nested native stack per tab that needs detail; `Detail` is pushed on the active tab’s stack. Watchlist count drives the tab badge.

**Why:** Matches the prescribed UX pattern and keeps back-stack behavior familiar on iOS and Android.

## 5. Styling and theming

**Decision:** `StyleSheet.create` only; colors and spacing come from `src/theme/*`; no 1px solid borders—separation via tonal surfaces and spacing.

**Why:** Aligns with “The Cinematic Curator” constraints and keeps visual tokens auditable.
