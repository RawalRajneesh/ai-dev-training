# Home Screen — Product Specification

This document defines the **Home Screen** for the StreamList React Native app: layout, visual system, data layer, navigation, and acceptance criteria. Implementation must follow project rules in `StreamList/.cursor/rules/streamlist.mdc` and the constraints below.

---

## 1. Architecture and code rules

| Rule | Detail |
|------|--------|
| Data fetching | **Only** via custom hooks. Screens **must not** use `useEffect` for loading or pagination. |
| API access | All HTTP goes through `StreamList/src/api/client.ts` (e.g. `apiGet`). Feature code does not call `fetch`/`axios` directly. |
| Colors | Use `StreamList/src/theme/colors.ts` only — no hardcoded hex/rgb in feature UI. |
| Spacing / radius | Use `StreamList/src/theme/spacing.ts` only — no magic layout numbers (exceptions: platform hairlines `0`/`1` where required). |
| Navigation typing | Use `StreamList/src/navigation/types.ts` (`HomeStackParamList`, etc.). |
| Styling | `StyleSheet.create` only; no Tailwind / NativeWind / third-party UI kits. |
| Genre selection | **Local React state on the screen only** — no Zustand (or other global store) for the active genre chip. |
| Separation | Do not mix heavy data logic inside presentational components; hooks own fetch/pagination state. |

---

## 2. Screen: `HomeScreen`

### 2.1 Vertical layout order (top → bottom)

1. **Header**
2. **Genre filter strip**
3. **Hero featured card**
4. **Content rows** (exactly three horizontal rows)
5. **Infinite scroll indicator** (global footer for “loading more” feedback)
6. **Bottom tab bar** (app-level, not duplicated inside the screen — configured in root tab navigator)

---

## 3. Header

| Element | Requirement |
|---------|-------------|
| Left | Flame icon + **StreamList** wordmark |
| Right | Notification bell icon (placeholder tap OK) |
| Background | **`surface`** when scroll offset is at rest (top). **Transparent** (or visually equivalent over content) while user has scrolled away from top. |

Implementation note: typically driven by `Animated` scroll position on the main vertical scroll container.

---

## 4. Genre filter strip

| Element | Requirement |
|---------|-------------|
| Control | Horizontal scroll; **`showsHorizontalScrollIndicator={false}`** |
| Chips (fixed set) | **All**, **Action**, **Drama**, **Comedy**, **Sci-Fi**, **Horror**, **Documentary** |
| Active chip | Background: `secondary_container`; text: `on_surface` |
| Inactive chip | Background: `surface_container_high`; text: `on_surface_variant` |
| Borders | None |
| Behavior | Selecting a chip updates the **genre row** only (discover-by-genre). State lives in **screen `useState`** — not global store. **All** = no genre filter for that row (empty state when no genre). |

TMDB genre IDs for the six named genres must be correct (discover uses `with_genres`).

---

## 5. Hero featured card

| Element | Requirement |
|---------|-------------|
| Width | ~**90%** of screen width (centered) |
| Corner radius | From **spacing** tokens (no raw `16`-style literals) |
| Imagery | Full-width **backdrop** image when available |
| Gradient | Overlay on **bottom 40%** of card, fading toward **`surface`** |

**Content:**

- **Badge:** Pill — “NEW RELEASE”; coral/red semantic from theme; **label-sm**, uppercase.
- **Title:** **`display-md`** (Manrope); may overlap bottom edge of image per design.
- **Synopsis:** **`body-md`**, color **`on_surface_variant`**, **max 2 lines** (`numberOfLines={2}`).
- **Primary CTA:** “Watch Now” — primary gradient + play affordance.
- **Secondary CTA:** “Details” — background **`surface_container_highest`**.

**Actions:** Both CTAs and consistent card behavior should navigate to movie detail with movie id (and correct `mediaType` for the stack).

**Hero source:** Featured item should be coherent with home content (e.g. lead title from **trending** row).

---

## 6. Content rows — reusable `HorizontalContentRow`

### 6.1 Row chrome

- **Title** (left) + **See All** (right, tappable).
- Horizontal list: **`showsHorizontalScrollIndicator={false}`**.
- Cards use existing card patterns (`ContentCard` or equivalent) and theme.

### 6.2 Row mapping

| # | Title (example) | API (TMDB v3) |
|---|-----------------|---------------|
| 1 | Trending Now | `/trending/movie/week` |
| 2 | Top Rated | `/movie/top_rated` |
| 3 | Genre row | `/discover/movie?with_genres={id}` (plus sort consistent with product, e.g. popularity) |

### 6.3 Pagination (per row)

- Each row maintains **independent** page state and `hasMore`.
- Load the **next page** when the user’s horizontal scroll brings them **within the last 3 items** of the current list (not only `onEndReached` with a loose threshold).
- **First load:** skeleton placeholders for cards.
- **Subsequent loads:** loading footer (e.g. skeleton or spinner) at the end of the horizontal list while the next page is in flight.

---

## 7. Infinite scroll indicator

Placed **after** the last content row in the main vertical scroll (still inside the scroll area above the tab bar safe zone).

| Element | Requirement |
|---------|-------------|
| Copy | **LOADING MORE CONTENT** — uppercase |
| Typography | **`label-sm`**, color **`on_surface_variant`** |
| Graphic | Spinner (`ActivityIndicator` or equivalent) |

