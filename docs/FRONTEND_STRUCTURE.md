# SajiloMart — Frontend State Management and Structure

> **Status:** Proposal. Not implemented and not approved. This document records a
> recommended direction for the React client so the decision is not lost. The
> current application still matches the state described in
> [Current state](#current-state).

## 1. Recommendation

Use **Redux Toolkit with RTK Query** for server state, backed by the existing
**Axios** dependency as the HTTP transport. Keep Redux slices for genuine
client-side shared state.

This means:

- **RTK Query** owns products, orders, cart, wishlist, chat, and any other data
  owned by the backend: caching, request deduplication, loading/error states,
  refetching, and tag-based invalidation.
- **Redux slices** own shared client state such as the authenticated user and
  session status.
- **Local state** (`useState`) owns dialogs, draft forms, hover/focus, and
  page-local pagination.
- **The URL** owns search, filters, and page numbers so they survive refresh and
  are shareable.
- **Axios** remains the single HTTP client so cookie, CSRF, and 401-refresh
  handling live in one place.

### Why this over `createAsyncThunk` + Axios

- The marketplace is server-state heavy; RTK Query removes repetitive
  `pending/fulfilled/rejected` reducers.
- Axios is already a dependency (`frontend/package.json`), and the planned auth
  flow needs `withCredentials`, a CSRF header, and one 401-refresh retry. An
  Axios instance with interceptors keeps that logic centralised.
- One store and one transport; no second state library such as TanStack Query or
  Zustand is needed.
- The frontend is still a stub, so starting with the intended structure avoids a
  later rewrite.

### Tradeoffs

- `axiosBaseQuery` is a small custom wrapper (roughly 20 lines) that is not
  shipped by Redux Toolkit.
- This deviates from `docs/implementation/11-redux-toolkit.md`, which uses
  `createAsyncThunk` and a separate cart slice. Record the deviation in
  `docs/DECISIONS_LOG.md` when approved.
- A cart slice duplicates the server cart and creates two sources of truth; RTK
  Query should own the cart instead.

### When not to choose this

If the team prioritises zero custom glue and strict adherence to the existing
reference guide over reduced boilerplate, use `createAsyncThunk` + Axios.

## 2. Current state

- `frontend/package.json` contains React, React DOM, and Axios. It does **not**
  yet contain `@reduxjs/toolkit`, `react-redux`, or `react-router-dom`.
- `frontend/src/services/api.ts` uses `fetch`, not Axios.
- `frontend/src/App.tsx` is a placeholder and no store exists yet.
- Adding these packages and the folders below is out of scope for this document.

## 3. Target layout

Create folders only when the corresponding feature exists; do not scaffold every
folder up front.

```text
frontend/src/
  app/
    store.ts              # configureStore: baseApi reducer+middleware, auth slice
    baseApi.ts            # createApi({ baseQuery: axiosBaseQuery(), tagTypes })
    hooks.ts              # useAppDispatch / useAppSelector (typed)
    AppBootstrap.tsx      # restores the session before rendering routes
    router.tsx            # React Router route table (lazy pages)
  lib/
    axios.ts              # axios instance: baseURL, withCredentials, CSRF, 401 refresh
    axiosBaseQuery.ts     # RTK Query baseQuery wrapping the axios instance
    format.ts             # currency/date helpers (when needed)
  components/
    layout/
      AppLayout.tsx
      Header.tsx
      Footer.tsx
    ui/
      Button.tsx
      Input.tsx
      Spinner.tsx
      EmptyState.tsx
  features/
    auth/
      api.ts              # injectEndpoints: login, register, logout, me
      slice.ts            # user + session status (never tokens)
      types.ts
      guards.tsx          # RequireAuth / RequireRole (UX only)
      components/
      pages/
    catalog/
      api.ts
      types.ts
      components/
      pages/
    cart/
      api.ts              # server cart is the source of truth
      types.ts
      components/
    wishlist/
      api.ts
    orders/
      api.ts
      components/
      pages/
    chat/
      api.ts
      components/
    seller/
      api.ts              # seller store, products, verification
      types.ts
      components/
      pages/
  pages/                  # only route pages that belong to no feature
  services/               # existing api.ts (health); migrate or remove later
  main.tsx
  App.tsx
  index.css
```

## 4. Core wiring

The snippets below are illustrative and are not part of the application yet.

```ts
// app/baseApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../lib/axiosBaseQuery";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Auth", "Product", "Cart", "Wishlist", "Order", "Chat"],
  endpoints: () => ({}),
});
```

```ts
// app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import authReducer from "../features/auth/slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Each feature adds endpoints with `baseApi.injectEndpoints(...)`, so `store.ts`
does not change when a new feature lands.

`lib/axios.ts` creates the single Axios instance with `withCredentials`, a
timeout, a request interceptor that adds the CSRF header for mutating methods,
and a response interceptor that performs at most one 401 refresh and retries the
original request. `lib/axiosBaseQuery.ts` adapts that instance to RTK Query and
normalises errors to `{ status, data }`.

## 5. State ownership

| State | Location |
|---|---|
| Products, orders, cart, wishlist, chat, seller store | `baseApi` cache (server state) |
| Authenticated user and session status | `features/auth/slice.ts` |
| Cart | Server only; no duplicate cart slice |
| Search, filters, page | URL `searchParams` |
| Dialogs, draft forms, hover, local pagination | Component `useState` |

Tokens must never be stored in Redux; authentication uses HTTP-only cookies.

## 6. Conventions and boundaries

- Features do not import another feature's internals. Shared code goes in
  `components/` or `lib/`; cross-feature composition happens in
  `app/router.tsx`.
- Each feature's `api.ts` exports generated hooks and types only, no JSX.
- Use the typed `useAppDispatch` and `useAppSelector` hooks, never the untyped
  versions.
- `App.tsx` stays thin: session bootstrap plus the router provider.
- Route guards are a UX convenience; the backend remains authoritative.
- Optional: add an `@/` import alias via `tsconfig.json` `paths` and
  `vite.config.ts` `resolve.alias`. This requires `@types/node` for the Vite
  config; relative imports are acceptable if no new dev dependency is desired.

## 7. Incremental adoption order

1. Add `@reduxjs/toolkit` and `react-redux`; create `lib/axios.ts`,
   `lib/axiosBaseQuery.ts`, `app/baseApi.ts`, `app/store.ts`, and
   `app/hooks.ts`; wrap `main.tsx` in the Redux `Provider`.
2. Add `features/auth/{api,slice,types,guards}` and `AppBootstrap`; migrate the
   health call from `services/api.ts` into a feature endpoint and remove the old
   file.
3. Add `app/router.tsx`, `components/layout/`, and shared `components/ui/`.
4. Add one feature folder per MVP step as that step begins (`catalog`, `cart`,
   `wishlist`, `orders`, `chat`, `seller`).

## 8. Follow-ups before implementation

- Approve the RTK Query direction and record it in `docs/DECISIONS_LOG.md`.
- Decide whether to adopt the `@/` import alias.
- Confirm the auth refresh strategy with the backend contract, including the
  refresh endpoint and CSRF cookie name.
- Add the required packages and tests only as part of the relevant MVP step, not
  at the same time as this document.
