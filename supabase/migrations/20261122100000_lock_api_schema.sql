-- The api schema holds views over public tables (profiles, orders, payouts...).
-- Views run as their owner, so they bypassed RLS and leaked every user's
-- email/phone to anyone with the anon key. Nothing in the app uses them.
REVOKE ALL ON ALL TABLES IN SCHEMA api FROM anon, authenticated;
REVOKE USAGE ON SCHEMA api FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA api REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER VIEW api.profiles SET (security_invoker = on);
ALTER VIEW api.orders SET (security_invoker = on);
ALTER VIEW api.order_items SET (security_invoker = on);
ALTER VIEW api.payouts SET (security_invoker = on);
ALTER VIEW api.user_roles SET (security_invoker = on);
ALTER VIEW api.artist_profiles SET (security_invoker = on);
ALTER VIEW api.artist_follows SET (security_invoker = on);
ALTER VIEW api.wishlists SET (security_invoker = on);
ALTER VIEW api.reviews SET (security_invoker = on);
ALTER VIEW api.products SET (security_invoker = on);
ALTER VIEW api.product_images SET (security_invoker = on);
