# Codebase Concerns

**Analysis Date:** 2026-06-27

## Tech Debt

**Dual data-hook pattern (legacy + TanStack Query):**
- Issue: Every entity has two hook implementations — `src/hooks/useProducts.ts` (useState/useEffect) and `src/hooks/useProductsQuery.ts` (TanStack Query). Both are actively imported in different components. The `useProductsQuery.ts` file exports a `useProducts` shim at line 319 for backward compatibility.
- Files: `src/hooks/useProducts.ts`, `src/hooks/useProductsQuery.ts`, `src/hooks/useArtists.ts`, `src/hooks/useArtistsQuery.ts`, `src/hooks/useOrders.ts`, `src/hooks/useOrdersQuery.ts`, `src/hooks/useUsers.ts`, `src/hooks/useUsersQuery.ts`, `src/hooks/useDesigners.ts`, `src/hooks/useDesignersQuery.ts`
- Impact: Inconsistent caching — components using legacy hooks show stale data after realtime events; realtime invalidations only work for TanStack Query consumers. Doubled maintenance surface for every entity.
- Fix approach: Audit all import sites, migrate each to the `*Query.ts` hook, then delete the legacy `use*.ts` hook files. The shim exports make this a non-breaking refactor one file at a time.

**`AuthContext.tsx` is 717 lines with triplicated sign-up logic:**
- Issue: `signUp`, `signUpArtist`, `signUpDesigner` are near-identical functions (~100 lines each) differing only in `userType` value and redirect URL parameter.
- Files: `src/context/AuthContext.tsx` (lines 277–455)
- Impact: Any auth change (e.g., adding OTP enforcement, changing email templates) must be applied in three places. High risk of divergence.
- Fix approach: Extract a single `signUpWithType(input: SignUpInput, userType: 'user' | 'artist' | 'designer')` function. The three public methods become one-line wrappers.

**`CleanDashboard.tsx` renders with empty hardcoded arrays:**
- Issue: The artist dashboard index page (`/dashboard`) declares `salesData: any[] = []`, `recentOrders: any[] = []`, `products: any[] = []`, etc. as module-level constants. No data is ever loaded.
- Files: `src/pages/CleanDashboard.tsx` (lines 29–33)
- Impact: The artist dashboard overview appears empty for every artist. Core product feature is non-functional.
- Fix approach: Replace hardcoded arrays with actual data from `useProductsQuery`, `useOrdersQuery`, and analytics hooks. Wire up the `KpiCard`, `SalesChart`, `ProductPerformance`, `RecentOrders`, and `PayoutsList` components with real data.

**`Dashboard.tsx` (old) is orphaned:**
- Issue: `src/pages/Dashboard.tsx` exists alongside `src/pages/CleanDashboard.tsx`. `App.tsx` routes `/dashboard` to `CleanDashboard`, but `Dashboard.tsx` remains in the codebase. Similarly, `Index.tsx` is a thin wrapper around `Home.tsx` with no routing entry.
- Files: `src/pages/Dashboard.tsx`, `src/pages/Index.tsx`, `src/pages/LiveDashboard.tsx`
- Impact: Confusion about which dashboard is canonical; dead code inflates bundle.
- Fix approach: Delete `src/pages/Dashboard.tsx`, `src/pages/Index.tsx`, and `src/pages/LiveDashboard.tsx` after confirming no imports remain.

**`no-unused-vars` ESLint rule is disabled:**
- Issue: `eslint.config.js` line 26 sets `"@typescript-eslint/no-unused-vars": "off"`. This silences a valuable signal about dead code.
- Files: `eslint.config.js`
- Impact: Unused variables and imports accumulate silently.
- Fix approach: Re-enable the rule with `"warn"` severity: `"@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]`.

## Known Bugs

