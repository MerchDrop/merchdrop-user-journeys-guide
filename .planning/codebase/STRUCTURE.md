# Codebase Structure

**Analysis Date:** 2026-06-27

## Directory Layout

```
merchdrop-user-journeys-guide/
├── src/                        # All application source code
│   ├── assets/                 # Static assets (images, SVGs)
│   ├── components/             # Reusable UI components
│   │   ├── admin/              # Admin panel feature components
│   │   ├── artist/             # Artist dashboard feature components
│   │   ├── auth/               # Auth error boundary
│   │   ├── dashboard/          # Shared dashboard widgets (KPI, charts)
│   │   ├── designer/           # Designer portal feature components
│   │   ├── dialogs/            # Standalone dialog components
│   │   ├── forms/              # Reusable form components
│   │   ├── home/               # Landing / shop page sections
│   │   │   └── __tests__/      # Component unit tests
│   │   ├── layout/             # Header, Footer, DashboardFooter
│   │   ├── product/            # Product reviews, wishlist
│   │   ├── search/             # Advanced search
│   │   ├── SEO/                # SEOHelmet component
│   │   ├── shop/               # Shop-specific components (marquee)
│   │   ├── ui/                 # shadcn/ui primitives
│   │   │   └── __tests__/      # UI component unit tests
│   │   └── user/               # User profile settings
│   ├── context/                # React Context providers
│   │   └── __tests__/          # Context unit tests
│   ├── hooks/                  # Custom React hooks
│   ├── integrations/           # External service clients
│   │   └── supabase/           # Supabase client + auto-generated types
│   ├── layouts/                # Route layout shells (auth-guarded wrappers)
│   ├── lib/                    # Utilities, schemas, constants
│   ├── pages/                  # Page components (one per route)
│   │   ├── admin/              # Admin sub-pages
│   │   ├── artist/             # Artist dashboard sub-pages
│   │   ├── designer/           # Designer portal sub-pages
│   │   └── user/               # User profile sub-pages
│   └── test/                   # Vitest global test setup
├── supabase/                   # Supabase backend configuration
│   ├── functions/              # Deno edge functions
│   │   ├── paystack-webhook/   # Paystack event handler
│   │   ├── process-payment/    # Order creation + payment verify
│   │   ├── send-confirmation-email/    # Registration email
│   │   └── send-designer-approval-email/  # Designer approval email
│   └── migrations/             # Ordered SQL migration files
├── cypress/                    # E2E test files
│   └── e2e/                    # Cypress test specs
├── public/                     # Static public assets (served at /)
├── index.html                  # Vite HTML entry point
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
├── cypress.config.ts           # Cypress configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript root config
├── tsconfig.app.json           # TypeScript app config
├── tsconfig.node.json          # TypeScript node config
├── eslint.config.js            # ESLint configuration
├── components.json             # shadcn/ui configuration
├── vercel.json                 # Vercel deployment config
├── Dockerfile                  # Docker container config
└── nginx.conf                  # Nginx config for Docker deployment
```

## Directory Purposes

**`src/pages/`:**
- Purpose: One component per route; page-level composition only
- Contains: Route entry components that wire together feature components
- Key files: `src/pages/Home.tsx` (creator landing), `src/pages/Shop.tsx` (storefront at `/`), `src/pages/Checkout.tsx`, `src/pages/ArtistOnboarding.tsx`
- Subdirectories mirror protected portals: `admin/`, `artist/`, `designer/`, `user/`

**`src/layouts/`:**
- Purpose: Authenticated route wrappers with sidebars and auth guards
- Contains: `AdminLayout.tsx`, `DashboardLayout.tsx`, `DesignerLayout.tsx`
- All layouts import `useAuth()` and redirect unauthenticated users

**`src/components/ui/`:**
- Purpose: shadcn/ui primitive components
- Contains: ~40 Radix UI-based components (button, card, dialog, etc.)
- Generated via `shadcn-ui` CLI — do not edit manually; customise via Tailwind variants

**`src/hooks/`:**
- Purpose: Custom hooks for data access and UI utilities
- Contains: TanStack Query hooks (`*Query.ts`), legacy useState hooks (`use*.ts`), auth utilities
- New data access: add to `*Query.ts` files only; do not create new legacy hooks

**`src/context/`:**
- Purpose: Global React Context providers
- Contains: `AuthContext.tsx`, `CartContext.tsx`, `CurrencyContext.tsx`
- All three are composed in `src/App.tsx`

**`src/integrations/supabase/`:**
- Purpose: Single Supabase client instance and auto-generated types
- Contains: `client.ts` (client singleton), `types.ts` (auto-generated — do not edit)
- Import the client as: `import { supabase } from '@/integrations/supabase/client'`

**`src/lib/`:**
- Purpose: Utilities, constants, and shared logic that are not React components
- Contains: `queryKeys.ts`, `queryUtils.ts`, `auth-schemas.ts`, `authErrorMessages.ts`, `sentry.ts`, `utils.ts`

