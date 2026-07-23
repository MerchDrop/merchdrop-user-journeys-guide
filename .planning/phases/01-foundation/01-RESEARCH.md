# Phase 1: Foundation - Research

**Researched:** 2026-06-27
**Domain:** Auth consistency (React Context), Sentry error monitoring (Vite + React)
**Confidence:** HIGH — all findings verified directly from the codebase

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | All signOut calls go through `AuthContext.signOut()` — no direct `supabase.auth.signOut()` calls in layouts | 3 call sites identified (DashboardLayout, UserProfileSettings, designer/Settings); fix is a surgical swap at each site |
| ERR-01 | Sentry `initSentry()` is called at app startup so production errors are captured | `initSentry()` exists in `src/lib/sentry.ts` and is never called; one-line fix in `src/main.tsx` |
| ERR-02 | Auth errors, checkout errors, and API failures are reported to Sentry | `AuthErrorBoundary.componentDidCatch` only logs; Checkout catch only toasts; AuthContext signIn/signUp errors not forwarded; all need `Sentry.captureException()` calls |
</phase_requirements>

---

## Summary

Phase 1 is a targeted fix phase — no new infrastructure, no new dependencies. Three requirements map to three distinct classes of code change.

**AUTH-01** requires replacing direct `supabase.auth.signOut()` calls with the `useAuth().signOut()` wrapper at exactly three locations outside of `AuthContext` itself: `DashboardLayout.tsx:301`, `UserProfileSettings.tsx:243`, and `designer/Settings.tsx:192`. The AuthContext `signOut()` wraps the same Supabase call but also shows error toasts and handles failures gracefully. The `DesignerLayout.tsx` already uses AuthContext correctly. `AdminLayout.tsx` has no sign-out UI at all.

**ERR-01** requires a single call `initSentry()` added to `src/main.tsx` before `createRoot()`. The `initSentry()` function already exists in `src/lib/sentry.ts` and is fully wired — it reads `VITE_SENTRY_DSN`, initializes `@sentry/react` with browser tracing, and filters dev events via `beforeSend`. `VITE_SENTRY_DSN` is not currently in the `.env` file; the planner must include adding it as a prerequisite step.

**ERR-02** requires adding `Sentry.captureException()` calls in three places: the `AuthErrorBoundary.componentDidCatch` method (currently only does `console.error`), the `catch` block in `Checkout.tsx:handlePaystackSuccess`, and the sign-in/sign-up error paths in `AuthContext.tsx` where `error` is non-null after Supabase auth calls.

**Primary recommendation:** Three separate tasks, one per requirement. Each is a surgical edit of 1–5 lines. Biggest risk is the Sentry DSN environment variable being absent in production — add a startup validation guard alongside the `initSentry()` call.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Auth sign-out state cleanup | Context Layer (AuthContext) | — | AuthContext owns all auth state; sign-out must clear it atomically |
| Sentry initialization | Entry Point (main.tsx) | — | Must run before React tree mounts so all errors are captured from the start |
| Error capture at boundaries | Component Layer (AuthErrorBoundary) | Context Layer (AuthContext) | Boundaries catch render errors; context catches async auth errors |
| Checkout error capture | Page Layer (Checkout.tsx) | — | Checkout owns the payment try/catch; it should report before toasting |

---

## Standard Stack

### Core (already installed — verified in package.json)
| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| `@sentry/react` | installed (exact version in package.json) | Sentry SDK for React — `captureException`, `withErrorBoundary`, `browserTracingIntegration` | [VERIFIED: src/lib/sentry.ts imports it] |
| `@supabase/supabase-js` | installed | Supabase auth client | [VERIFIED: AuthContext.tsx] |

No new packages need to be installed for this phase.

**Version verification:** Not required — no new packages are being added.

---

## Architecture Patterns

### System Architecture Diagram

```
src/main.tsx
  initSentry()   ← ERR-01: add this call
  createRoot()
    BrowserRouter
      QueryClientProvider
        App.tsx
          AuthErrorBoundary.componentDidCatch()  ← ERR-02: add captureException()
            AuthProvider (AuthContext)
              signOut()      ← AUTH-01: the canonical call site
              signIn()       ← ERR-02: add captureException() on error
              signUpXxx()    ← ERR-02: add captureException() on error
              ...
            DashboardLayout  ← AUTH-01: replace direct supabase.auth.signOut() at line 301
            DesignerLayout   ← already correct, uses useAuth().signOut()
            AdminLayout      ← no sign-out UI, no action needed
            Checkout.tsx     ← ERR-02: add captureException() in handlePaystackSuccess catch
```