**`MerchCreator.tsx` is a stub with no backend integration:**
- Symptoms: `/create-merch` page has form state but no Supabase calls. Submitted designs go nowhere.
- Files: `src/pages/MerchCreator.tsx`
- Trigger: Navigating to `/create-merch` and submitting the form
- Workaround: None — the route is linked from the header

**Cypress smoke tests target wrong page text:**
- Symptoms: `smoke.cy.ts` line 7 expects `'Discover Unique Art'` but `/` renders `Shop.tsx`, not `Home.tsx`. `Home.tsx` (landing page) is at `/creators`.
- Files: `cypress/e2e/smoke.cy.ts`
- Trigger: Running `cypress run`
- Workaround: Run against `/creators` manually

**`AdminProductTable.tsx` publish/unpublish is a TODO stub:**
- Symptoms: `// TODO: Call API to update product status` at line 51 — no mutation is called
- Files: `src/components/admin/AdminProductTable.tsx:51`
- Trigger: Admin clicks publish/unpublish on a product from the admin panel
- Workaround: Use `FixedAdminProductTable.tsx` or `CleanAdminProductTable.tsx` if they have the implementation

**`OrderDetailsDialog.tsx` print and contact stubs:**
- Symptoms: Print button and contact button in artist order details are marked `// TODO`
- Files: `src/components/artist/OrderDetailsDialog.tsx:137,145`
- Trigger: Artist clicks print order or contact customer from order details dialog
- Workaround: None

## Security Considerations

**Hardcoded Paystack test key in source:**
- Risk: `src/pages/Checkout.tsx:122` falls back to a hardcoded Paystack test public key `pk_test_dcBcopgQ8gJyrVz0JzSCguKF` when `VITE_PAYSTACK_PUBLIC_KEY` is not set. If this key is the actual production test key, it could be misused.
- Files: `src/pages/Checkout.tsx:122`
- Current mitigation: The key is a publishable (not secret) key, so the exposure risk is limited
- Recommendation: Remove the fallback. Throw an error if `VITE_PAYSTACK_PUBLIC_KEY` is absent. Add it to required environment validation at startup.

