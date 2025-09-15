-- Fix security definer view warnings by recreating views without SECURITY DEFINER
-- Drop the existing views first
drop view if exists api.profiles cascade;
drop view if exists api.user_roles cascade;
drop view if exists api.products cascade;
drop view if exists api.product_images cascade;
drop view if exists api.artist_profiles cascade;
drop view if exists api.orders cascade;
drop view if exists api.order_items cascade;
drop view if exists api.wishlists cascade;
drop view if exists api.reviews cascade;
drop view if exists api.artist_follows cascade;
drop view if exists api.payouts cascade;

-- Recreate views without SECURITY DEFINER (they inherit security from base tables via RLS)
create view api.profiles as select * from public.profiles;
create view api.user_roles as select * from public.user_roles;
create view api.products as select * from public.products;
create view api.product_images as select * from public.product_images;
create view api.artist_profiles as select * from public.artist_profiles;
create view api.orders as select * from public.orders;
create view api.order_items as select * from public.order_items;
create view api.wishlists as select * from public.wishlists;
create view api.reviews as select * from public.reviews;
create view api.artist_follows as select * from public.artist_follows;
create view api.payouts as select * from public.payouts;