**Visibility:** Shown when **any** of the three row hooks is performing a **pagination** load (`loadingMore` / equivalent), or as specified by implementation ticket — minimum: user-visible feedback whenever a row is appending pages.

---

## 8. Bottom tab bar (app-level)

Tabs: **Home** (active on this screen), **Search**, **Watchlist**, **Profile**.

| State | Style |
|-------|--------|
| Active tab icon | **`primary_container`** |
| Inactive tab icon | **`on_surface_variant`** |
| Bar background | **Glassmorphism** (e.g. blur + translucent fallback per platform), consistent with design system |

Tab navigator lives in root navigation — **do not** re-implement a second tab bar inside `HomeScreen`.

---

## 9. Data layer — hooks only

Create and use dedicated hooks (screens compose them; **no** inline API calls in UI):

| Hook | Responsibility |
|------|----------------|
| `useTrendingMovies()` | Trending week list + pagination + loading/error |
| `useTopRatedMovies()` | Top rated list + pagination + loading/error |
| `useMoviesByGenre(genreId)` | Discover by genre; **no fetch** when `genreId` is “all” / null; reset page when `genreId` changes |
| `useGenres()` | Genre list from API if needed for validation or labels (must still go through `client` / `movies` layer) |

**Rules:**

- Hooks call **API module** functions only (`src/api/movies.ts` or thin additions there), which use **`apiGet`** / `client`.
- Use **abort** or equivalent patterns for in-flight requests on unmount/refetch where applicable.

---

## 10. Interactions and navigation

| Action | Result |
|--------|--------|
| Tap row **card** | Navigate to **Detail** with **movie id** (and stack-expected params). |
| Tap hero **Details** | Same as above. |
| Tap hero **Watch Now** | Same detail route (or play placeholder if product later changes — default: detail). |
| Tap row **See All** | Navigate to a **simple full-screen list** for that row’s source (trending / top rated / genre discover), with infinite scroll and tap → detail. |
| Change genre chip | **Reset** genre row (clear + page 1) and **fetch** discover for the new genre; **All** shows **empty state** for genre row. |

All routes must be reflected in **`HomeStackParamList`** (or appropriate stack) in `src/navigation/types.ts`.

---

## 11. Edge cases

| Case | Expected UI |
|------|-------------|
| Genre row — **All** / no id | **Empty state** (illustration or message + optional CTA), not a broken list |
| Initial load | Skeletons for **hero** and **rows** as applicable |
| Errors | Simple **fallback** UI (message + retry) without crashing |
| Missing images | Placeholder consistent with existing `ContentCard` / hero fallbacks |

---

## 12. Explicit non-goals (“Do not”)

- No **inline** TMDB/API calls from screens or random components.
- No **hardcoded** theme colors or spacing in feature code.
- No **global state** for genre chip selection.
- No **mixing** concerns: avoid embedding fetch/pagination logic inside dumb UI beyond passing callbacks from hooks.

---

## 13. Expected implementation artifacts (reference)

| Area | Files (indicative) |
|------|-------------------|
| Screen | `src/screens/HomeScreen.tsx` |
| Components | `src/components/home/` — e.g. header, hero, genre strip, `HorizontalContentRow` |
| Hooks | `src/hooks/useTrendingMovies.ts`, `useTopRatedMovies.ts`, `useMoviesByGenre.ts`, `useGenres.ts` |
| API | `src/api/movies.ts` (extend only if an endpoint is missing) |
| List / See All | e.g. `src/screens/MovieListScreen.tsx` + stack registration |
| Theme | `src/theme/colors.ts`, `src/theme/spacing.ts`, `src/theme/typography.ts` (tokens such as `displayMd`, `labelSm`) |

---

## 14. Acceptance criteria (minimum)

1. **Three rows** load from the correct endpoints and each supports **independent pagination** with skeletons on first load and a **loading footer** while appending.
2. **Genre strip** updates the **genre row** correctly; **All** shows an **empty state**; selection is **local state only** (no Zustand).
3. **Navigation** works: card / hero CTAs → **Detail** with id; **See All** → dedicated list screen → **Detail**.
4. **Header** background transitions between **surface at rest** and **transparent while scrolling**.
5. **Hero** matches width, gradient zone, typography tokens, badge, two-line synopsis, and both CTAs.
6. **Infinite scroll indicator** appears per §7 when rows are loading more content.
7. **Tab bar** uses **primary_container** / **on_surface_variant** for active/inactive icons and keeps **glass** treatment.
8. **No rule violations** in §1 and §12; **TypeScript strict** clean; **lint** passes.

---

## 15. Verification checklist (QA / PR)

- [ ] No `useEffect` in `HomeScreen` for data loads.
- [ ] No new `axios` imports outside `src/api/client.ts`.
- [ ] Grep: no `#` hex / `rgb(` in new home components (except theme file).
- [ ] Pagination triggers near **end minus 3 items** for each horizontal row.
- [ ] Pull-to-refresh (if present) does not break hook abort / duplicate pages.
- [ ] Works with valid `.env` TMDB token; graceful error if token missing (existing client behavior).

---

*Document version: 1.0 — aligns with StreamList React Native app structure under `StreamList/`.*
