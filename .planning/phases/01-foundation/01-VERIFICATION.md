---
phase: 01-foundation
verified: 2026-06-27T00:00:00Z
status: human_needed
score: 3/4 must-haves verified
overrides_applied: 0
requirements_checked:
  - AUTH-01
  - ERR-01
  - ERR-02
human_verification:
  - test: "Confirm Sentry receives events in production: deploy to production (or staging), attempt sign-in with a wrong password, then check the Sentry issues dashboard within 60 seconds for an event with tags.location = 'AuthContext.signIn'"
    expected: "A new Sentry issue appears with the AuthError type and the location tag identifying the function"
    why_human: "beforeSend in sentry.ts drops all events when MODE === 'development', so no automated or local verification of event delivery is possible. Confirming DSN wiring and event ingestion requires a production deploy."
  - test: "Confirm VITE_SENTRY_DSN is set as a production environment variable in Vercel: open Vercel Dashboard → Project → Settings → Environment Variables, verify VITE_SENTRY_DSN is present with scope 'Production'"
    expected: "Variable exists with a valid https:// DSN value scoped to Production"
    why_human: "The .env file contains the DSN locally, but whether it is set in the Vercel production environment can only be confirmed through the Vercel UI or Vercel CLI — not from the codebase."
gaps:
  - truth: "Auth errors (failed sign-in, role fetch failures) appear in the Sentry issues stream"
    status: partial
    reason: "sign-in, signUp, signUpArtist, signUpDesigner errors are captured. Role fetch failures are not: fetchUserRoles() swallows errors silently (returns [] on error at line 112-113) and fetchSuperAdminStatus() swallows errors silently (returns false on error at line 122-123). Neither calls Sentry.captureException. The loadUserData() catch at line 196 also swallows all errors without capture."
    artifacts:
      - path: "src/context/AuthContext.tsx"
        issue: "fetchUserRoles (lines 112-113) and fetchSuperAdminStatus (lines 122-123) silently return on error with no Sentry.captureException call. loadUserData catch (line 196) is also uncaptured."
    missing:
      - "Add Sentry.captureException(error, { tags: { location: 'AuthContext.fetchUserRoles' } }) inside fetchUserRoles when error is truthy"
      - "Add Sentry.captureException(error, { tags: { location: 'AuthContext.fetchSuperAdminStatus' } }) inside fetchSuperAdminStatus when error is truthy"
      - "Optionally capture in loadUserData catch if upstream functions do not already capture"
---

# Phase 1: Foundation Verification Report

**Phase Goal:** Auth signOut is consistent across all layouts and Sentry captures production errors so regressions are visible immediately.
**Verified:** 2026-06-27
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Signing out from the artist dashboard routes through AuthContext — no direct `supabase.auth.signOut()` calls remain in any layout | VERIFIED | `grep -rn "supabase\.auth\.signOut" src/` returns exactly one match: `src/context/AuthContext.tsx:496`. DashboardLayout.tsx:49 adds `signOut` to `useAuth()` destructure; handler at line 301 calls `await signOut()`. UserProfileSettings.tsx:44 and designer/Settings.tsx:31 both destructure `signOut` from `useAuth()` and call it in their setTimeout callbacks. |
| 2 | On app startup, Sentry is initialized and a test error thrown in dev confirms the DSN is wired | PARTIAL — HUMAN NEEDED | `initSentry()` is called at `src/main.tsx:36`, before `createRoot()` at line 38. `VITE_SENTRY_DSN` is set in `.env` (line 5, valid `https://` DSN). However, no test error is thrown in dev mode anywhere in the codebase to confirm DSN wiring. More critically, `beforeSend` in `src/lib/sentry.ts` returns `null` for all dev events (line 13), so no dev verification of event delivery is possible — this requires production confirmation. |
| 3 | Auth errors (failed sign-in, role fetch failures) appear in the Sentry issues stream | PARTIAL — GAP | `Sentry.captureException` is present for signIn (AuthContext.tsx:474), signUp (line 300), signUpArtist (line 361), signUpDesigner (line 422). **Role fetch failures are not captured**: `fetchUserRoles` at lines 112-113 silently returns `[]` on error; `fetchSuperAdminStatus` at lines 122-123 silently returns `false` on error; `loadUserData` catch at line 196 swallows all upstream errors. The ROADMAP SC explicitly names "role fetch failures" as a required coverage target. |
| 4 | Checkout errors and API failures surface in Sentry rather than silently vanishing | VERIFIED | `src/pages/Checkout.tsx:98` has `Sentry.captureException(error, { tags: { location: 'checkout.handlePaystackSuccess' } })` as the first line of the catch block. `AuthErrorBoundary.tsx:27` has `Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } })` in `componentDidCatch`. Both files import `* as Sentry from '@sentry/react'`. |

