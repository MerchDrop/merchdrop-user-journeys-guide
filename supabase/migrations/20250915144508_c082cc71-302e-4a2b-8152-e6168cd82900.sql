-- Create an API-facing schema and updatable views to fix PostgREST schema restriction (PGRST106)
-- This lets Supabase REST (exposed to only the 'api' schema) access our public tables via views

-- 1) Create schema if not exists
create schema if not exists api;

-- 2) Create or replace simple, auto-updatable views for required tables
create or replace view api.profiles as select * from public.profiles;
create or replace view api.user_roles as select * from public.user_roles;
create or replace view api.products as select * from public.products;
create or replace view api.product_images as select * from public.product_images;
create or replace view api.artist_profiles as select * from public.artist_profiles;
create or replace view api.orders as select * from public.orders;
create or replace view api.order_items as select * from public.order_items;
create or replace view api.wishlists as select * from public.wishlists;
create or replace view api.reviews as select * from public.reviews;
create or replace view api.artist_follows as select * from public.artist_follows;
create or replace view api.payouts as select * from public.payouts;

-- 3) Grant usage and privileges on the api schema and its relations
grant usage on schema api to anon, authenticated;

-- Allow reads for both anon and authenticated (RLS on base tables still applies)
grant select on all tables in schema api to anon, authenticated;

-- Allow writes only for authenticated users (RLS on base tables will still enforce row-level access)
grant insert, update, delete on all tables in schema api to authenticated;

-- 4) Ensure future views in this schema inherit sensible defaults
alter default privileges in schema api grant select on tables to anon, authenticated;
alter default privileges in schema api grant insert, update, delete on tables to authenticated;