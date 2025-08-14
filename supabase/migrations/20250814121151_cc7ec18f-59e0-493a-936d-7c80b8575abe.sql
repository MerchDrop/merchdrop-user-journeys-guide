-- Insert some default categories if they don't exist
INSERT INTO public.categories (name, slug, description) VALUES 
  ('T-Shirts', 't-shirts', 'Custom designed t-shirts and apparel'),
  ('Art Prints', 'art-prints', 'High-quality art prints and posters'),
  ('Digital Art', 'digital-art', 'Downloadable digital artwork'),
  ('Accessories', 'accessories', 'Bags, stickers, pins and other accessories'),
  ('Home & Living', 'home-living', 'Wall art, pillows, and home decor')
ON CONFLICT (slug) DO NOTHING;

-- Add better RLS policies for products to support artist management
CREATE POLICY "Artists can view own products" ON public.products
  FOR SELECT 
  USING (
    artist_id IN (
      SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Artists can insert own products" ON public.products
  FOR INSERT 
  WITH CHECK (
    artist_id IN (
      SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Artists can update own products" ON public.products
  FOR UPDATE 
  USING (
    artist_id IN (
      SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    )
  );

-- Add RLS policies for product images
CREATE POLICY "Artists can manage images of own products" ON public.product_images
  FOR ALL 
  USING (
    product_id IN (
      SELECT p.id FROM products p
      JOIN artist_profiles ap ON p.artist_id = ap.id
      WHERE ap.user_id = auth.uid()
    )
  );

-- Add function to generate unique product slug
CREATE OR REPLACE FUNCTION public.generate_product_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment counter if needed
  WHILE EXISTS(SELECT 1 FROM products WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;