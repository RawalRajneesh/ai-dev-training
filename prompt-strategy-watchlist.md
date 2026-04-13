# Prompt Strategy Document: Watchlist

## Feature summary

A **logged-in** user can add titles to their Watchlist and remove them, open a **dedicated screen** that lists every saved title, and see a **Watchlist indicator** on content cards when a title is already saved. Mutations and reads must respect authentication and stay consistent across cards, lists, and detail surfaces.

---

## Global constraints for agents

- Follow the project’s existing stack, folder layout, naming, and state patterns; do not introduce a parallel architecture for Watchlist-only code unless explicitly requested.
- Watchlist is **authenticated**: no watchlist API calls for anonymous users; UI should hide or gate actions and avoid noisy 401s.
- Use one **canonical content/title identifier** everywhere (cards, API, local cache); document the field name in code if the backend uses multiple ids.
- Adding the same title twice should be **idempotent** at the UX level (no duplicate rows; safe re-add).
- Prefer **centralized** mutation and fetch paths so error handling, caching, and optimistic updates stay consistent.

---

## Task decomposition (AI prompt units)

Each task below is scoped for **one** Composer or Agent prompt. Use the suggested prompt skeleton as a template: paste repo context, then fill Task / Constraints / Definition of done.

### Task 1 — Watchlist API layer

| Field | Content |
|--------|---------|
| **Goal** | Implement a small API module for list, add, and remove watchlist entries with correct auth and error mapping. |
| **In scope** | HTTP/GraphQL client functions, request/response types (DTOs), status and error normalization (e.g. 401 vs 409), optional retry only where the project already does so. |
| **Out of scope** | UI components, navigation, global app store setup beyond what is needed to call these functions. |
| **Acceptance criteria** | List/add/remove are callable as pure functions or a single service class; authenticated requests include session token/header per app convention; errors surface as typed results or exceptions consistent with the rest of the app. |
| **Suggested prompt skeleton** | *Context:* “Here is our API client pattern in [paths].” *Task:* “Add watchlist list/add/remove using [endpoints].” *Constraints:* “Match existing error handling; no new dependencies unless necessary.” *Definition of done:* “Call sites can import one module and run list/add/remove in tests or a scratch screen.” |

---

### Task 2 — Domain model and ID consistency

| Field | Content |
|--------|---------|
| **Goal** | Define `WatchlistItem` (or equivalent) and map DTOs to a stable domain shape with a single **content id** used across features. |
| **In scope** | Types/models, mappers from API payloads, naming aligned with “title” / “content” in the rest of the product. |
| **Out of scope** | Networking implementation (covered in Task 1), UI. |
| **Acceptance criteria** | One obvious field (e.g. `contentId`) is the source of truth for “is this on the watchlist?”; mappers are covered by unit tests if the project tests mappers elsewhere. |
| **Suggested prompt skeleton** | *Context:* “DTO from backend looks like …” *Task:* “Add domain type + mapper.” *Constraints:* “Cards and watchlist rows must use the same id field.” *Definition of done:* “No screen uses a different id for the same title without an explicit mapping layer.” |

---

### Task 3 — Client state and cache

| Field | Content |
|--------|---------|
| **Goal** | Hold watchlist data in app state (store, repository cache, or query cache) with **O(1)** membership checks for indicators. |
| **In scope** | Structure for ordered list for the Watchlist screen plus a set/map of ids for card indicators; invalidation or patch after add/remove. |
| **Out of scope** | Pixel-level UI, routing. |
| **Acceptance criteria** | After a successful add/remove, indicator and list reflect the change without requiring a full app restart; no duplicate ids in the membership structure. |
| **Suggested prompt skeleton** | *Context:* “We use [Redux / Riverpod / React Query / …] here: [file].” *Task:* “Add watchlist slice/query with list + id set.” *Constraints:* “Mutations update cache consistently.” *Definition of done:* “A dev can log ids and see card + screen stay in sync after mutations.” |

---

### Task 4 — Watchlist indicator on content cards

| Field | Content |
|--------|---------|
| **Goal** | Show an icon (or badge) on content cards when that card’s content id is on the watchlist. |
| **In scope** | Card subcomponent or props wiring, subscription/selector to watchlist membership, accessible label (e.g. “On your watchlist” / “Not on watchlist”). |
| **Out of scope** | Implementing add/remove on the card unless that is the only entry point (can be Task 6). |
| **Acceptance criteria** | Indicator updates when watchlist changes elsewhere; no per-card network call; labels work with screen readers if the app supports a11y. |
| **Suggested prompt skeleton** | *Context:* “Content card lives in [path]; id field is …” *Task:* “Add saved indicator driven by watchlist state.” *Constraints:* “No N+1 fetches; reuse Task 3 selector.” *Definition of done:* “Toggle watchlist elsewhere updates the card icon.” |