### Recommended Project Structure

No structural changes needed. All edits are within existing files.

### Pattern 1: Auth sign-out via AuthContext

**What:** Replace direct Supabase call with the context wrapper.
**When to use:** Every sign-out trigger outside of AuthContext itself.

```tsx
// BEFORE (DashboardLayout.tsx:299-303)
onClick={async () => {
  await supabase.auth.signOut();
  navigate('/');
}}

// AFTER
const { signOut } = useAuth();
// ...
onClick={async () => {
  await signOut();
  navigate('/');
}}
```

`signOut()` in AuthContext (lines 489-510) calls `supabase.auth.signOut()` internally and wraps it with a destructive toast on error. The nav can still run after — `onAuthStateChange` fires `SIGNED_OUT` and clears state automatically.

### Pattern 2: Sentry initialization at entry point

**What:** Call `initSentry()` once, before React mounts.
**When to use:** App entry point (`src/main.tsx`), before `createRoot()`.

```ts
// src/main.tsx — add these two lines before createRoot()
import { initSentry } from './lib/sentry';
initSentry();
```

`initSentry()` (sentry.ts lines 3-26) already handles:
- DSN from `import.meta.env.VITE_SENTRY_DSN`
- `environment` set to `import.meta.env.MODE`
- `browserTracingIntegration()`
- `beforeSend` that returns `null` in development (so dev errors are not sent to Sentry)
- `tracesSampleRate: 1.0`

**DSN guard:** If `VITE_SENTRY_DSN` is absent, `Sentry.init()` silently no-ops (Sentry behavior). Adding a console warn for missing DSN in dev is optional but helpful.

### Pattern 3: Sentry.captureException() in catch blocks

**What:** Forward caught errors to Sentry before or after showing a toast.
**When to use:** In `catch` blocks that currently only log or toast.

```ts
// src/lib/sentry.ts already exports the Sentry namespace indirectly via @sentry/react
// Import at call site:
import * as Sentry from '@sentry/react';

// In catch block:
catch (error) {
  Sentry.captureException(error);  // add this line
  console.error('Payment processing error:', error);
  toast({ title: "...", variant: "destructive" });
}
```

### Anti-Patterns to Avoid

- **Calling `supabase.auth.signOut()` in UI components:** Bypasses AuthContext state cleanup and error toast. Always use `useAuth().signOut()`.
- **Initializing Sentry inside a React component or useEffect:** Sentry must be initialized before the React tree mounts so early rendering errors are captured. Initialize in `main.tsx`.
- **Wrapping `initSentry()` in a conditional that checks NODE_ENV:** The `beforeSend` filter inside `initSentry()` already handles filtering dev events — no extra outer guard needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error capture | Custom logging service | `Sentry.captureException()` from `@sentry/react` | Already installed; handles stack traces, context, release tracking |
| Auth state cleanup on sign-out | Manual state resets in each layout | `AuthContext.signOut()` | Context already resets all auth state via `onAuthStateChange → SIGNED_OUT` handler |
| Error boundaries | Custom class component | `SentryErrorBoundary` exported from `sentry.ts` (optional enhancement) | Already wired; `AuthErrorBoundary` can optionally be replaced or enhanced |

**Key insight:** Everything needed is already in the codebase. This phase is about activating and wiring existing infrastructure, not building new infrastructure.

---

## Common Pitfalls

### Pitfall 1: Sentry DSN is absent in .env
**What goes wrong:** `initSentry()` is called but `VITE_SENTRY_DSN` is undefined. Sentry silently no-ops. Phase 1 completes but ERR-01 is never actually active.
**Why it happens:** `.env` currently has Supabase and Paystack keys but no `VITE_SENTRY_DSN`.
**How to avoid:** The plan must include a task to add `VITE_SENTRY_DSN=<dsn>` to `.env` before the `initSentry()` call task. Verify by checking `import.meta.env.VITE_SENTRY_DSN !== undefined` in dev console after startup.
**Warning signs:** Sentry dashboard shows no events after a test error is thrown; no network request to `ingest.sentry.io` in dev tools.

