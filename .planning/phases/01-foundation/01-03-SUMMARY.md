---
phase: 01-foundation
plan: "03"
subsystem: error-tracking
tags: [sentry, error-boundary, auth, checkout, monitoring]
dependency_graph:
  requires: [01-01-SUMMARY.md]
  provides: [sentry-call-sites]
  affects: [src/components/auth/AuthErrorBoundary.tsx, src/pages/Checkout.tsx, src/context/AuthContext.tsx]
tech_stack:
  added: []
  patterns: [Sentry.captureException with structured tags]
key_files:
  modified:
    - src/components/auth/AuthErrorBoundary.tsx
    - src/pages/Checkout.tsx
    - src/context/AuthContext.tsx
decisions:
  - Sentry import placed as first third-party import in each file for consistent ordering
  - captureException placed before console.error and toast calls so Sentry receives the error even if later code throws
  - tags.location strings use dot-notation function path (e.g. 'AuthContext.signIn') for easy Sentry dashboard filtering
  - componentStack forwarded as extra context in AuthErrorBoundary to aid React tree debugging
metrics:
  duration: "5 minutes"
  completed: "2026-06-27"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Phase 01 Plan 03: Sentry captureException Call Sites Summary

## One-liner

Added `Sentry.captureException()` to 6 error paths across 3 files so auth and checkout failures appear in the Sentry issues stream with structured location tags.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add Sentry capture to AuthErrorBoundary and Checkout | b0ff6e6 | AuthErrorBoundary.tsx, Checkout.tsx |
| 2 | Add Sentry capture to AuthContext signIn and signUp | f3d1f6a | AuthContext.tsx |

## Changes Made

### src/components/auth/AuthErrorBoundary.tsx
- Added `import * as Sentry from '@sentry/react'` after the React import
- Added `Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } })` as the first line of `componentDidCatch`

### src/pages/Checkout.tsx
- Added `import * as Sentry from '@sentry/react'` after the React import
- Added `Sentry.captureException(error, { tags: { location: 'checkout.handlePaystackSuccess' } })` as the first line of the `handlePaystackSuccess` catch block

### src/context/AuthContext.tsx
- Added `import * as Sentry from '@sentry/react'` after the React import
- Added `Sentry.captureException(error, { tags: { location: 'AuthContext.signUp' } })` as first statement in signUp `if (error)` block
- Added `Sentry.captureException(error, { tags: { location: 'AuthContext.signUpArtist' } })` as first statement in signUpArtist `if (error)` block
- Added `Sentry.captureException(error, { tags: { location: 'AuthContext.signUpDesigner' } })` as first statement in signUpDesigner `if (error)` block
- Added `Sentry.captureException(error, { tags: { location: 'AuthContext.signIn' } })` as first statement in signIn `if (error)` block

## Verification

```
grep -rn "captureException" src/ --include="*.tsx" --include="*.ts"
```

Results: 6 lines across 3 files:
- `src/components/auth/AuthErrorBoundary.tsx:27` — 1 call
- `src/context/AuthContext.tsx:300,361,422,474` — 4 calls
- `src/pages/Checkout.tsx:98` — 1 call

TypeScript build: `node_modules/.bin/tsc --noEmit` — passes with no errors.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All call sites forward real error objects to Sentry.

## Threat Flags

No new threat surface introduced. All three files already existed; changes add outbound calls to an already-initialized Sentry SDK. Error payloads contain only Supabase error codes/messages and Paystack transaction references — no passwords, card data, or PII as documented in the plan's threat model.

## Self-Check: PASSED

- [x] src/components/auth/AuthErrorBoundary.tsx modified with 1 captureException
- [x] src/pages/Checkout.tsx modified with 1 captureException
- [x] src/context/AuthContext.tsx modified with 4 captureException calls
- [x] All 3 files import `* as Sentry from '@sentry/react'`
- [x] Total captureException count: 6 across 3 files
- [x] Commits b0ff6e6 and f3d1f6a exist in git log
- [x] TypeScript build passes with no new errors
