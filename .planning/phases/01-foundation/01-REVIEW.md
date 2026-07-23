---
phase: 01-foundation
reviewed: 2026-06-27T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/layouts/DashboardLayout.tsx
  - src/components/user/UserProfileSettings.tsx
  - src/pages/designer/Settings.tsx
  - src/main.tsx
  - src/components/auth/AuthErrorBoundary.tsx
  - src/pages/Checkout.tsx
  - src/context/AuthContext.tsx
findings:
  critical: 2
  warning: 4
  info: 3
  total: 9
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-06-27T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

This review covers the Phase 1 foundation changes: routing sign-out calls through `useAuth().signOut()`, adding Sentry initialization in `main.tsx`, and adding `Sentry.captureException()` calls in `AuthErrorBoundary`, `Checkout`, and `AuthContext`.

The three targeted sign-out call sites (`DashboardLayout`, `UserProfileSettings`, `designer/Settings`) correctly use `useAuth().signOut()`. The Sentry import structure is sound. However, two critical issues were found: a hardcoded Paystack test API key in `Checkout.tsx`, and Sentry configured to silently drop **all** events in development — meaning engineers can never verify Sentry integration locally. Four warnings were identified covering a navigate-after-signOut race, a missed sign-out error path, a `supabase` import retained in `DashboardLayout` despite the sign-out migration, and multiple `console.log` debug statements leaking user identity data. Three informational items round out the report.

---

## Critical Issues

### CR-01: Hardcoded Paystack Test API Key

**File:** `src/pages/Checkout.tsx:124`
**Issue:** A real Paystack test key (`pk_test_dcBcopgQ8gJyrVz0JzSCguKF`) is hardcoded as the fallback when `VITE_PAYSTACK_PUBLIC_KEY` is not set. This key is now committed to the repository. Even though it is a test key today, the same fallback pattern will almost certainly be copied for the production key in future, and the key itself can be used to authenticate against Paystack's API to gather transaction metadata about this account. Per the project's security rules, no credentials — including publishable keys — may be hardcoded in source.

**Fix:**
```typescript
// Remove the hardcoded fallback. Fail loudly at startup instead.
const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
if (!paystackPublicKey) {
  throw new Error('VITE_PAYSTACK_PUBLIC_KEY is not configured');
}

const paystackConfig = {
  reference: new Date().getTime().toString(),
  email: formData.email,
  amount: Math.round(total * 100),
  currency: currency,
  publicKey: paystackPublicKey,
};
```

---

### CR-02: Sentry `beforeSend` Silences All Development Events — Integration Is Unverifiable

**File:** `src/lib/sentry.ts:11-15`
**Issue:** The `beforeSend` hook returns `null` for every event when `MODE === 'development'`. This means no Sentry event ever reaches the server during local development or in any non-production environment. The consequence is that the new `Sentry.captureException()` calls in `AuthErrorBoundary`, `Checkout`, and `AuthContext` cannot be tested or confirmed to work before the code reaches production. If the DSN is wrong, the import path broken, or a call site passes the wrong argument shape, it will be invisible until production traffic hits it.

Additionally, `tracesSampleRate: 1.0` is set unconditionally, meaning 100% of production transactions are sent to Sentry. This is fine for low-traffic apps but should be an explicit decision.

**Fix:**
```typescript
export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    // Send all errors in dev so integration can be verified.
    // Reduce sample rate in production to control volume.
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 1.0,
    // Remove the beforeSend null-return for development, or replace with
    // a console.warn so developers see what would be sent:
    beforeSend(event) {
      if (import.meta.env.MODE === 'development') {
        console.warn('[Sentry] Would capture event:', event);
        // Return the event to actually send it, or null to suppress + log only.
        return event; // change to null if you only want local logging
      }
      return event;
    },
  });
};
```

---

## Warnings

### WR-01: `navigate('/')` After `signOut()` Can Execute on an Unmounted Component

**File:** `src/layouts/DashboardLayout.tsx:300-304`
**Issue:** The sign-out handler in the header dropdown calls `await signOut()` and then immediately calls `navigate('/')`. `signOut()` triggers Supabase's `onAuthStateChange` event (`SIGNED_OUT`), which sets `user` to `null` in `AuthContext`. The `useEffect` in `DashboardLayout` (line 75) reacts to this by also calling `navigate('/artist-auth', { replace: true })`. Two competing navigations fire in the same event loop tick. The component may also attempt a second `navigate` call after it has been unmounted by the first redirect. This is a timing race that is environment-sensitive and can surface as "Cannot update a component (`Router`) while rendering a different component" warnings or double-navigation flashes.

**Fix:**
```tsx
// In the onClick handler, rely solely on the AuthContext SIGNED_OUT
// listener to handle navigation. The useEffect already redirects to
// '/artist-auth' when user becomes null. Remove the manual navigate call:
<DropdownMenuItem
  onClick={async () => {
    await signOut();
    // Navigation handled by the useEffect that watches `user`.
  }}
>
  <span>Sign Out</span>
</DropdownMenuItem>
```
If navigation to `/` (home) rather than `/artist-auth` is intentional after sign-out, update the `useEffect` redirect target instead of navigating twice.

---

### WR-02: Sign-Out Error Is Not Surfaced to the User in `UserProfileSettings` Account Deactivation