### Pitfall 2: DashboardLayout signOut leaves the supabase import
**What goes wrong:** The direct `supabase.auth.signOut()` call is replaced with `useAuth().signOut()` but the `supabase` import at line 28 (`import { supabase } from '@/integrations/supabase/client'`) is left in place. The unused import triggers ESLint warnings (even though `no-unused-vars` is currently off, it will be re-enabled in Phase 6).
**Why it happens:** Surgical replacement of one line doesn't force a review of all imports.
**How to avoid:** After replacing the signOut call, check whether the `supabase` import is still needed elsewhere in `DashboardLayout.tsx`. If not, remove it. (The `checkArtistStatus` useEffect at line 53 still uses `supabase` directly, so the import IS still needed — do not remove it.)
**Warning signs:** TypeScript/ESLint warnings about unused imports.

### Pitfall 3: `beforeSend` filtering blocks verifying Sentry in development
**What goes wrong:** Developer runs the app locally, throws a test error, sees nothing in Sentry dashboard, concludes Sentry is broken. It is actually working correctly — `beforeSend` returns `null` in development mode.
**Why it happens:** `src/lib/sentry.ts:12-14` deliberately filters all dev events.
**How to avoid:** To confirm Sentry is wired in dev, temporarily comment out the `beforeSend` filter OR check the Sentry SDK's internal breadcrumbs in the console. The success criterion for ERR-01 is that production events reach Sentry, not dev events.
**Warning signs:** Empty Sentry dashboard while testing locally — expected behavior, not a bug.

### Pitfall 4: `UserProfileSettings` and `designer/Settings` account-deactivation signOut runs after a setTimeout
**What goes wrong:** These two call sites use `setTimeout(async () => { await supabase.auth.signOut(); ... }, 2000)`. Replacing the inner call is correct, but the outer `window.location.href = '/'` remains. After switching to `useAuth().signOut()`, AuthContext will trigger `onAuthStateChange → SIGNED_OUT`, which clears state and may trigger redirects before the `window.location.href = '/'` fires.
**Why it happens:** The existing pattern was written before AuthContext had a proper signOut.
**How to avoid:** After replacing `supabase.auth.signOut()` with `await signOut()`, verify that the forced `window.location.href = '/'` redirect is still needed or can be replaced by the AuthContext redirect behavior. For account deactivation (a deliberate hard redirect), keeping `window.location.href = '/'` is fine — it simply doubles up with whatever AuthContext does.
**Warning signs:** Double redirect or flicker on account deactivation flow.

---

## Code Examples

### AuthContext.signOut() — full signature

```tsx
// src/context/AuthContext.tsx:489-510
const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Sign Out Error", description: error.message, variant: "destructive" });
    }
    return { error };
  } catch (error: any) {
    toast({ title: "Sign Out Error", description: error.message, variant: "destructive" });
    return { error };
  }
};
```

Returns `{ error: AuthError | null }`. Callers can `await signOut()` and ignore the return or check it.

### DashboardLayout — current broken pattern (line 299-304)

```tsx
// CURRENT — bypasses AuthContext
<DropdownMenuItem
  onClick={async () => {
    await supabase.auth.signOut();
    navigate('/');
  }}
>
```

```tsx
// FIXED — routes through AuthContext
// Add to destructuring at line 49: const { ..., signOut } = useAuth();
<DropdownMenuItem
  onClick={async () => {
    await signOut();
    navigate('/');
  }}
>
```

Note: `supabase` import at line 28 is still used by `checkArtistStatus` — do NOT remove it.

### main.tsx — adding initSentry

```ts
// src/main.tsx — add before createRoot()
import { initSentry } from './lib/sentry';
initSentry();

createRoot(document.getElementById("root")!).render(...)
```

### Sentry.captureException in Checkout.tsx

```ts
// src/pages/Checkout.tsx:96-100 — current
} catch (error) {
  console.error('Payment processing error:', error);
  toast({ title: "Payment Processing Failed", ... });
}

// FIXED
import * as Sentry from '@sentry/react';
// ...
} catch (error) {
  Sentry.captureException(error, { tags: { location: 'checkout.handlePaystackSuccess' } });
  console.error('Payment processing error:', error);
  toast({ title: "Payment Processing Failed", ... });
}
```

### Sentry.captureException in AuthErrorBoundary

```ts
// src/components/auth/AuthErrorBoundary.tsx:25-28 — current
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  console.error('AuthErrorBoundary caught an error:', error, errorInfo);
}

// FIXED
import * as Sentry from '@sentry/react';
// ...
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  console.error('AuthErrorBoundary caught an error:', error, errorInfo);
}
```

### Sentry capture on auth signIn errors (ERR-02 — auth error stream)

