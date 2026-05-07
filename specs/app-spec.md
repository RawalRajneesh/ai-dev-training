# StreamList — Detailed Agent Implementation Plan

This document serves as an exhaustive, agent-ready implementation plan for building the StreamList application. It prescribes the architecture, design system rules, state management, and step-by-step task breakdown. This plan must be followed strictly to ensure the app meets all architectural and visual requirements.

## Core Technical Stack
The following technologies must be used without deviation:
- **Framework**: React Native CLI (Not Expo) initialized with TypeScript template.
- **Language**: TypeScript (`"strict": true`). No `any` types permitted.
- **Navigation**: React Navigation v6 (Bottom Tab Navigator + nested Stacks).
- **State Management**: Zustand (with AsyncStorage for persistence).
- **API Client**: Axios with a centralized client configuration.
- **Styling**: Vanilla `StyleSheet.create()` only. Do not use Tailwind, NativeWind, styled-components, or any pre-built UI component libraries.

## Design System Rules: "The Cinematic Curator"
All UI implementation must adhere to the following design constraints:
- **The "No-Line" Rule**: The use of 1px solid borders is strictly prohibited. Section boundaries and container edges must be defined exclusively through background color shifts and spacing.
- **Color Palette (Absolute Dark)**:
  - Do not use pure black (`#000000`) or pure white (`#FFFFFF`).
  - Use deep charcoals/bordeaux-tinted grays. Example surfaces: `surface` (`#131313`), `surface_container_low` (`#1C1B1B`), `surface_container_highest` (`#353534`).
  - Primary accent: Coral-Red gradient (`#FFB3AE` to `#FF5351`).
  - Text: Primary information uses `on_surface` (`#E5E2E1`), secondary metadata uses `on_surface_variant` (`#E4BDBA`).
- **Typography**: Use **Manrope** for Display/Headlines (with -0.02em letter spacing for display text) and **Inter** for Body/Labels.
- **Elevations**: Use tonal layering (e.g., nesting a `surface_container_lowest` card inside a `surface_container_high` section) to create depth instead of drop shadows. If boundaries are absolutely necessary for accessibility, use a "ghost border" (`outline_variant` at 15% opacity).
- **Glassmorphism**: Use a blur effect with `rgba(35, 35, 35, 0.70)` for floating elements like the Bottom Tab Bar.

## Screen Design Sourcing
The precise visual layouts and assets for the screens (Home, Search, Detail, Watchlist) must be retrieved using the **Stitch MCP server**. The executing agent should query the Stitch MCP server to pull the exact screen designs before building the UI components.

---

## Detailed Task Breakdown

### Phase 1: Environment Setup & Scaffolding
1. **Initialize Project**: Run the command to initialize a React Native CLI project named `StreamList` using the `react-native-template-typescript` template.
2. **Configure TypeScript**: Update `tsconfig.json` to ensure `"strict": true` is enabled.
3. **Environment Variables**: Create a `.env.example` file with placeholder keys (`TMDB_BASE_URL`, `TMDB_IMAGE_BASE_URL`, `TMDB_ACCESS_TOKEN`). Configure `react-native-dotenv` to parse these variables. The executing user already has the TMDB API key ready to place in the `.env` file.
4. **Define Agent Rules**: Create a `.cursor/rules` file outlining the strict constraints (e.g., no inline fetches, `StyleSheet` only, no `any` types).

### Phase 2: Architectural Directory & Package Creation
Create the exact foundational directory structure inside a `src` folder. Each sub-step below must be executed individually:

1. **Create Base Directory**: Initialize `src/` at the root of the project.
2. **Create API Package**:
   - Create directory: `src/api/`
   - Create file: `src/api/client.ts` (For central Axios instance with Auth Bearer token interceptor and error normalization).
   - Create file: `src/api/movies.ts` (For exporting functions calling specific TMDB endpoints).
   - Create file: `src/api/types.ts` (For defining TypeScript interfaces for all API request/response shapes).
3. **Create Components Package**:
   - Create directory: `src/components/`
   - Create directory: `src/components/common/` (For globally reusable components like `ContentCard`, `SkeletonLoader`, `PrimaryButton`).
   - Create directories for screen-specific components (e.g., `src/components/home/`, `src/components/detail/`).
4. **Create Hooks Package**:
   - Create directory: `src/hooks/`
   - Create files like `useHome.ts`, `useSearch.ts`, `useMovieDetail.ts`. Ensure every hook returns a consistent `{ data, loading, error, refetch }` interface.