**Score:** 2/4 truths fully verified (SC1 and SC4 verified; SC2 and SC3 not fully verified)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/layouts/DashboardLayout.tsx` | Sign-out routed through AuthContext | VERIFIED | Line 49: `signOut` in `useAuth()` destructure. Line 301: `await signOut()` in DropdownMenuItem handler. Zero `supabase.auth.signOut` calls remain. |
| `src/components/user/UserProfileSettings.tsx` | Account deactivation sign-out routed through AuthContext | VERIFIED | Line 44: `signOut` in `useAuth()` destructure. Line 243: `await signOut()` in setTimeout callback. `window.location.href = '/'` preserved. |
| `src/pages/designer/Settings.tsx` | Account deactivation sign-out routed through AuthContext | VERIFIED | Line 31: `signOut` in `useAuth()` destructure. Line 192: `await signOut()` in setTimeout callback. `window.location.href = '/'` preserved. |
| `src/main.tsx` | Sentry initialization at app entry point | VERIFIED | Line 7: `import { initSentry } from './lib/sentry'`. Line 36: `initSentry()` called before `createRoot()` at line 38. |
| `.env` | Sentry DSN environment variable | VERIFIED | Line 5: `VITE_SENTRY_DSN="https://9878f5bfa011eb4f8737a265dba96e03@o4511637435514880.ingest.de.sentry.io/4511637445804112"`. Valid `https://` DSN present. |
| `src/components/auth/AuthErrorBoundary.tsx` | Sentry error capture in componentDidCatch | VERIFIED | Line 2: `import * as Sentry from '@sentry/react'`. Line 27: `Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } })` as first statement in `componentDidCatch`. |
| `src/pages/Checkout.tsx` | Sentry error capture in handlePaystackSuccess catch block | VERIFIED | Line 2: `import * as Sentry from '@sentry/react'`. Line 98: `Sentry.captureException(error, { tags: { location: 'checkout.handlePaystackSuccess' } })` as first line of catch block. |
| `src/context/AuthContext.tsx` | Sentry error capture in signIn and signUp error paths | PARTIAL | Line 2: `import * as Sentry from '@sentry/react'`. captureException present at lines 300 (signUp), 361 (signUpArtist), 422 (signUpDesigner), 474 (signIn). Missing: no capture in fetchUserRoles (lines 112-113), fetchSuperAdminStatus (lines 122-123), or loadUserData catch (line 196). |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| DashboardLayout.tsx DropdownMenuItem onClick | AuthContext.signOut() | `useAuth()` destructure | WIRED | Line 49 destructures `signOut`; line 301 calls `await signOut()` |
| UserProfileSettings.tsx setTimeout callback | AuthContext.signOut() | `useAuth()` destructure | WIRED | Line 44 destructures `signOut`; line 243 calls `await signOut()` |
| designer/Settings.tsx setTimeout callback | AuthContext.signOut() | `useAuth()` destructure | WIRED | Line 31 destructures `signOut`; line 192 calls `await signOut()` |
| src/main.tsx | src/lib/sentry.ts | `import { initSentry } from './lib/sentry'` | WIRED | Import at line 7; call `initSentry()` at line 36 before `createRoot()` at line 38 |
| AuthErrorBoundary.componentDidCatch | Sentry.captureException | `import * as Sentry from '@sentry/react'` | WIRED | captureException at line 27 with componentStack in extra |
| Checkout.handlePaystackSuccess catch | Sentry.captureException | `import * as Sentry from '@sentry/react'` | WIRED | captureException at line 98 as first statement in catch |
| AuthContext signIn/signUp error paths | Sentry.captureException | `import * as Sentry from '@sentry/react'` | PARTIAL | 4 call sites wired (signIn, signUp, signUpArtist, signUpDesigner). fetchUserRoles and fetchSuperAdminStatus error paths are NOT wired to Sentry. |

---

## Data-Flow Trace (Level 4)

