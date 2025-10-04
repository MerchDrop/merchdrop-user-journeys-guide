-- Remove all hardcoded/seed data from the database

-- Delete reviews first (references products)
DELETE FROM reviews;

-- Delete order items (references orders and products)
DELETE FROM order_items;

-- Delete all orders
DELETE FROM orders;

-- Delete product images (references products)
DELETE FROM product_images;

-- Delete wishlists (references products)
DELETE FROM wishlists;

-- Delete product design selections
DELETE FROM product_design_selections;

-- Delete all products
DELETE FROM products;

-- Reset any artist sales counters
UPDATE artist_profiles SET total_sales = 0, total_earnings = 0;