**`supabase/functions/`:**
- Purpose: Server-side Deno edge functions for privileged operations
- Each function is an isolated Deno module in its own subdirectory
- Deploy with `supabase functions deploy <function-name>`

**`supabase/migrations/`:**
- Purpose: Ordered PostgreSQL migration files; define the entire database schema
- Never modify existing migration files; always add new ones
- Filename format: `{timestamp}_{uuid}.sql`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: App bootstrap — QueryClient, BrowserRouter, root render
- `src/App.tsx`: Provider composition, full route tree
- `index.html`: Vite HTML template with `<div id="root">`

**Configuration:**
- `src/integrations/supabase/client.ts`: Supabase client (URL + anon key)
- `src/lib/queryKeys.ts`: All TanStack Query cache keys
- `src/lib/auth-schemas.ts`: Zod validation schemas for auth inputs
- `src/lib/sentry.ts`: Sentry configuration (requires `initSentry()` call)

**Core Logic:**
- `src/context/AuthContext.tsx`: Auth state, role management, all auth operations
- `src/hooks/useRealtimeSubscriptions.ts`: Realtime → cache invalidation bridge
- `supabase/functions/process-payment/index.ts`: Payment verification + order creation
- `supabase/functions/paystack-webhook/index.ts`: Paystack event webhook handler

**Testing:**
- `src/test/setup.ts`: Vitest global setup (IntersectionObserver, matchMedia mocks)
- `vitest.config.ts`: Vitest config (jsdom, globals, setup file)
- `cypress.config.ts`: Cypress config (baseUrl, viewport)
- `cypress/e2e/smoke.cy.ts`: E2E smoke tests

## Naming Conventions

**Files:**
- Page components: `PascalCase.tsx` in `src/pages/`
- Feature components: `PascalCase.tsx` in domain subdirectory
- shadcn/ui primitives: `lowercase.tsx` in `src/components/ui/`
- Hooks: `camelCase.ts` with `use` prefix in `src/hooks/`
- Tests: `ComponentName.test.tsx` or `ComponentName.spec.tsx` in `__tests__/` sibling folder
- Stories: `ComponentName.stories.tsx` co-located with component

**Directories:**
- Domain components: lowercase plural noun (`admin`, `artist`, `designer`, `home`)
- Feature-specific tests: `__tests__/` in the same directory as the component

## Where to Add New Code

**New public-facing page:**
- Implementation: `src/pages/NewPageName.tsx`
- Route: Add `<Route path="/new-path" element={<NewPageName />} />` in `src/App.tsx`
- SEO: Wrap content with `<SEOHelmet title="..." description="..." />`

**New admin page:**
- Implementation: `src/pages/admin/NewAdminPage.tsx`
- Feature components: `src/components/admin/NewAdminFeature.tsx`
- Route: Add inside the `<Route path="/admin" element={<AdminLayout />}>` block in `src/App.tsx`
- Nav link: Add to `adminNavItems` array in `src/layouts/AdminLayout.tsx`

**New artist dashboard page:**
- Implementation: `src/pages/artist/NewArtistPage.tsx`
- Route: Add inside the `<Route path="/dashboard" element={<DashboardLayout />}>` block
- Nav link: Add to `sidebarItemsConfig` in `src/layouts/DashboardLayout.tsx`

**New designer portal page:**
- Implementation: `src/pages/designer/NewDesignerPage.tsx`
- Route: Add inside the `<Route path="/designer" element={<DesignerLayout />}>` block

**New entity data hook:**
- Implementation: `src/hooks/useNewEntityQuery.ts`
- Add query keys: `src/lib/queryKeys.ts`
- Pattern: Mirror `src/hooks/useProductsQuery.ts` — async fetch function, `useQuery` hook, `useMutation` hook per operation with optimistic update

**New database table:**
- Create migration: `supabase/migrations/{timestamp}_{uuid}.sql`
- Regenerate types: `supabase gen types typescript --local > src/integrations/supabase/types.ts`
- Add RLS policies in the migration file

**New Supabase edge function:**
- Create: `supabase/functions/function-name/index.ts`
- Must: validate JWT (`authHeader`), use service role client only for privileged ops
- CORS: Set `ALLOWED_ORIGIN` env var and use the CORS header pattern from `process-payment`
- Deploy: `supabase functions deploy function-name`

**Utilities:**
- Shared helpers: `src/lib/utils.ts` (general) or a new `src/lib/descriptiveName.ts`
- Do not put utilities in component files

## Special Directories

**`supabase/.temp/`:**
- Purpose: Supabase CLI local project state (project ref, versions)
- Generated: Yes
- Committed: Yes (in this repo — typically gitignored)

**`public/`:**
- Purpose: Static files served at `/` — favicon, logos, uploaded brand assets
- Contains: Lovable-platform uploaded images at `lovable-uploads/` path
- Generated: No
- Committed: Yes

**`dist/`:**
- Purpose: Production build output
- Generated: Yes (via `vite build`)
- Committed: No (should be in `.gitignore`)

---

*Structure analysis: 2026-06-27*