Not applicable — this phase produces error-capture side effects, not components that render dynamic data. No data-flow trace is required.

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| No `supabase.auth.signOut()` outside AuthContext | `grep -rn "supabase\.auth\.signOut" src/` | 1 match: `AuthContext.tsx:496` only | PASS |
| `initSentry()` called before `createRoot()` in main.tsx | file read lines 36 and 38 | `initSentry()` at line 36, `createRoot()` at line 38 | PASS |
| `captureException` count across codebase | `grep -rn "captureException" src/` | 6 matches across 3 files | PASS |
| All 3 Sentry-modified files import `@sentry/react` | `grep -n "from '@sentry/react'"` on each file | All 3 files confirmed with `import * as Sentry` | PASS |
| Sentry events delivered to dashboard (production) | Cannot verify — `beforeSend` drops all dev events | N/A | SKIP — human needed |
| Role fetch failures captured in Sentry | `grep -n "captureException" src/context/AuthContext.tsx` around lines 105-127 | No match in fetchUserRoles or fetchSuperAdminStatus | FAIL |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| AUTH-01 | 01-01-PLAN.md | All signOut calls go through `AuthContext.signOut()` — no direct `supabase.auth.signOut()` calls in layouts | SATISFIED | Zero `supabase.auth.signOut` calls outside AuthContext.tsx. All 3 call sites use `signOut()` from `useAuth()`. |
| ERR-01 | 01-02-PLAN.md | Sentry `initSentry()` is called at app startup so production errors are captured | SATISFIED (code) / HUMAN NEEDED (production) | `initSentry()` called in main.tsx before React mounts. VITE_SENTRY_DSN present in .env. Production delivery unverifiable without deploy. |
| ERR-02 | 01-03-PLAN.md | Auth errors, checkout errors, and API failures are reported to Sentry | PARTIAL | 6 call sites added across 3 files. Role fetch failures (fetchUserRoles, fetchSuperAdminStatus) are NOT reported to Sentry despite being named in ROADMAP SC3. |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/context/AuthContext.tsx` | 112-113 | `if (error) return [];` — role fetch errors swallowed silently, no Sentry capture | WARNING | Role fetch failures are invisible to Sentry despite ROADMAP explicitly requiring "role fetch failures" to appear in the issues stream |
| `src/context/AuthContext.tsx` | 122-123 | `if (error) return false;` — super-admin status errors swallowed silently, no Sentry capture | WARNING | Same as above — silent failure path uncovered by Sentry |
| `src/context/AuthContext.tsx` | 196 | `catch { // non-fatal — state remains at previous values }` — no Sentry capture in loadUserData catch | INFO | Upstream functions handle their own errors, but the catch-all comment marks this as intentional; however at minimum fetchUserRoles errors should reach Sentry |

---

## Human Verification Required

### 1. Sentry Event Delivery — Production Confirmation

**Test:** Deploy the current build to production (or Vercel preview with production env vars). Load the app. Attempt sign-in with a deliberately wrong password. Wait up to 60 seconds.
**Expected:** A new issue appears in the Sentry issues dashboard with type AuthError and `tags.location = 'AuthContext.signIn'`.
**Why human:** `beforeSend` in `src/lib/sentry.ts` returns `null` for all events when `import.meta.env.MODE === 'development'`, blocking any local verification. Event delivery can only be confirmed against a production or production-env-var preview deployment.

### 2. Vercel Production Environment Variable

**Test:** Open Vercel Dashboard → select the merchdrop project → Settings → Environment Variables. Confirm `VITE_SENTRY_DSN` is present with scope "Production" and contains the same `https://` DSN value from `.env`.
**Expected:** Variable exists, is scoped to Production, value starts with `https://`.
**Why human:** The plan's Task 1 (human-action checkpoint) required the user to add the DSN to Vercel. Whether this was done cannot be verified from the codebase — `.env` is local only and is not committed to the repository.

---

## Gaps Summary

**One confirmed gap** blocks full verification of SC3 (role fetch failures in Sentry):

`fetchUserRoles()` at lines 105-117 and `fetchSuperAdminStatus()` at lines 119-127 in `src/context/AuthContext.tsx` both swallow errors silently — returning empty arrays or `false` without calling `Sentry.captureException`. The ROADMAP success criterion 3 explicitly names "role fetch failures" alongside "failed sign-in" as errors that must appear in the Sentry issues stream. The sign-in capture is present; the role fetch capture is missing.

**Root cause:** Plan 01-03 targeted signIn, signUp, signUpArtist, signUpDesigner, AuthErrorBoundary, and Checkout — six paths. It did not include the role-loading paths `fetchUserRoles` and `fetchSuperAdminStatus` despite the ROADMAP naming "role fetch failures" as a required coverage target.

**Fix scope:** Two `Sentry.captureException` calls in `src/context/AuthContext.tsx` — one in the `fetchUserRoles` error branch and one in the `fetchSuperAdminStatus` error branch.

**Two human verification items** prevent a `passed` status even with the gap resolved: production Sentry event delivery and Vercel environment variable confirmation must be done by a human after deployment.

---

## Commits Verified

| Commit | Plan | Description | Status |
|--------|------|-------------|--------|
| `6dcb0f0` | 01-01 | Route DashboardLayout signOut through AuthContext | Confirmed in git log |
| `42a5eea` | 01-01 | Route UserProfileSettings and designer/Settings signOut through AuthContext | Confirmed in git log |
| `b0ff6e6` | 01-03 | Add Sentry capture to AuthErrorBoundary and Checkout | Confirmed in git log |
| `f3d1f6a` | 01-03 | Add Sentry capture to AuthContext signIn and signUp error paths | Confirmed in git log |
| `efad4de` | 01-02 | Call initSentry() in main.tsx before createRoot | Confirmed in git log |

---

_Verified: 2026-06-27_
_Verifier: Claude (gsd-verifier)_
