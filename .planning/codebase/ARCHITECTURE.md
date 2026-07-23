<!-- refreshed: 2026-06-27 -->
# Architecture

**Analysis Date:** 2026-06-27

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                                  │
│  React 18 + React Router v6 — entry: src/main.tsx → src/App.tsx      │
├──────────────┬───────────────┬──────────────┬────────────────────────┤
│  Public Shop │  Artist Dash  │  Admin Panel │  Designer Portal       │
│  `/` (Shop)  │  `/dashboard` │  `/admin`    │  `/designer`           │
│  `/products` │  (DashLayout) │  (AdminLyt)  │  (DesignerLayout)      │
│  `/artist/:s`│  `src/pages/` │  `src/pages/ │  `src/pages/          │
│  `/checkout` │  `artist/*`   │  admin/*`    │  designer/*`           │
└──────┬───────┴───────┬───────┴──────┬───────┴───────────┬────────────┘
       │               │              │                   │
       └───────────────┴──────────────┴───────────────────┘
                                │
              ┌─────────────────▼──────────────────┐
              │         Context Layer                │
              │  AuthContext  CartContext            │
              │  CurrencyContext                     │
              │  `src/context/`                      │
              └─────────────────┬──────────────────┘
                                │
              ┌─────────────────▼──────────────────┐
              │     Data Layer (TanStack Query)      │
              │  useProductsQuery  useOrdersQuery   │
              │  useArtistsQuery   useUsersQuery     │
              │  `src/hooks/*Query.ts`               │
              │  + legacy hooks: `src/hooks/use*.ts` │
              └─────────────────┬──────────────────┘
                                │
              ┌─────────────────▼──────────────────┐
              │          Supabase Client             │
              │  `src/integrations/supabase/`        │
              │  Auth | DB (PostgreSQL) | Storage    │
              │  Realtime | Edge Functions            │
              └─────────────────┬──────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  PostgreSQL DB          Supabase Storage         Edge Functions
  (RLS enforced)         `product-images`         `process-payment`
  `supabase/migrations/` `design-assets`          `paystack-webhook`
                                                  `send-confirmation-email`
                                                  `send-designer-approval-email`
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App` | Route tree, provider composition | `src/App.tsx` |
| `AuthContext` | Supabase auth state, role management, sign-up/in/out | `src/context/AuthContext.tsx` |
| `CartContext` | In-memory + localStorage cart state | `src/context/CartContext.tsx` |
| `CurrencyContext` | Currency selection and price conversion (USD/GBP/NGN) | `src/context/CurrencyContext.tsx` |
| `DashboardLayout` | Artist dashboard shell with auth guard | `src/layouts/DashboardLayout.tsx` |
| `AdminLayout` | Admin panel shell with admin-only guard | `src/layouts/AdminLayout.tsx` |
| `DesignerLayout` | Designer portal shell with auth guard | `src/layouts/DesignerLayout.tsx` |
| `useRealtimeSubscriptions` | Supabase realtime → React Query cache invalidation | `src/hooks/useRealtimeSubscriptions.ts` |
| Query hooks (`*Query.ts`) | TanStack Query wrappers for each entity with mutations | `src/hooks/*Query.ts` |
| Legacy hooks (`use*.ts`) | Older useState+useEffect data hooks (being superseded) | `src/hooks/use*.ts` |
| `queryKeys` | Centralized React Query key factory | `src/lib/queryKeys.ts` |
| `queryUtils` | Optimistic update helpers, toast utilities | `src/lib/queryUtils.ts` |
| `auth-schemas` | Zod validation schemas for auth inputs | `src/lib/auth-schemas.ts` |

## Pattern Overview

**Overall:** Multi-role SPA with role-based layout guards, Supabase backend-as-a-service, TanStack Query as server state manager, React Context for client state.

**Key Characteristics:**
- Five user roles: `admin`, `moderator`, `artist`, `designer`, `user` — stored in `user_roles` table, enforced by RLS
- Three distinct portal spaces with dedicated layouts: artist (`/dashboard`), admin (`/admin`), designer (`/designer`)
- Two parallel data access patterns in use simultaneously: legacy `useState` hooks (`src/hooks/useProducts.ts`) and TanStack Query hooks (`src/hooks/useProductsQuery.ts`)
- Supabase Realtime drives cache invalidation via `useRealtimeSubscriptions` mounted globally in `App`
- Payment flow: client-side Paystack SDK → server-side verification in `process-payment` edge function → order creation in DB

## Layers

**Routing Layer:**
- Purpose: Map URLs to page components; enforce portal access per role
- Location: `src/App.tsx`
- Contains: `<Routes>`, nested `<Route>` under layout wrappers
- Auth guards live in layout components (`DashboardLayout`, `AdminLayout`, `DesignerLayout`), not in `App`

**Page Layer:**
- Purpose: Page-level composition, orchestrate component trees
- Location: `src/pages/`, `src/pages/admin/`, `src/pages/artist/`, `src/pages/designer/`, `src/pages/user/`
- Contains: Page components that assemble feature components

**Component Layer:**
- Purpose: Reusable UI building blocks, grouped by domain
- Location: `src/components/admin/`, `/artist/`, `/designer/`, `/home/`, `/layout/`, `/product/`, `/ui/`, etc.
- Contains: Feature components and shadcn/ui primitives (`src/components/ui/`)
- Depends on: Context hooks, data hooks

**Context Layer:**
- Purpose: Cross-cutting client state (auth, cart, currency)
- Location: `src/context/`
- Mounted in: `src/App.tsx` provider stack

**Data Layer:**
- Purpose: Server data fetching, caching, mutation
- Location: `src/hooks/*Query.ts` (TanStack Query) and `src/hooks/use*.ts` (legacy)
- Pattern: Query hooks export `useXQuery()` for reads and `useXMutation()` for writes with optimistic updates
- Depends on: `src/integrations/supabase/client.ts`, `src/lib/queryKeys.ts`

**Integration Layer:**
- Purpose: Supabase client singleton
- Location: `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`
- Note: `types.ts` is auto-generated from Supabase schema; do not edit manually

**Edge Functions Layer (Deno):**
- Purpose: Privileged server-side operations: payment verification, order creation, transactional email
- Location: `supabase/functions/`
- All use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) — restricted to authenticated callers only

## Data Flow

### Purchase Flow

1. User adds products to cart via `CartContext.addItem()` — persisted to `localStorage`
2. User navigates to `/checkout` (`src/pages/Checkout.tsx`)
3. Paystack SDK initialised with `VITE_PAYSTACK_PUBLIC_KEY`, amount in kobo/cents
4. On Paystack success callback, client calls `supabase.functions.invoke('process-payment', ...)` with JWT
5. `process-payment` edge function verifies payment with Paystack API, inserts order + order_items using service role
6. `paystack-webhook` edge function handles asynchronous Paystack events (charge.success, charge.failed, refund.processed) via HMAC-SHA512 signature verification
7. Client redirects to confirmation; cart cleared

### Auth Flow

1. `AuthContext` sets up `supabase.auth.onAuthStateChange` listener on mount
2. On `SIGNED_IN` / `INITIAL_SESSION`, calls `setupUserProfile()` RPC to ensure `profiles` and `user_roles` rows exist
3. `loadUserData()` parallel-fetches profile, roles, and super-admin status
4. Derived booleans `isAdmin`, `isArtist`, `isDesigner` are memoised
5. Layout guards (`AdminLayout`, `DashboardLayout`, `DesignerLayout`) read these booleans; redirect to appropriate auth page if check fails

### Realtime Sync Flow

1. `useRealtimeSubscriptions()` (called in `App`) opens Supabase realtime channels for `orders`, `products`, `user_roles`, `artist_profiles`, `designs`
2. Any Postgres change event triggers `queryClient.invalidateQueries()` for the matching `queryKeys` namespace
3. TanStack Query refetches stale data on next render

**State Management:**
- Server state: TanStack Query (staleTime 5 min, gcTime 10 min, no refetch on window focus)
- Client ephemeral state: React `useState`/`useReducer` inside components
- Shared client state: React Context (Auth, Cart, Currency)
- Persistent client state: `localStorage` (cart items, preferred currency)

## Key Abstractions

**Query Key Factory (`queryKeys`):**
- Purpose: Consistent, hierarchical React Query cache keys preventing collisions
- Location: `src/lib/queryKeys.ts`
- Pattern: `queryKeys.products.list(filters)`, `queryKeys.orders.all`, etc.

**Zod Validation at Auth Boundary:**
- Purpose: Input sanitisation before any Supabase auth call
- Location: `src/lib/auth-schemas.ts` + `src/hooks/useAuthValidation.ts`
- Pattern: `validate(signUpSchema, input)` returns `{ isValid, data, errors }`

**Optimistic Update Helper:**
- Purpose: Uniform pattern for create/update/delete optimistic mutations
- Location: `src/lib/queryUtils.ts` — `createOptimisticUpdate(data, item, 'update'|'delete'|'create')`

**Role-based Redirect:**
- Purpose: Post-login routing by highest-priority active role
- Location: `src/hooks/useRoleRedirect.ts`
- Priority order: admin > designer > artist > user (pending states handled separately)

## Entry Points

**Web App:**
- Location: `src/main.tsx`
- Sets up: `BrowserRouter`, `QueryClientProvider` (staleTime 5m, no focus-refetch), `App`

**App Component:**
- Location: `src/App.tsx`
- Sets up: `HelmetProvider`, `AuthErrorBoundary`, `AuthProvider`, `CurrencyProvider`, `CartProvider`, realtime subscriptions, full route tree

**Edge Functions:**
- `supabase/functions/process-payment/index.ts` — POST, authenticated, order creation
- `supabase/functions/paystack-webhook/index.ts` — POST, HMAC-verified, event handler
- `supabase/functions/send-confirmation-email/index.ts` — POST, transactional email
- `supabase/functions/send-designer-approval-email/index.ts` — POST, approval/rejection email

## Architectural Constraints

- **Auth deadlock prevention:** `onAuthStateChange` uses a 100ms `setTimeout` defer on first session setup to avoid Supabase auth state deadlock (documented in `AuthContext.tsx:237`)
- **Global state:** Three module-level singletons: Supabase client (`src/integrations/supabase/client.ts`), QueryClient (`src/main.tsx`), Sentry (`src/lib/sentry.ts`)
- **RLS enforcement:** All direct DB queries from the browser are subject to PostgreSQL Row Level Security; only edge functions with `SUPABASE_SERVICE_ROLE_KEY` bypass RLS
- **Dual data hook pattern:** Both `useProducts` (legacy `useState`) and `useProductsQuery` (TanStack Query) exist simultaneously; `useProductsQuery` exports a `useProducts` shim for backward compatibility — new code must use `*Query` hooks only

## Anti-Patterns

### Duplicate Data Hook Implementations

**What happens:** The same entity (products, artists, orders, etc.) has two hook implementations: a legacy `useState`/`useEffect` hook (`src/hooks/useProducts.ts`) and a TanStack Query hook (`src/hooks/useProductsQuery.ts`). Both are imported in different parts of the codebase.

**Why it's wrong:** The legacy hooks do not benefit from caching, optimistic updates, or cache invalidation driven by realtime subscriptions. This leads to stale UI in components still on the old hooks.

**Do this instead:** Use only the `*Query.ts` hooks for all new and updated code. The shim `useProducts()` in `useProductsQuery.ts` provides backward compatibility — migrate call sites to direct `useProductsQuery()` as they are touched.

### Direct `supabase.auth.signOut()` in Layout Component

**What happens:** `DashboardLayout.tsx:301` calls `supabase.auth.signOut()` directly instead of calling `useAuth().signOut()`.

**Why it's wrong:** Bypasses `AuthContext`'s sign-out logic which handles toast feedback and consistent state cleanup.

**Do this instead:** Always call `const { signOut } = useAuth(); await signOut();` — defined in `src/context/AuthContext.tsx`.

### `console.log` Debug Statements in Production

**What happens:** 141 `console.log/error/warn` calls across 47 files, including in `DashboardLayout.tsx:76` which logs full user/role state on every render.

**Why it's wrong:** Leaks internal state in production browser console; sensitive role data is exposed.

**Do this instead:** Remove debug `console.log` calls. Use `console.error` only in genuine error paths where no other error reporting is in place.

## Error Handling

**Strategy:** Layered — component-level error boundaries + TanStack Query error callbacks + global unhandled rejection handler

**Patterns:**
- `AuthErrorBoundary` (`src/components/auth/AuthErrorBoundary.tsx`) wraps the entire app tree; shows retry UI on auth crashes
- Sentry captures browser errors in production (filtered out in development via `beforeSend`)
- TanStack Query mutations use `onError` → `handleQueryError()` which maps JWT/permission/network errors to user-friendly Sonner toasts
- Edge functions return structured `{ error: string }` JSON with appropriate HTTP status codes

## Cross-Cutting Concerns

**Logging:** `console.error` for caught errors in hooks/context; Sentry for uncaught exceptions in production
**Validation:** Zod schemas at auth input boundaries (`src/lib/auth-schemas.ts`); no validation on non-auth forms
**Authentication:** Supabase JWT auth; row-level security on all tables; role checked via `user_roles` table with `status = 'active'` filter
**SEO:** `react-helmet-async` with `SEOHelmet` component (`src/components/SEO/SEOHelmet.tsx`)
**Internationalisation:** Currency only (USD/GBP/NGN via `CurrencyContext`); no i18n library; hardcoded English

---

*Architecture analysis: 2026-06-27*