```ts
// src/context/AuthContext.tsx:signIn — after error is confirmed non-null
if (error) {
  Sentry.captureException(error, { tags: { location: 'AuthContext.signIn' } });
  const errorInfo = getAuthErrorMessage(error, 'signin');
  toast({ title: errorInfo.title, description: errorInfo.message, variant: "destructive" });
}
```

Same pattern applies to `signUp`, `signUpArtist`, `signUpDesigner` error paths.

---

## Complete signOut Call Site Inventory

| File | Line | Context | Needs fix? | Notes |
|------|------|---------|------------|-------|
| `src/context/AuthContext.tsx` | 491 | AuthContext.signOut() implementation | No | This IS the canonical call |
| `src/layouts/DashboardLayout.tsx` | 301 | DropdownMenuItem onClick in top header | YES | Missing `useAuth().signOut()`; `supabase` import stays (used by checkArtistStatus) |
| `src/layouts/DesignerLayout.tsx` | 88 | `handleSignOut` function | No | Already uses `const { signOut } = useAuth()` — correct |
| `src/layouts/AdminLayout.tsx` | — | No sign-out UI present | No | AdminLayout has no sign-out button |
| `src/components/user/UserProfileSettings.tsx` | 243 | Account deactivation (setTimeout callback) | YES | Replace; `window.location.href = '/'` can remain |
| `src/pages/designer/Settings.tsx` | 192 | Account deactivation (setTimeout callback) | YES | Replace; `window.location.href = '/'` can remain |

**Summary:** 3 files need fixes. 1 file is already correct. 1 file has no sign-out.

---

## Complete Error Capture Gap Inventory (ERR-02)

| File | Location | Current behavior | Fix needed |
|------|----------|-----------------|------------|
| `src/components/auth/AuthErrorBoundary.tsx` | `componentDidCatch` (line 26) | `console.error` only | Add `Sentry.captureException(error)` |
| `src/pages/Checkout.tsx` | `handlePaystackSuccess` catch (line 96) | `console.error` + toast | Add `Sentry.captureException(error)` |
| `src/context/AuthContext.tsx` | `signIn` error path (line 469) | toast only (no console) | Add `Sentry.captureException(error)` |
| `src/context/AuthContext.tsx` | `signUp` error path (line 298) | toast only | Add `Sentry.captureException(error)` |
| `src/context/AuthContext.tsx` | `signUpArtist` error path (line 359) | toast only | Add `Sentry.captureException(error)` |
| `src/context/AuthContext.tsx` | `signUpDesigner` error path (line 419) | toast only | Add `Sentry.captureException(error)` |

