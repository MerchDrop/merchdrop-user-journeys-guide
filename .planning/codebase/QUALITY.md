# Code Quality Assessment

**Analysis Date:** 2026-06-27

## Naming Conventions

**Files:**
- Pages: PascalCase (`Checkout.tsx`, `ArtistOnboarding.tsx`)
- Components: PascalCase (`HeroSection.tsx`, `AdminProductTable.tsx`)
- Hooks: camelCase with `use` prefix (`useProductsQuery.ts`, `useRealtimeSubscriptions.ts`)
- Utilities: camelCase (`queryUtils.ts`, `authErrorMessages.ts`)
- Shadcn/ui primitives: lowercase (`button.tsx`, `card.tsx`)
- Context files: PascalCase with `Context` suffix (`AuthContext.tsx`, `CartContext.tsx`)

**Functions/Hooks:**
- Data hooks: `use{Entity}` (legacy) and `use{Entity}Query` (TanStack Query)
- Mutation hooks: `use{Action}{Entity}Mutation` (e.g., `usePublishProductMutation`)
- Layout-level auth helpers: `isAdmin`, `isArtist`, `isDesigner` (boolean memos from `AuthContext`)

**Variables:**
- camelCase throughout
- Boolean state: `is` prefix (`isLoading`, `isPending`, `isProcessing`)
- No consistent convention for `UPPER_SNAKE_CASE` constants — some files use it, most don't

**Types/Interfaces:**
- Interfaces use `PascalCase` with descriptive names (`AuthContextType`, `CartItem`, `UserRole`)
- Zod-inferred types use `PascalCase` + `Input` suffix (`SignUpInput`, `SignInInput`)

## Code Style

**Formatting:**
- No Prettier config detected (no `.prettierrc`, `prettier.config.js`, or Prettier in devDependencies)
- Formatting is inconsistent — mixed indentation in some files (e.g., `App.tsx` has inconsistent route indentation at lines 99–101)

**Linting:**
- ESLint 9 with `typescript-eslint` and `eslint-plugin-react-hooks`
- `@typescript-eslint/no-unused-vars` is **turned off** in `eslint.config.js`
- React Refresh plugin enabled for HMR validation

## Import Organization

**Pattern observed:**
1. React and external library imports
2. Internal alias imports (`@/components/...`, `@/context/...`, `@/hooks/...`, `@/lib/...`)
3. No enforced sorting or grouping — order varies by file

**Path Aliases:**
- `@/` resolves to `src/` (configured in `vite.config.ts` and both tsconfig files)
- All imports should use `@/` prefix for internal modules

## TypeScript Usage

**Strengths:**
- Zod schemas generate inferred types for auth inputs (`src/lib/auth-schemas.ts`)
- Supabase client is typed via auto-generated `src/integrations/supabase/types.ts`
- Context types are fully defined (`AuthContextType`, `CartContextType`)
- Query key factory uses `as const` for type safety

**Weaknesses:**
- 155 occurrences of `: any` across 56 files — widespread type safety gaps
- Significant use in `src/hooks/useOrders.ts` (8 occurrences), `src/hooks/useProducts.ts` (7), `src/pages/Dashboard.tsx` (6)
- `social_links: any` in AuthContext `Profile` interface (`src/context/AuthContext.tsx:29`)
- `variants: any` in product types across multiple query hooks
- `completedOrder: any` in `src/pages/Checkout.tsx:27`
- `product_variant JSONB` fields typed as `any` instead of explicit interfaces

## Error Handling

**Patterns:**
- Auth operations: try/catch with Supabase error → `getAuthErrorMessage()` mapper → `toast` (radix-ui based)
- Query mutations: `onError` → `handleQueryError()` → Sonner toast
- Edge functions: try/catch returns structured `{ error: string }` JSON
- `AuthErrorBoundary` class component catches auth-layer React crashes
- Global: `window.addEventListener('unhandledrejection', ...)` in `src/main.tsx`

