-- Insert sample categories with proper UUIDs
INSERT INTO categories (name, slug, description) VALUES 
('T-Shirts', 't-shirts', 'Comfortable and stylish t-shirts'),
('Hoodies', 'hoodies', 'Cozy hoodies for all seasons'),
('Accessories', 'accessories', 'Unique accessories and items'),
('Prints', 'prints', 'Art prints and posters')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products without artist_id to avoid foreign key issues
DO $$
DECLARE
    tshirt_uuid uuid;
    hoodie_uuid uuid;
    accessories_uuid uuid;
    prints_uuid uuid;
BEGIN
    -- Get category IDs
    SELECT id INTO tshirt_uuid FROM categories WHERE slug = 't-shirts' LIMIT 1;
    SELECT id INTO hoodie_uuid FROM categories WHERE slug = 'hoodies' LIMIT 1;
    SELECT id INTO accessories_uuid FROM categories WHERE slug = 'accessories' LIMIT 1;
    SELECT id INTO prints_uuid FROM categories WHERE slug = 'prints' LIMIT 1;
    
    -- Insert sample products without artist_id
    INSERT INTO products (
        title, description, price_cents, stock, category_id, 
        currency, status, slug, main_image_url, featured, published_at
    ) VALUES 
    ('Artistic T-Shirt Design', 'A beautiful artistic t-shirt with unique design', 2999, 50, tshirt_uuid, 'USD', 'published', 'artistic-t-shirt', '/placeholder.svg', true, NOW()),
    ('Creative Hoodie', 'Comfortable hoodie with creative artwork', 4999, 30, hoodie_uuid, 'USD', 'published', 'creative-hoodie', '/placeholder.svg', false, NOW()),
    ('Designer Mug', 'Ceramic mug with beautiful design', 1999, 100, accessories_uuid, 'USD', 'published', 'designer-mug', '/placeholder.svg', false, NOW()),
    ('Art Print Collection', 'High-quality art print for your wall', 3499, 25, prints_uuid, 'USD', 'published', 'art-print', '/placeholder.svg', true, NOW()),
    ('Vintage T-Shirt', 'Retro style t-shirt with vintage feel', 2799, 40, tshirt_uuid, 'USD', 'published', 'vintage-t-shirt', '/placeholder.svg', false, NOW()),
    ('Cozy Hoodie', 'Ultra-soft hoodie perfect for cold days', 5299, 20, hoodie_uuid, 'USD', 'published', 'cozy-hoodie', '/placeholder.svg', false, NOW())
    ON CONFLICT (slug) DO NOTHING;
END $$;