**Out of scope for ERR-02:** Role fetch failures (`fetchUserRoles` returns `[]` on error silently) and the unhandledrejection handler in `main.tsx` (logs but doesn't capture to Sentry). These are improvements but not required by the success criteria.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Sentry CDN script tag | `@sentry/react` npm package with `Sentry.init()` | Already using current approach |
| Manual error boundaries | `Sentry.withErrorBoundary` HOC | `SentryErrorBoundary` is exported from sentry.ts but not used — optional enhancement |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `VITE_SENTRY_DSN` is not in `.env` and needs to be added before Sentry becomes functional | Standard Stack / Pitfall 1 | LOW risk — `.env` was read directly and confirms absence; user must supply the DSN value |
| A2 | `designer/Settings.tsx` account deactivation signOut is in scope for AUTH-01 | Call Site Inventory | MEDIUM — AUTH-01 says "no direct calls in layouts"; Settings.tsx is a page, not a layout; however it is still a direct bypass and fixing it is consistent with the intent |

---

## Open Questions

1. **Should the `window.unhandledrejection` handler in `main.tsx` also call `captureException`?**
   - What we know: Line 31-33 of `main.tsx` logs unhandled rejections to console but does not forward to Sentry
   - What's unclear: Whether this is in scope for ERR-02 or deferred
   - Recommendation: Add it — it is a 1-line change and completes the error coverage

2. **Is `designer/Settings.tsx:192` in scope for AUTH-01?**
   - What we know: AUTH-01 says "no direct `supabase.auth.signOut()` calls in layouts"; Settings.tsx is a page, not a layout
   - Recommendation: Fix it anyway — the intent is clearly "no bypasses", and it is a trivial change

3. **Does the Sentry DSN need to be provisioned (Sentry project created) or does one already exist?**
   - What we know: `VITE_SENTRY_DSN` is referenced in code but absent from `.env`
   - Recommendation: Ask user or check Sentry dashboard — if no project exists, the plan must include a prerequisite "create Sentry project and obtain DSN" manual step

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@sentry/react` npm package | ERR-01, ERR-02 | Yes | Installed in node_modules | — |
| `VITE_SENTRY_DSN` env var | ERR-01 | No | — | None — must be added before initSentry() is effective |

**Missing dependencies with no fallback:**
- `VITE_SENTRY_DSN` — Sentry will silently no-op without this. Planner must include a task to obtain the DSN and add it to `.env` (and Vercel environment variables for production).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Cypress (E2E, existing) + Vitest (unit, if configured) |
| Config file | `cypress.config.ts` (E2E); check for vitest.config.ts |
| Quick run command | `npx cypress run --spec cypress/e2e/smoke.cy.ts` |
| Full suite command | `npx cypress run` |

Note: `cypress/e2e/smoke.cy.ts` targets wrong page text (known bug in CONCERNS.md). Manual verification is the primary validation approach for this phase.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Sign-out from DashboardLayout uses AuthContext | manual smoke | navigate to `/dashboard`, click sign out, verify redirect + no errors | — |
| AUTH-01 | No direct `supabase.auth.signOut()` outside AuthContext | static grep | `grep -r "supabase.auth.signOut" src/ --include="*.tsx" --include="*.ts"` | N/A |
| ERR-01 | Sentry initializes on app startup | manual | Open network tab, verify request to `sentry.io` on load (or check Sentry dashboard) | — |
| ERR-02 | Auth errors appear in Sentry | manual | Attempt sign-in with wrong password; check Sentry issues stream | — |
| ERR-02 | Checkout errors appear in Sentry | manual | Mock a Supabase function error and confirm Sentry event | — |

### Sampling Rate
- **Per task commit:** `grep -r "supabase.auth.signOut" src/ --include="*.tsx" --include="*.ts"` should return only `AuthContext.tsx:491`
- **Phase gate:** Manual Sentry verification (event appears in dashboard) before marking complete

### Wave 0 Gaps
- No new test files are needed — this phase has no logic to unit-test. Grep-based static verification and manual Sentry dashboard checks are the appropriate validation methods.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Supabase auth (existing) — AUTH-01 ensures sign-out clears all auth state |
| V3 Session Management | yes | AuthContext `SIGNED_OUT` handler clears session, user, profile, roles atomically |
| V5 Input Validation | no | No new input surfaces |
| V6 Cryptography | no | Not applicable |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Stale auth state after sign-out (split state) | Spoofing | Route all sign-out through AuthContext to ensure all state is cleared |
| Sentry DSN in client bundle | Information Disclosure | Accepted Sentry design — DSN is ingest-only, not authentication; document in code |

---

## Sources

### Primary (HIGH confidence)
- `src/context/AuthContext.tsx` — full signOut implementation read directly
- `src/lib/sentry.ts` — full initSentry() implementation read directly
- `src/main.tsx` — confirmed initSentry() is absent
- `src/layouts/DashboardLayout.tsx` — confirmed direct supabase.auth.signOut() at line 301
- `src/layouts/AdminLayout.tsx` — confirmed no sign-out UI
- `src/layouts/DesignerLayout.tsx` — confirmed already uses AuthContext signOut
- `src/components/user/UserProfileSettings.tsx` — confirmed direct call at line 243
- `src/pages/designer/Settings.tsx` — confirmed direct call at line 192
- `src/pages/Checkout.tsx` — confirmed catch block only logs/toasts, no Sentry
- `src/components/auth/AuthErrorBoundary.tsx` — confirmed componentDidCatch only logs
- `.env` — confirmed VITE_SENTRY_DSN is absent
- `.planning/codebase/ARCHITECTURE.md` — architecture overview
- `.planning/codebase/CONCERNS.md` — known bugs and security notes

### Secondary (MEDIUM confidence)
- `@sentry/react` API pattern (captureException, init) — [ASSUMED: standard Sentry SDK API; consistent with what sentry.ts already uses]

---

## Metadata

**Confidence breakdown:**
- Call site inventory: HIGH — all files read directly; grep confirmed 3 non-AuthContext call sites
- Sentry activation: HIGH — sentry.ts and main.tsx both read directly; absence of initSentry() call confirmed
- ERR-02 gaps: HIGH — all relevant catch blocks and error paths read directly
- Environment variable gap: HIGH — .env read directly; VITE_SENTRY_DSN not present

**Research date:** 2026-06-27
**Valid until:** 2026-07-27 (stable codebase, no external API changes)
