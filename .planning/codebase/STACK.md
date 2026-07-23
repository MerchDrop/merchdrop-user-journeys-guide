# Technology Stack

**Analysis Date:** 2026-06-27

## Languages

**Primary:**
- TypeScript 5.5 - All source code in `src/`, all Supabase Edge Functions in `supabase/functions/`

**Secondary:**
- SQL (PostgreSQL) - Database migrations in `supabase/migrations/`
- Deno/TypeScript - Supabase Edge Functions runtime (server-side)

## Runtime

**Environment:**
- Node.js (development/build only — Vite-based SPA)
- Deno - Supabase Edge Functions runtime

**Package Manager:**
- npm (lockfile: `package-lock.json`)
- bun.lockb also present — both lockfiles are committed (inconsistency)

## Frameworks

**Core:**
- React 18.3 - UI framework (`src/App.tsx`, `src/main.tsx`)
- React Router DOM 6.26 - Client-side routing with nested route layouts
- Vite 5.4 with `@vitejs/plugin-react-swc` - Build tool and dev server (port 8080)

**State / Data:**
- TanStack Query (React Query) v5.56 - Server state, caching, optimistic updates
- React Context API - Client state (Auth, Cart, Currency — `src/context/`)
- React Hook Form 7.53 - Form state management
- Zod 3.23 - Schema validation (auth inputs, profile updates)

**UI:**
- TailwindCSS 3.4 - Utility-first CSS
- shadcn/ui via Radix UI primitives - Component library (full set installed)
- Framer Motion 12.23 - Animations (dashboard sidebar, page transitions)
- Recharts 2.12 - Charts (admin analytics, artist/designer dashboards)
- Lucide React 0.462 - Icon set
- next-themes 0.3 - Theme provider (dark/light mode)
- Sonner 1.5 - Toast notifications
- Embla Carousel 8.3 - Carousels
- date-fns 3.6 - Date utilities

**Testing:**
- Vitest 3.2 - Unit/integration test runner
- Testing Library (React 16.3 + user-event 14.6) - Component testing
- jsdom 26.1 - DOM environment for unit tests
- Cypress 14.5 - E2E testing framework
- Storybook 9.0 - Component development/documentation

**Monitoring:**
- Sentry (`@sentry/react` 9.42) - Error tracking (`src/lib/sentry.ts`)

**Build/Dev:**
- Vite 5.4 - Dev server and production bundler
- TypeScript ESLint 8.0 - Linting
- PostCSS + Autoprefixer - CSS processing
- lovable-tagger 1.1 - Dev-mode component tagging (Lovable.dev platform tool)

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.52 - Supabase client for auth, database, realtime, storage, edge functions
- `react-paystack` 6.0 - Paystack payment integration (checkout flow)
- `react-paystack` wraps the Paystack inline JS library; the public key falls back to a hardcoded test key if `VITE_PAYSTACK_PUBLIC_KEY` is not set

**Infrastructure:**
- `react-helmet-async` 2.0 - SEO meta tag management (`src/components/SEO/SEOHelmet.tsx`)
- `react-resizable-panels` 2.1 - Resizable panel layouts
- `vaul` 0.9 - Drawer/sheet component
- `cmdk` 1.0 - Command menu
- `input-otp` 1.2 - OTP input for email verification

## Configuration

**Environment Variables (frontend — prefix `VITE_`):**
- `VITE_PAYSTACK_PUBLIC_KEY` — Paystack publishable key (falls back to hardcoded test key if absent)
- `VITE_SENTRY_DSN` — Sentry error tracking DSN

**Supabase credentials (hardcoded in `src/integrations/supabase/client.ts`):**
- `SUPABASE_URL` = `https://fnipjjcqlpklyuaduwml.supabase.co` (committed to source)
- `SUPABASE_PUBLISHABLE_KEY` = anon JWT (committed to source — acceptable for anon key, but worth noting)

**Edge Function environment variables (server-side secrets):**
- `PAYSTACK_SECRET_KEY` — Paystack secret key for server-side verification
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key for bypassing RLS in edge functions
- `ALLOWED_ORIGIN` — CORS origin restriction for `process-payment` function

**Build:**
- `vite.config.ts` — Vite config; `@` alias resolves to `./src`; dev server on port 8080
- `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` — TypeScript config split
- `tailwind.config.ts` — Tailwind with `@tailwindcss/typography` plugin
- `components.json` — shadcn/ui configuration

## Platform Requirements

**Development:**
- Node.js (version unspecified — no `.nvmrc` or `.node-version`)
- npm

**Production:**
- Supabase cloud (auth, PostgreSQL database, edge functions, file storage)
- `vercel.json` present — configured for Vercel deployment
- `Dockerfile` + `nginx.conf` + `docker-compose.yml` present — alternative container deployment

---

*Stack analysis: 2026-06-27*