**File:** `src/components/user/UserProfileSettings.tsx:242-245`
**Issue:** After setting `account_status: 'suspended'`, the code calls `await signOut()` inside a `setTimeout`. The `signOut()` return value `{ error }` is discarded. If sign-out fails (network timeout, Supabase error), the user sees only the deactivation success toast but remains authenticated. They are then not redirected, and the session stays live against a now-suspended account. The same pattern exists in `designer/Settings.tsx:191-194`.

**Fix:**
```typescript
setTimeout(async () => {
  const { error: signOutError } = await signOut();
  if (signOutError) {
    toast({
      title: "Sign Out Failed",
      description: "Your account was deactivated but sign-out failed. Please close this tab.",
      variant: "destructive",
    });
    return;
  }
  window.location.href = '/';
}, 2000);
```

---

### WR-03: `supabase` Import Retained in `DashboardLayout` Despite Sign-Out Migration

**File:** `src/layouts/DashboardLayout.tsx:28`
**Issue:** Line 28 imports `{ supabase }` from `@/integrations/supabase/client`. The stated goal of this phase was to remove direct Supabase auth calls from this component. While the `supabase` import is legitimately used for the `artist_profiles` status query (lines 60-65), retaining it keeps the direct Supabase surface alive in this file, making it easy for future authors to reach back for `supabase.auth.signOut()`. The import itself is not wrong — but it should be noted as a remaining coupling point. More importantly, the auth state check on line 101 duplicates logic from `useAuth()` and uses `statusLoading` in a stale way: the negation `!statusLoading` is always `false` at that point because `statusLoading` was already confirmed `false` by the `if (loading || statusLoading)` guard above (lines 92-98). The second `!statusLoading` check at line 101 is dead code.

**Fix:**
```tsx
// Line 101 — remove the dead !statusLoading condition:
if (!user || !(isArtist || isAdmin || isSuperAdmin || artistStatus === 'pending')) {
  return null;
}
```

---

### WR-04: Multiple `console.log` Statements Leak User PII in Production

**File:** `src/layouts/DashboardLayout.tsx:76-86`
**Issue:** Three `console.log` calls log the full `user` object (which includes `email`, `phone`, and `user_metadata`) alongside auth flags. In a browser, these appear in DevTools console and can be captured by browser extensions or automated testing tools. The project's coding-style rules prohibit `console.log` in production code entirely. Beyond the style rule, logging a `User` object with identifying fields (email, phone) violates basic privacy hygiene.

```
console.log('DashboardLayout: user:', user, ...)  // line 76 — logs full user object including email
console.log('DashboardLayout: No user, redirecting...')  // line 82
console.log('DashboardLayout: User lacks access, redirecting...')  // line 85
```

**Fix:** Remove all three `console.log` statements. Use a structured logger that respects `NODE_ENV` if debug tracing is needed.

---

## Info

### IN-01: `signOut()` in `AuthContext` Does Not Capture Errors to Sentry

**File:** `src/context/AuthContext.tsx:494-515`
**Issue:** `signIn`, `signUp`, `signUpArtist`, and `signUpDesigner` all call `Sentry.captureException(error)` on failure. `signOut` does not. Given that sign-out failures are rare but impactful (user appears to stay logged in), they are worth capturing. This is the one auth function missing Sentry coverage.

**Fix:**
```typescript
const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Sentry.captureException(error, { tags: { location: 'AuthContext.signOut' } });
      toast({ title: "Sign Out Error", description: error.message, variant: "destructive" });
    }

    return { error };
  } catch (error: any) {
    Sentry.captureException(error, { tags: { location: 'AuthContext.signOut' } });
    toast({ title: "Sign Out Error", description: error.message, variant: "destructive" });
    return { error };
  }
};
```

---

### IN-02: `handlePasswordSubmit` in `UserProfileSettings` Silently Swallows Errors

**File:** `src/components/user/UserProfileSettings.tsx:184-188`
**Issue:** The `catch` block at line 184 calls `console.error` but does not show a user-facing error toast. If `supabase.auth.updateUser` throws (network error, session expired), the user clicks "Update Password," nothing appears to happen, and the loading spinner stops. The error is invisible to the user.

**Fix:**
```typescript
} catch (error: any) {
  console.error('Error updating password:', error);
  toast({
    title: "Password Update Error",
    description: error.message || "An unexpected error occurred",
    variant: "destructive",
  });
}
```

---

### IN-03: `paystackConfig.reference` Is Computed at Render Time, Not at Payment Initiation

**File:** `src/pages/Checkout.tsx:120`
**Issue:** `reference: new Date().getTime().toString()` is evaluated when the component renders (or re-renders), not when the user clicks "Pay". If the user stays on step 2 for more than a moment, or if the component re-renders between arriving at step 2 and clicking Pay, the reference timestamp will be stale but still used. In a high-traffic scenario, two sessions rendering at the same millisecond would also share a reference. Paystack references must be unique per transaction attempt.

**Fix:**
```typescript
// Generate the reference inside handlePaystackSuccess or pass a generator function:
const getPaystackConfig = () => ({
  reference: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  email: formData.email,
  amount: Math.round(total * 100),
  currency: currency,
  publicKey: paystackPublicKey,
});

// Pass it when initializing payment:
onClick={() => {
  initializePayment({
    ...getPaystackConfig(),
    onSuccess: handlePaystackSuccess,
    onClose: handlePaystackClose,
  });
}}
```

---

_Reviewed: 2026-06-27T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
