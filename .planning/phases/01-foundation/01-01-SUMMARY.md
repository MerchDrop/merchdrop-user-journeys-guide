---
phase: 01-foundation
plan: "01"
subsystem: auth
tags: [auth, signout, authcontext, security]
dependency_graph:
  requires: []
  provides: [AUTH-01]
  affects: [DashboardLayout, UserProfileSettings, designer/Settings]
tech_stack:
  added: []
  patterns: [AuthContext as single auth source of truth]
key_files:
  created: []
  modified:
    - src/layouts/DashboardLayout.tsx
    - src/components/user/UserProfileSettings.tsx
    - src/pages/designer/Settings.tsx
decisions:
  - "signOut must always route through AuthContext.signOut() to guarantee onAuthStateChange SIGNED_OUT fires and clears user/session/profile/roles atomically"
  - "supabase import retained in DashboardLayout.tsx and UserProfileSettings.tsx — both files still use supabase for non-auth calls"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-27"
  tasks_completed: 2
  files_modified: 3
---

# Phase 1 Plan 01: Fix signOut call sites to route through AuthContext

All three `supabase.auth.signOut()` call sites outside AuthContext.tsx replaced with `signOut()` from `useAuth()` destructure, ensuring sign-out always goes through the AuthContext wrapper that handles error toasts and atomic state clearing via `onAuthStateChange`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix DashboardLayout sign-out call site | 6dcb0f0 | src/layouts/DashboardLayout.tsx |
| 2 | Fix UserProfileSettings and designer/Settings sign-out call sites | 42a5eea | src/components/user/UserProfileSettings.tsx, src/pages/designer/Settings.tsx |

## Changes Made

### Task 1 — DashboardLayout.tsx

- Added `signOut` to `useAuth()` destructure (line 49)
- Replaced `await supabase.auth.signOut()` with `await signOut()` in the DropdownMenuItem onClick handler
- `supabase` import retained (still used by `checkArtistStatus` effect querying `artist_profiles`)

### Task 2 — UserProfileSettings.tsx

- Added `signOut` to `useAuth()` destructure (line 44)
- Replaced `await supabase.auth.signOut()` in the account deactivation `setTimeout` callback
- `supabase` import retained (used by other calls: lines 109, 163, 195, 229, 284-297)
- `window.location.href = '/'` hard redirect preserved for account deactivation flow

### Task 2 — designer/Settings.tsx

- Added `signOut` to `useAuth()` destructure (line 31)
- Replaced `await supabase.auth.signOut()` in the account deactivation `setTimeout` callback
- `window.location.href = '/'` hard redirect preserved for account deactivation flow

## Verification

Acceptance gate passed:
```
grep -rn "supabase\.auth\.signOut" src/ --include="*.tsx" --include="*.ts"
src/context/AuthContext.tsx:491:      const { error } = await supabase.auth.signOut();
```
Exactly one result — the canonical implementation in AuthContext.tsx only.

TypeScript build: `bun tsc --noEmit` — no errors.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — no stub patterns introduced.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. All three threat mitigations from the plan's STRIDE register are now in place:
- T-01-01: DashboardLayout sign-out routes through AuthContext
- T-01-02: UserProfileSettings account deactivation routes through AuthContext
- T-01-03: designer/Settings account deactivation routes through AuthContext

## Self-Check: PASSED

- src/layouts/DashboardLayout.tsx — modified, committed at 6dcb0f0
- src/components/user/UserProfileSettings.tsx — modified, committed at 42a5eea
- src/pages/designer/Settings.tsx — modified, committed at 42a5eea
- Acceptance gate: exactly 1 `supabase.auth.signOut` in codebase (AuthContext.tsx)
- TypeScript build: clean