5. **Create Navigation Package**:
   - Create directory: `src/navigation/`
   - Create file: `src/navigation/RootNavigator.tsx` (To configure the Bottom Tab Navigator and nested stacks).
   - Create file: `src/navigation/types.ts` (To strictly type all navigation parameter lists).
6. **Create Screens Package**:
   - Create directory: `src/screens/`
   - Create files for screens: `HomeScreen.tsx`, `SearchScreen.tsx`, `DetailScreen.tsx`, `WatchlistScreen.tsx`, and a placeholder `ProfileScreen.tsx`.
7. **Create Store Package**:
   - Create directory: `src/store/`
   - Create file: `src/store/watchlistStore.ts`. This must use Zustand with `persist` middleware backed by `AsyncStorage`. It is critical to include a `hydrated` boolean flag in the state to delay rendering persistent UI until storage is loaded.
8. **Create Theme Package**:
   - Create directory: `src/theme/`
   - Create file: `src/theme/colors.ts` (Exporting the Absolute Dark palette tokens).
   - Create file: `src/theme/typography.ts` (Exporting Manrope/Inter configuration, sizes, and weights).
   - Create file: `src/theme/spacing.ts` (Exporting layout scale values to replace hardcoded pixels).
9. **Create Utils Package**:
   - Create directory: `src/utils/`
   - Create file: `src/utils/image.ts` (A helper function to safely construct TMDB image URLs based on path and size parameters, handling `null` appropriately).

### Phase 3: Core Implementation & Integrations
1. **API Client Setup**: Implement the Axios instance in `client.ts`. It must read the TMDB access token from environment variables and append it to all requests.
2. **Navigation Setup**: Implement the Bottom Tab Navigator. The tabs will be Home, Search, Watchlist, and Profile. The Watchlist tab requires a numeric badge indicating the number of saved items. Implement the Detail screen as a nested stack screen pushed over the active tab.
3. **Global UI Components**: Implement the `ContentCard` (2:3 aspect ratio, tonal layered, no border) and universal skeleton loaders that animate shimmering effects.

### Phase 4: Screen Construction
*For all screens, use the Stitch MCP server to retrieve exact visual requirements before coding.*

1. **Home Screen**:
   - Implement a transparent/adaptive Header.
   - Build a horizontally scrolling Genre Filter Strip without borders.
   - Build a large featured Hero Card for the top trending movie.
   - Implement horizontal content rows (Trending, Top Rated, Discover by Genre). Each row must have independent pagination logic (infinite scrolling) and independent loading skeletons.
2. **Search Screen**:
   - Implement an intelligent Search Bar featuring a 400ms debounce.
   - Implement request cancellation (using AbortController) so rapid typing doesn't resolve stale API requests.
   - Display Recent Searches retrieved from AsyncStorage.
   - Render a 2-column grid for search results, gracefully handling zero-result edge cases.
3. **Detail Screen**:
   - Fetch data using `Promise.allSettled` to simultaneously call movie details, credits, and similar titles.
   - Implement a Hero Backdrop image with a gradient fade.
   - Display a row of metadata chips, omitting any chips with `null` or `0` data (e.g., zero runtime or rating).
   - Implement the "Add to Watchlist" button using Optimistic UI principles (updating UI before storage confirms).
4. **Watchlist Screen**:
   - Connect the screen grid to the Zustand `watchlistStore`.
   - Implement client-side filter chips (All, Movies, Series).
   - Implement optimistic removal of items.
   - Build robust empty states, including contextual empty messages (e.g., "No Series in your watchlist yet").

### Phase 5: Error Handling & Polish
1. **Error Boundaries**: Wrap all main tab screens in a React Error Boundary. Display a localized error UI with a "Try Again" button that triggers the respective custom hook's `refetch()` method.
2. **Edge Case Verification**: Ensure `null` image paths display a branded placeholder. Ensure missing cast or similar movies do not render empty section headers.
3. **Architecture Documentation**: Generate an ADR (Architectural Decision Record) in a `docs/` directory detailing choices around the folder structure, API abstraction, and state hydration.

## Verification Plan
- **TypeScript Integrity**: Execute `tsc --noEmit` to verify zero `any` types and strict compliance.
- **Run/Build**: Boot the app on iOS/Android simulators to verify there are no compilation or runtime crash errors.
- **Functional Checks**: Verify debounce and request cancellation in the search flow. Test optimistic UI toggle on the Watchlist button and ensure the Tab Bar badge updates reactively across the entire application. Simulate offline/error states to verify Error Boundary behaviors.
