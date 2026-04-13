# Prompt Strategy Document: Watchlist Feature

## 1. Feature Breakdown
To implement the Watchlist feature systematically, the work is divided into 6 discrete, manageable AI tasks. This ordering ensures that data layers are established before UI components consume them, and individual components are built before being assembled into larger screens.

1.  **Task 1: API Services & Client-Side Global State**
    *   Setup the API integration layer (mock or real) with functions `fetchWatchlist`, `addToWatchlist`, and `removeFromWatchlist`.
    *   Create the global state slice (e.g., using Zustand or Redux) to manage the list of saved IDs, fetching status, and error states.
2.  **Task 2: `WatchlistButton` Component**
    *   Create an isolated, reusable button/icon component that accepts an `isSaved` boolean, `isLoading` state, and an `onToggle` callback.
    *   Style the active, inactive, disabled, and hover states using the standard design system.
3.  **Task 3: Integration with `ContentCard` & `DetailPage`**
    *   Inject the `WatchlistButton` into the existing `ContentCard` template.
    *   Connect the component to the global state so it accurately reflects whether the specific title belongs to the user's watchlist. Include optimistic UI updates for the toggle.
4.  **Task 4: Watchlist Screen Structure & Routing**
    *   Define a new protected route `/watchlist`.
    *   Create the base layout for `WatchlistPage`, including screen headers, breadcrumbs, and layout grids. Add navigation links (e.g., in the site Navbar or user profile dropdown) to reach this page.
5.  **Task 5: Watchlist Screen Data Population & Edge States**
    *   Connect the `WatchlistPage` to the global state to populate the grid with watched content cards.
    *   Implement a loading skeleton UI for initial fetches and a polished empty state ("Your Watchlist is empty. Explore titles to add!") for when the user has no saved items.
6.  **Task 6: E2E Testing & Edge Case Polish**
    *   Write Cypress or Playwright tests simulating the entire user flow: Logging in, navigating to a movie, toggling it, verifying the state on the Watchlist page, and removing it.
    *   Handle error boundaries and toast notifications for failed API requests.

---

## 2. Full Prompts (CDIR Framework)

Here are the complete prompts for **Task 1** and **Task 2**, structured using the CDIR format (Context, Directive, Instructions, Rules).

### Prompt 1: API Services & Global State (Task 1)
**Context:** 
We are building a "Watchlist" feature for a video streaming application. We use Zustand for global state management, Axios for data fetching, and TypeScript. The user's authentication context is already handled, and we can assume the user is authenticated. 

**Directive:**
Create a new Zustand store to manage the user's watchlist data and define the API boundary to interact with the backend.

**Instructions:**
1. Create a file `src/services/watchlistService.ts`. Define three mock API functions using Axios:
   - `fetchUserWatchlist()`: Returns a promise resolving to an array of `ContentItem` objects.
   - `addToWatchlist(titleId: string)`: Returns a success boolean.
   - `removeFromWatchlist(titleId: string)`: Returns a success boolean.
   *(Simulate 500ms network delays for these mock functions).*
2. Create a file `src/stores/useWatchlistStore.ts` using Zustand.
3. The store should maintain:
   - `items`: The array of watchlisted items.
   - `savedTitleIds`: A derived Set or array of string IDs for quick lookup.
   - `isLoading`: Boolean for initial fetch.
4. Expose actions in the store to initialize the watchlist, and to add/remove specific titles. Ensure the add/remove actions call the appropriate service layer functions.

**Rules:**
- Do NOT build any UI components in this step. Strictly focus on state and service layers.
- Write robust TypeScript interfaces for the store state and API responses.
- Export all types and interfaces.

### Prompt 2: `WatchlistButton` Component (Task 2)
**Context:**
Continuing to build out our Watchlist feature. We use React, TailwindCSS, and `lucide-react` for iconography. We need an isolated, state-agnostic toggle button that we can place on movie posters and detail pages.

**Directive:**
Build a dumb UI component named `WatchlistButton` that handles the visual representation of adding/removing an item from the watchlist.

**Instructions:**
1. Create a new component file at `src/components/WatchlistButton.tsx`.
2. Define the props: `isSaved` (boolean), `isLoading` (boolean), and `onToggle` (function, void return).
3. Visuals:
   - Use the `Bookmark` icon from `lucide-react`.
   - If `isSaved` is false: Show an outlined bookmark with a white tint.
   - If `isSaved` is true: Show a solid/filled bookmark with our theme's primary color (`bg-primary-500`).
   - If `isLoading` is true: Show a subtle spinning circle (`Loader2` from `lucide-react`) inside a rounded button container instead of the bookmark icon, and disable pointer events.
4. Include a subtle scale animation on hover/click using Tailwind classes (`transition-transform`, `active:scale-95`).

**Rules:**
- This must be a "dumb" presentational component. Do not import `useWatchlistStore` or any API logic here. The parent component will handle the state.
- Ensure accessibility: add descriptive `aria-label` properties that change based on the `isSaved` prop (e.g., "Add to Watchlist" vs "Remove from Watchlist").

---

## 3. `.cursor/rules` Additions

To ensure the AI maintains a consistent standard while building out this feature across various files, the following rules should be added to the project's `.cursor/rules` file.

1. **Rule: Implement Optimistic UI for List Toggles**
   * **Guideline:** "When writing action handlers for adding/removing items from the Watchlist (or any user-specific list), update the local state immediately before waiting for the API response. Rollback the change and show a toast error if the API request subsequently fails."
   * **Reasoning:** Watchlist actions are high-frequency interactions. If the user clicks "Add" and has to wait 300ms–1s for the server response before the icon changes, the app feels sluggish. Optimistic UI is essential for a premium feel.

2. **Rule: Disconnected API Logic**
   * **Guideline:** "Never place inline `fetch` or `axios` calls directly inside React components to interact with the Watchlist. All network requests must be abstracted into `service` files, and component data mutation should occur via Zustand store actions."
   * **Reasoning:** The Watchlist feature will be interacted with from multiple places (Homepage grids, search results, single-item detail pages). Abstracting the logic ensures consistency and prevents duplicating fetch/error handling code throughout the application.

3. **Rule: Mandatory Edge-State Handling and Skeletons**
   * **Guideline:** "Any component responsible for rendering a list (like `WatchlistPage`) MUST include a defined empty state (e.g., 'No items found') and a loading skeleton. Never show a blank screen during data fetches."
   * **Reasoning:** It's a common oversight to only design for the "happy path" where the user has data. Explicitly enforcing skeletons prevents jarring layout shifts, and enforcing empty states provides the user with an opportunity for guidance/onboarding rather than a confusing blank page.
