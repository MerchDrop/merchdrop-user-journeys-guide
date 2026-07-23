# Roadmap: MerchDrop v1

## Overview

MerchDrop is built but not fully functional. Six phases take the platform from broken-but-present to production-ready: first securing the foundation (auth consistency + error visibility), then unlocking the artist dashboard (the biggest daily pain point), then enabling real payments (revenue gate), then delivering the shopper order-tracking experience, then completing the designer collaboration workflow, and finally a quality gate that catches critical-path type errors before launch.

## Phases

- [ ] **Phase 1: Foundation** - Fix auth consistency and activate Sentry so errors are visible in production
- [ ] **Phase 2: Artist Dashboard** - Wire the artist dashboard to live data so artists can see their products, orders, and revenue
- [ ] **Phase 3: Payments** - Remove the hardcoded Paystack key and verify the full checkout flow works in production mode
- [ ] **Phase 4: Shopper Order Tracking** - Give shoppers a working order status page and order history from their profile
- [ ] **Phase 5: Designer Workflow** - Complete the submit → review → approve/reject → notify pipeline for designers
- [ ] **Phase 6: Code Quality Gate** - Eliminate `: any` types on critical paths and confirm the newsletter migration is typed

## Phase Details

### Phase 1: Foundation

**Goal:** Auth signOut is consistent across all layouts and Sentry captures production errors so regressions are visible immediately.
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** AUTH-01, ERR-01, ERR-02
**Success Criteria** (what must be TRUE):

1. Signing out from the artist dashboard routes through AuthContext — no direct `supabase.auth.signOut()` calls remain in any layout
2. On app startup, Sentry is initialized and a test error thrown in dev confirms the DSN is wired
3. Auth errors (failed sign-in, role fetch failures) appear in the Sentry issues stream
4. Checkout errors and API failures surface in Sentry rather than silently vanishing

**Plans:** 3 plans

- [ ] 01-01-PLAN.md — Fix all 3 signOut call sites to use AuthContext (AUTH-01)
- [ ] 01-02-PLAN.md — Activate Sentry: add initSentry() to main.tsx and obtain DSN (ERR-01)
- [ ] 01-03-PLAN.md — Add Sentry.captureException() to all 6 error paths (ERR-02)

### Phase 2: Artist Dashboard

**Goal:** The artist dashboard displays live products, orders, revenue, and analytics instead of hardcoded empty arrays.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):

1. Artist visiting `/dashboard` sees their published drops and draft products (not an empty list)
2. Artist can read the name, item, status, and date of every order placed for their products
3. Artist can see a total revenue figure and a per-product earnings breakdown
4. Artist can view a view-count and sales-count summary for their top products
5. Artist receives a notification (in-app or email) when a new order is placed for one of their products

**Plans:** TBD
**UI hint:** yes

### Phase 3: Payments

**Goal:** Paystack is loaded exclusively from the environment variable and the checkout flow completes successfully in production mode.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** PAY-01, PAY-02
**Success Criteria** (what must be TRUE):

1. `VITE_PAYSTACK_PUBLIC_KEY` is the only key source — the hardcoded `pk_test_...` fallback no longer exists in `Checkout.tsx`
2. App startup throws a clear error (not a silent fallback) when `VITE_PAYSTACK_PUBLIC_KEY` is missing
3. A production checkout flow (non-test mode) completes end-to-end: payment confirmed → order created → cart cleared → confirmation shown

**Plans:** TBD

### Phase 4: Shopper Order Tracking

**Goal:** Shoppers can check the status and history of their orders after purchase.
**Mode:** mvp
**Depends on:** Phase 3
**Requirements:** SHOP-01, SHOP-02
**Success Criteria** (what must be TRUE):

1. After checkout, shopper can navigate to their order and see its current status and any available tracking information
2. From their profile, shopper can see a list of all past orders with item names, dates, and statuses

**Plans:** TBD
**UI hint:** yes

### Phase 5: Designer Workflow

**Goal:** The full design collaboration pipeline is functional: designer submits, admin reviews, decision is notified, and approved designs become available to artists.
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** DES-01, DES-02, DES-03, DES-04
**Success Criteria** (what must be TRUE):

1. Designer can submit a design for review through their dashboard and see it enter a "pending" state
2. Admin can approve or reject any pending design, optionally providing a reason, from the admin panel
3. Designer receives an email notification with the admin decision (approved or rejected) and any reason provided
4. Approved designs appear in the artist drop creation flow as available assets to use

**Plans:** TBD
**UI hint:** yes

### Phase 6: Code Quality Gate

**Goal:** Critical-path code shapes carry proper TypeScript types and the newsletter Supabase migration is applied and reflected in the generated types.
**Mode:** mvp
**Depends on:** Phase 5
**Requirements:** QA-01, QA-02
**Success Criteria** (what must be TRUE):

1. Auth context, checkout, and payment flow types compile with no `: any` on critical data shapes — `tsc --noEmit` passes clean on those files
2. The `newsletter_subscribers` migration is applied to the Supabase project and `types.ts` contains the generated table definition

**Plans:** TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Planned | - |
| 2. Artist Dashboard | 0/TBD | Not started | - |
| 3. Payments | 0/TBD | Not started | - |
| 4. Shopper Order Tracking | 0/TBD | Not started | - |
| 5. Designer Workflow | 0/TBD | Not started | - |
| 6. Code Quality Gate | 0/TBD | Not started | - |
