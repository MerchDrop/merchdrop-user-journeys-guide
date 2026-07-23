# MerchDrop — v1 Requirements

## v1 Requirements

### Artist Dashboard

- [ ] **DASH-01**: Artist can view their published products and draft drops on the dashboard
- [ ] **DASH-02**: Artist can view orders placed for their products (buyer name, item, status, date)
- [ ] **DASH-03**: Artist can view their total revenue and per-product earnings
- [ ] **DASH-04**: Artist can view basic analytics (views, sales count, top products)
- [ ] **DASH-05**: Artist receives in-app or email notification when a new order is placed

### Payments

- [ ] **PAY-01**: Paystack public key is loaded from `VITE_PAYSTACK_PUBLIC_KEY` environment variable with no hardcoded fallback
- [ ] **PAY-02**: Checkout flow works in production mode (not test mode)

### Error Monitoring

- [ ] **ERR-01**: Sentry `initSentry()` is called at app startup so production errors are captured
- [ ] **ERR-02**: Auth errors, checkout errors, and API failures are reported to Sentry

### Auth & Consistency

- [ ] **AUTH-01**: All signOut calls go through `AuthContext.signOut()` — no direct `supabase.auth.signOut()` calls in layouts
- [x] **AUTH-02**: After user signup, header shows profile avatar (not Sign In button)
- [x] **AUTH-03**: After user signup, user is redirected to shop (/products), not email-confirmation page

### Shopper Experience

- [ ] **SHOP-01**: Shopper can view their order status and tracking information after purchase
- [ ] **SHOP-02**: Shopper's order history is visible from their profile

### Designer Workflow

- [ ] **DES-01**: Designer can submit a design for review through their dashboard
- [ ] **DES-02**: Admin can approve or reject a submitted design with an optional reason
- [ ] **DES-03**: Designer receives email notification when their design is approved or rejected
- [ ] **DES-04**: Approved designs are visible to artists for use in their drops

### Code Quality (Critical Paths)

- [ ] **QA-01**: Auth context, checkout, and payment flows have no `: any` types on critical data shapes
- [ ] **QA-02**: `newsletter_subscribers` Supabase migration is applied and typed in `types.ts`

---

## v2 Requirements (Deferred)

- Email digest of newsletter subscribers sent monthly (cron-based)
- 80% test coverage across auth, checkout, and dashboard flows
- Artist payout request flow (manual → automated)
- Social features: follow artist, wishlist
- TypeScript cleanup across all 56 files with `: any`
- Multiple payment providers

---

## Out of Scope

- Native mobile app — web-first platform
- Internationalization — English only for v1
- Multiple storefronts per artist — single storefront per account
- Inventory management — print-on-demand model, no stock tracking needed
- Subscription / recurring revenue model — single-purchase drops only

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| DASH-01 | Phase 2 | pending |
| DASH-02 | Phase 2 | pending |
| DASH-03 | Phase 2 | pending |
| DASH-04 | Phase 2 | pending |
| DASH-05 | Phase 2 | pending |
| PAY-01 | Phase 3 | pending |
| PAY-02 | Phase 3 | pending |
| ERR-01 | Phase 1 | pending |
| ERR-02 | Phase 1 | pending |
| AUTH-01 | Phase 1 | pending |
| AUTH-02 | Phase 1 | done (this session) |
| AUTH-03 | Phase 1 | done (this session) |
| SHOP-01 | Phase 4 | pending |
| SHOP-02 | Phase 4 | pending |
| DES-01 | Phase 5 | pending |
| DES-02 | Phase 5 | pending |
| DES-03 | Phase 5 | pending |
| DES-04 | Phase 5 | pending |
| QA-01 | Phase 6 | pending |
| QA-02 | Phase 6 | pending |