**Gaps:**
- Non-auth forms have no Zod validation (e.g., `ArtistOnboarding.tsx`, `ProductForm.tsx`)
- Cart operations in `CartContext` have no error feedback to the user (parse failure on `localStorage` is caught but silently continues)
- `src/pages/CleanDashboard.tsx` uses hardcoded empty arrays for data (`salesData: any[] = []`, etc.) — data never loads

## Logging

**Framework:** `console.error/log/warn` — no structured logging library

**Production concerns:**
- 141 occurrences of console calls across 47 files in `src/`
- `DashboardLayout.tsx:76` logs full auth state on every status check (security concern)
- `useRealtimeSubscriptions.ts:26,45,60,75,90,98` logs every realtime change event
- Sentry is configured in `src/lib/sentry.ts` but `initSentry()` is never called in `src/main.tsx` — **Sentry is not active**

## Function Design

**Observed sizes:**
- `AuthContext.tsx` is 717 lines — the largest single file; it handles sign-up (three variants), sign-in, sign-out, profile update, role assignment, OTP verify, OTP resend, and all state management
- `DashboardLayout.tsx` is 320 lines (sidebar + mobile drawer + header + auth guard)
- Most component files are 100–250 lines — within acceptable range

**Anti-patterns:**
- `signUp`, `signUpArtist`, `signUpDesigner` in `AuthContext` are near-identical (copy-paste with minor parameter differences) — a single `signUp(userType)` function would reduce 100+ lines of duplication

## Module Design

**Exports:**
- Default exports for pages and layout components
- Named exports for hooks, context providers, utilities
- Shadcn/ui components use named exports

**Barrel Files:**
- None detected — imports always use direct file paths
- No `index.ts` barrel files in `hooks/`, `components/`, or `pages/`

## Test Coverage

**Unit/Integration tests (Vitest):**
- `src/components/ui/__tests__/Button.test.tsx` — 5 tests for Button component
- `src/components/home/__tests__/HeroSection.test.tsx` — 3 tests for HeroSection
- `src/context/__tests__/CartContext.test.tsx` — 4 tests for CartContext
- **Total: 12 unit tests across 3 test files**
- Coverage of data hooks, admin components, checkout, and auth flows: **zero**

**E2E tests (Cypress):**
- `cypress/e2e/smoke.cy.ts` — 7 smoke tests for basic user flows
- Tests target UI text that may not match current implementation (e.g., `'Discover Unique Art'` is landing page text, but `/` now renders `Shop` not `Home`)

**Storybook:**
- `src/components/ui/Button.stories.tsx` — Button stories
- `src/components/ui/Card.stories.tsx` — Card stories
- Only 2 story files for the entire UI library

**Assessment:** Test coverage is minimal and well below the 80% target. Critical paths (auth flow, checkout, payment, admin operations) have no automated test coverage.

## Coding Conventions — Prescriptive Guide

**For new code, follow these patterns:**

**Data fetching:** Use `*Query.ts` hooks only. Example:
```typescript
// Read
const { data: products, isLoading } = useProductsQuery({ published: true });

// Mutation with optimistic update
const publishMutation = usePublishProductMutation();
await publishMutation.mutateAsync(productId);
```

**Forms:** Use React Hook Form + Zod:
```typescript
const schema = z.object({ name: z.string().min(1) });
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
```

**Auth checks in components:**
```typescript
const { isAdmin, isArtist, loading } = useAuth();
if (loading) return <Spinner />;
if (!isAdmin) return <Navigate to="/admin-auth" />;
```

**Toast notifications:**
- Use `sonner` (`toast.success`, `toast.error`) for mutation feedback via `queryUtils.ts` helpers
- Use radix-ui `useToast` only in auth flows (to maintain consistency with `AuthContext` pattern)

---

*Quality analysis: 2026-06-27*