---

### Task 5 — Dedicated Watchlist screen

| Field | Content |
|--------|---------|
| **Goal** | Build the full Watchlist screen: load saved titles, show list or grid, loading and **empty** states, and navigation entry consistent with the app shell. |
| **In scope** | Screen widget/page, pull-to-refresh if the app uses it elsewhere, reuse of shared list/item components where possible. |
| **Out of scope** | Deep linking and marketing pages unless already required by the app. |
| **Acceptance criteria** | Empty state explains how to add titles; errors show a user-visible message; list matches server after refresh. |
| **Suggested prompt skeleton** | *Context:* “Routing pattern is …” *Task:* “Add Watchlist screen at [route].” *Constraints:* “Match existing list screen loading/empty UX.” *Definition of done:* “User can open screen and see all saved titles or empty state.” |

---

### Task 6 — Add, remove, and toggle actions

| Field | Content |
|--------|---------|
| **Goal** | Wire user actions (button, long-press, overflow menu) to add or remove, including optional **optimistic** updates with rollback on failure. |
| **In scope** | Handlers that call Task 1 via Task 3; debounce or disable button while in flight if that matches app patterns. |
| **Out of scope** | Redesigning the card layout beyond what actions require. |
| **Acceptance criteria** | From a card or title detail, user can add and remove; duplicate add does not create duplicate rows; failed request restores prior UI state if optimistic UI is used. |
| **Suggested prompt skeleton** | *Task:* “Connect [button] to watchlist add/remove.” *Constraints:* “Use existing toast/snackbar for errors.” *Definition of done:* “Manual test: add, remove, rapid double-tap behaves safely.” |

---

### Task 7 — Login and session lifecycle

| Field | Content |
|--------|---------|
| **Goal** | Fetch watchlist after login (or token refresh) and clear or isolate watchlist state on logout so another user never sees the previous list. |
| **In scope** | Hooks into auth flow already present in the app; guest mode: hide watchlist entry points or show sign-in CTA. |
| **Out of scope** | Implementing authentication itself. |
| **Acceptance criteria** | Login → watchlist loads; logout → in-memory watchlist cleared; guest does not trigger authenticated list endpoints. |
| **Suggested prompt skeleton** | *Context:* “Auth events are emitted from …” *Task:* “Fetch watchlist on login; clear on logout.” *Constraints:* “No watchlist API without session.” *Definition of done:* “Switching accounts shows correct list per user.” |

---

## Cursor rules for this feature (proposed)

Project rules live at [`.cursor/rules/watchlist.mdc`](.cursor/rules/watchlist.mdc) (applies when open files match `**/*watchlist*`). Extend `globs` if your watchlist UI lives under other paths. The prose below documents the same intent for readers of this document.

### Rule 1 — Single mutation and fetch surface

**Rule:** All watchlist HTTP calls and cache invalidation for add/remove/list go through **one** module (repository, API service, or data source layer). Screens and widgets call that layer or thin facades, not raw clients scattered across the tree.

**Reasoning:** Duplicated endpoints and ad hoc `fetch` calls lead to inconsistent error handling, divergent DTO parsing, and bugs where one screen updates local state and another does not. A single surface makes optimistic rollback and logging easier.

---

### Rule 2 — Canonical content id

**Rule:** Every watchlist UI check and API payload must use the same **canonical content/title id** defined in the domain model. If the backend returns aliases (`slug`, `uuid`), map them in one place; do not compare `card.id` to `watchlistItem.titleId` without a documented mapping.

**Reasoning:** The product depends on the **indicator** and the **list** agreeing. Mixed identifiers cause “saved” icons on the wrong cards or titles that never show as saved.

---

### Rule 3 — Authenticated-only behavior

**Rule:** Watchlist actions and full-list fetch run only for authenticated users. For guests, do not call authenticated watchlist APIs; show sign-in prompts or hide controls per product copy.

**Reasoning:** Matches the feature definition (“logged-in user”), avoids unnecessary 401s, and reduces risk of confusing empty states with authorization failures.

---

### Rule 4 (optional) — Optimistic updates must rollback

**Rule:** If the UI updates before the server confirms, failed mutations must **revert** the previous watchlist membership and show feedback.

**Reasoning:** Without rollback, users believe a title is saved or removed when it is not, which is worse than a slightly slower confirmed UI.

---

## Related documents

- Product-level specification: [`psd.md`](psd.md)