**Supabase anon key and project URL committed to source:**
- Risk: `src/integrations/supabase/client.ts` commits the Supabase project URL and anon JWT directly in source code.
- Files: `src/integrations/supabase/client.ts` (lines 3–4)
- Current mitigation: The anon key is intentionally public for Supabase projects; it grants only anonymous access subject to RLS. This is an accepted Supabase pattern.
- Recommendation: Still consider moving to `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars to align with the standard pattern and allow different projects per environment. Add a note in the file clarifying intentionality.

**Sentry DSN exposed to client bundle:**
- Risk: `VITE_SENTRY_DSN` is a client-side env var and appears in the browser bundle. Sentry DSNs are intentionally public (they are for ingest, not authentication), but it is worth documenting.
- Files: `src/lib/sentry.ts`
- Current mitigation: Acceptable Sentry design. Low risk.

**`initSentry()` is never called:**
- Risk: `src/lib/sentry.ts` exports `initSentry()` but no call site exists in `src/main.tsx` or anywhere else. Error monitoring is silently inactive in production.
- Files: `src/lib/sentry.ts`, `src/main.tsx`
- Recommendation: Add `initSentry()` to `src/main.tsx` before `createRoot()`.

**Debug console.log leaks auth state:**
- Risk: `src/layouts/DashboardLayout.tsx:76` logs `user`, `isArtist`, `isAdmin`, `isSuperAdmin`, `artistStatus` on every auth state change. In production, this leaks role and identity information in the browser console.
- Files: `src/layouts/DashboardLayout.tsx:76`
- Recommendation: Remove the log statement entirely.

## Performance Bottlenecks

**No image optimisation pipeline:**
- Problem: Images are stored in Supabase Storage and served as full-resolution URLs. No CDN resizing, no `width`/`height` attributes, no `loading="lazy"` in product image lists.
- Files: `src/hooks/useProducts.ts` (`main_image_url` field), `src/components/admin/AdminProductTable.tsx`
- Cause: No Next.js image component; raw `<img>` tags with Supabase Storage URLs
- Improvement path: Add Supabase Image Transformation parameters (`?width=400&quality=80`) to image URLs at the component render layer. Add `loading="lazy"` to below-fold images.

**Realtime subscriptions on all tables, globally:**
- Problem: `useRealtimeSubscriptions` opens 5 Supabase realtime channels on every page load for every user, including anonymous shop visitors who do not need order/role/artist realtime updates.
- Files: `src/hooks/useRealtimeSubscriptions.ts`, `src/App.tsx:73`
- Cause: Hook is called unconditionally in `App`; channels are opened regardless of auth state
- Improvement path: Gate subscription creation on `user` being non-null, or move entity-specific subscriptions into their respective portal layouts.

**Currency conversion uses hardcoded exchange rates:**
- Problem: `src/context/CurrencyContext.tsx` has fixed exchange rates (NGN: 1650, GBP: 0.79). Rates are never updated.
- Files: `src/context/CurrencyContext.tsx:12–16`
- Cause: No external exchange rate API integration
- Improvement path: Fetch rates from an exchange rate API (e.g., Open Exchange Rates, ExchangeRate-API) on app load and cache in query client.

## Fragile Areas

**`AuthContext` state machine:**
- Files: `src/context/AuthContext.tsx`
- Why fragile: The `SIGNED_IN`/`INITIAL_SESSION` handler uses three local closure variables (`isSetupInProgress`, `isSetupComplete`, `isMounted`) inside a `setTimeout` to prevent deadlocks. Any change to the timing or event sequence could break login state initialisation.
- Safe modification: Only change the body of individual auth functions (signUp, signIn, etc.). Do not modify the `onAuthStateChange` handler without careful testing of all login flows.
- Test coverage: Zero automated tests

**Checkout flow (Paystack integration):**
- Files: `src/pages/Checkout.tsx`, `supabase/functions/process-payment/index.ts`
- Why fragile: Client-side amount calculation (subtotal + shipping + tax) must match the server-side order total. Currently there is no server-side validation that the client-provided amount matches what Paystack charged. Paystack `paystackData.data.amount` is the actual kobo amount, but tax and shipping recalculation on the server (`process-payment` lines 98–99) may differ from client calculation.
- Safe modification: When modifying pricing logic, change both `Checkout.tsx` and `process-payment/index.ts` in the same PR. Add a test for the amount consistency.
- Test coverage: Zero automated tests

**`DashboardLayout` auth guard with dual status checks:**
- Files: `src/layouts/DashboardLayout.tsx` (lines 51–102)
- Why fragile: Layout performs both an `AuthContext` check (`isArtist`, `isAdmin`) and a separate direct Supabase query for `artist_profiles.status`. If the two checks race or disagree, users can be incorrectly blocked or incorrectly admitted.
- Safe modification: Avoid adding more direct Supabase calls to the layout. Move artist status into `AuthContext` to consolidate the data source.
- Test coverage: Zero automated tests

## Scaling Limits

**Single-currency database (products stored in USD cents, orders in mixed):**
- Current capacity: Products have `price_cents INTEGER` and `currency TEXT DEFAULT 'USD'`; orders store `total_amount DECIMAL` with `currency TEXT DEFAULT 'USD'`. The NGN default in `CurrencyContext` conflicts with USD default in DB.
- Limit: Currency conversion is entirely client-side. If the server creates an order in NGN while the DB defaults to USD, currency reporting will be wrong.
- Scaling path: Normalise all monetary amounts to USD in the database; store the display currency separately.

**No pagination on admin tables:**
- Current capacity: `AdminUserTable`, `AdminOrdersTable`, `AdminProductTable` fetch all records without `LIMIT`/`OFFSET`. Works for small datasets.
- Limit: At 1000+ records the queries will be slow and the tables will be unusable.
- Scaling path: Use `useProductsInfiniteQuery` (already implemented in `useProductsQuery.ts`) for product tables; implement similar infinite queries for users and orders.

## Dependencies at Risk

**`react-paystack` 6.0:**
- Risk: The `react-paystack` package wraps the Paystack inline.js. Paystack may change the inline API without notice. The package has limited maintenance activity.
- Impact: Checkout breaks if Paystack deprecates the inline.js script
- Migration plan: Switch to direct Paystack Popup JS integration or use Paystack's official iframe approach

**`lovable-tagger` in dependencies:**
- Risk: `lovable-tagger` (Lovable.dev platform tool) is in `devDependencies` but also loaded conditionally in `vite.config.ts`. This is a platform-specific tool with no value outside Lovable.dev. If the project moves to standard development workflow, this becomes noise.
- Impact: None in production (development-only); could expose the project's Lovable.dev origin
- Migration plan: Remove when not actively using Lovable.dev; the conditional guard in vite.config already limits it to development mode

**Storybook 9.0 (prerelease):**
- Risk: `@storybook/react-vite` 9.0.18 and `storybook` 9.0.18 are listed alongside `@storybook/addon-essentials` 8.6.14 — a version mismatch between major versions.
- Impact: Storybook may not build correctly with mismatched major versions
- Migration plan: Align all Storybook packages to a single major version

## Missing Critical Features

**Sentry not initialised:**
- Problem: `initSentry()` is defined but never called. All production errors go uncaptured.
- Blocks: Ability to detect and diagnose production bugs
- Fix: Call `initSentry()` in `src/main.tsx` before `createRoot()`

**Payout disbursement has no implementation:**
- Problem: Artists can request payouts via `RequestPayoutDialog` but the actual fund transfer to external bank accounts has no backend implementation. The `payouts` table tracks payout records but no edge function triggers actual Paystack transfers.
- Files: `src/components/artist/RequestPayoutDialog.tsx`, `src/components/artist/PayoutDetailsDialog.tsx`
- Blocks: Artists receiving earnings from sales

**Email deliverability not confirmed:**
- Problem: `send-confirmation-email` edge function calls are made after every sign-up, but there is no error surface to the user if they fail. `AuthContext.tsx:316` catches the error with `console.error` and continues silently.
- Files: `src/context/AuthContext.tsx:316`
- Blocks: Users receiving email confirmation when the edge function fails

**No order fulfilment tracking integration:**
- Problem: Orders have `tracking_number` and `shipped_at` fields in the DB, and there is an `OrderTrackingBadge` admin component. However there is no external shipping carrier integration — tracking numbers must be manually entered via admin.
- Files: `src/components/admin/FulfillmentBoard.tsx`, `src/pages/OrderTracking.tsx`
- Blocks: Automated shipping status updates for buyers

## Test Coverage Gaps

**Checkout / payment flow:**
- What's not tested: The entire checkout → Paystack → `process-payment` edge function → order creation flow
- Files: `src/pages/Checkout.tsx`, `supabase/functions/process-payment/index.ts`
- Risk: Breaking payment = lost revenue; regression not caught before deployment
- Priority: High

**Auth flow (sign-up, sign-in, role assignment):**
- What's not tested: `AuthContext` sign-up variants, OTP verification, `assignRole` RPC call
- Files: `src/context/AuthContext.tsx`
- Risk: Broken registration or role assignment discovered only by users
- Priority: High

**Admin operations (product publish, user role changes, order status updates):**
- What's not tested: Any admin component mutation
- Files: `src/components/admin/`
- Risk: Admin data corruption not caught in CI
- Priority: High

**Artist onboarding:**
- What's not tested: `ArtistOnboarding.tsx` multi-step form, profile creation
- Files: `src/pages/ArtistOnboarding.tsx`
- Risk: Broken onboarding blocks artist acquisition
- Priority: Medium

---

*Concerns audit: 2026-06-27*
