# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-27)

**Core value:** Artists can launch a merch drop and fans can buy from it — everything in between should just work.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 6 (Foundation)
Plan: — (not yet planned)
Status: Ready to plan
Last activity: 2026-06-27 — Roadmap created; AUTH-02 and AUTH-03 completed this session

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:** —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Session init: AUTH-02 (header shows avatar after signup) and AUTH-03 (post-signup redirect to /products) marked done
- Arch: All signOut calls must route through AuthContext — DashboardLayout.tsx:301 is the known offender
- Arch: `initSentry()` must be called in `src/main.tsx` before `createRoot()` — currently never called
- Arch: Use only `*Query.ts` hooks for all new and updated code — legacy `use*.ts` hooks are being superseded

### Pending Todos

None yet.

### Blockers/Concerns

- CONCERNS.md flags `CleanDashboard.tsx` renders empty hardcoded arrays — core fix for Phase 2
- `DashboardLayout` has a dual status-check race (AuthContext + direct Supabase query) — fragile, noted for Phase 2 planning
- Checkout amount calculation on client vs server must stay in sync when modifying pricing logic (Phase 3)

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| v2 | Email digest of newsletter subscribers (cron) | Deferred | init |
| v2 | 80% test coverage | Deferred | init |
| v2 | Artist payout request flow (automated) | Deferred | init |
| v2 | Social features (follow artist, wishlist) | Deferred | init |

## Session Continuity

Last session: 2026-06-27
Stopped at: Roadmap created, ready to plan Phase 1
Resume file: None
