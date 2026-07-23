# MerchDrop — Project Context

## What This Is

MerchDrop (merchdrop.live) is a limited-drop merchandise platform connecting artists with fans. Artists create and publish merch drops; shoppers buy exclusive items directly from their favorite creators; designers collaborate by uploading artwork. The platform handles the full commerce cycle: drop creation → storefront → checkout → fulfillment → payouts.

**Core Value:** Artists can launch a merch drop and fans can buy from it — everything in between should just work.

## Current State

The platform is **built but not fully functional**. Core infrastructure exists (auth, routing, Supabase backend, Paystack checkout, admin dashboard), but several critical flows are broken or incomplete:

- Artist dashboard renders empty (hardcoded arrays instead of live data)
- Paystack has a hardcoded test key fallback — real payments can't flow
- Sentry is initialized but never called — production errors are invisible
- Auth flows have inconsistencies (DashboardLayout bypasses AuthContext signOut)
- Order tracking, artist notifications, and designer approval workflow are missing or incomplete

The immediate goal is **fix before grow**: make what's built actually work for all user types before adding new capabilities.

## Users

| User Type | What They Do | What's Broken Today |
|-----------|-------------|---------------------|
| **Shopper / Fan** | Browse drops, buy merch, track orders | Order tracking missing |
| **Artist** | Create drops, manage products, see orders + revenue | Dashboard shows nothing |
| **Designer** | Upload designs for artist collaboration | Approval workflow incomplete |
| **Admin** | Approve artists/designers, manage platform, view newsletter subscribers | Mostly functional |

## Tech Stack

- **Frontend:** Vite + React 18 + TypeScript + TailwindCSS + shadcn/ui
- **Routing:** React Router v6
- **Data:** TanStack Query v5 (with legacy dual-hook pattern to clean up)
- **Backend:** Supabase (Postgres, Auth, Edge Functions, RLS)
- **Payments:** Paystack
- **Error tracking:** Sentry (wired but inactive)
- **Deploy:** Vercel (implied by project structure)

## Requirements

### Validated (already exists in codebase)

- ✓ User/Artist/Designer authentication with role-based access — existing
- ✓ Artist merch drop creation and product management — exists (broken display)
- ✓ Public shop / product listing — existing
- ✓ Cart and checkout with Paystack — existing (test mode)
- ✓ Admin dashboard with artist/designer approval — existing
- ✓ Newsletter subscriber collection + admin view — added this session
- ✓ Footer, nav, terms/privacy pages — existing (audited this session)
- ✓ Email confirmation flow for signup — existing

### Active (must be built or fixed)

- [ ] Artist dashboard shows live products, orders, revenue, analytics
- [ ] Paystack key loaded from environment variable — no hardcoded fallback
- [ ] Sentry error monitoring active in production
- [ ] Auth signOut consistent across all layouts (AuthContext only)
- [ ] Order tracking page functional for shoppers
- [ ] Artist notifications for new orders/sales
- [ ] Designer approval workflow complete (submit → review → approve/reject → notify)
- [ ] TypeScript `: any` types replaced with proper types in critical paths (auth, checkout, admin)

### Out of Scope (v1)

- Native mobile app — web-first
- Multiple payment providers — Paystack only
- Test suite to 80% coverage — post-launch priority
- Social features (follows, comments) — phase 2
- Internationalization — phase 2

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix before grow | Core flows are broken; launching new features on broken infrastructure is wasteful | All active requirements are fixes or completions |
| Environment variables for Paystack | Already the right pattern in codebase — just remove the hardcoded fallback | Remove `VITE_PAYSTACK_PUBLIC_KEY \|\| 'pk_test_...'` pattern |
| AuthContext as single auth source of truth | DashboardLayout bypasses it, creating split state | All signOut calls route through AuthContext |
| Supabase for all backend | Already in use, consistent with existing patterns | No new backend services |

---

*Last updated: 2026-06-27 after initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
