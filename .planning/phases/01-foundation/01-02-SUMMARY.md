---
phase: 01-foundation
plan: 02
subsystem: error-monitoring
tags: [sentry, initialization, app-entry]
dependency_graph:
  requires: [src/lib/sentry.ts]
  provides: [sentry-active-at-runtime]
  affects: [src/main.tsx]
tech_stack:
  added: []
  patterns: [sentry-init-before-react-mount]
key_files:
  created: []
  modified: [src/main.tsx]
decisions:
  - "initSentry() placed after window.addEventListener('unhandledrejection') block and before createRoot() to ensure Sentry captures all React render errors"
  - "No conditional guard added around initSentry() — beforeSend filter inside sentry.ts handles dev vs. production filtering"
metrics:
  duration: "~5 minutes"
  completed: 2026-06-27
  tasks_completed: 1
  tasks_total: 2
  files_modified: 1
---

# Phase 01 Plan 02: Sentry Initialization in main.tsx — Summary

**One-liner:** Activated Sentry error monitoring by wiring `initSentry()` into `src/main.tsx` before `createRoot()`, so all React render errors and unhandled rejections are captured in production via the DSN already set in `.env`.

## Tasks Completed

| Task | Type | Status | Commit |
|------|------|--------|--------|
| Task 1: Obtain Sentry DSN and add to .env | checkpoint:human-action | Completed by user | N/A |
| Task 2: Call initSentry() in main.tsx before createRoot() | auto | Complete | efad4de |

## What Was Built

### Task 2 — src/main.tsx

Two lines added to `src/main.tsx`:

1. Import after existing imports (line 7):
   ```ts
   import { initSentry } from './lib/sentry'
   ```

2. Call immediately before `createRoot(...)` (line 36):
   ```ts
   initSentry();
   ```

Final call order in the file:
- Existing imports
- `import { initSentry } from './lib/sentry'`
- `const queryClient = new QueryClient(...)`
- `window.addEventListener('unhandledrejection', ...)`
- `initSentry();`  ← new
- `createRoot(...).render(...)`

## Verification Results

- `grep -n "initSentry" src/main.tsx` → 2 lines (import + call) confirmed
- `initSentry()` call appears at line 36, `createRoot(...)` at line 38 — correct ordering
- `.env` contains `VITE_SENTRY_DSN=https://...` (set by user in Task 1)
- `tsc --noEmit` — no new TypeScript errors

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced. DSN exposure is accepted per the plan's threat model (T-02-01: ingest-only, write-only, not a secret).

## Known Stubs

None — `initSentry()` is fully wired. `src/lib/sentry.ts` was already complete (implemented in a prior plan); this plan only activates it at the entry point.

## Self-Check: PASSED

- [x] `src/main.tsx` modified with 2 new lines (import + call)
- [x] Commit `efad4de` exists: `feat(01-02): call initSentry() in main.tsx before createRoot`
- [x] `tsc --noEmit` passes with no new errors
- [x] `.env` contains `VITE_SENTRY_DSN`
- [x] `initSentry()` appears before `createRoot(...)` in main.tsx
