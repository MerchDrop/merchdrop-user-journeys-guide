-- Insert initial categories for the platform
INSERT INTO public.categories (name, slug, description) VALUES
('T-Shirts', 't-shirts', 'Custom designed t-shirts and apparel'),
('Hoodies', 'hoodies', 'Comfortable hoodies and sweatshirts'),
('Mugs', 'mugs', 'Custom printed mugs and drinkware'),
('Posters', 'posters', 'Art prints and posters'),
('Stickers', 'stickers', 'Custom stickers and decals'),
('Phone Cases', 'phone-cases', 'Protective phone cases with custom designs'),
('Bags', 'bags', 'Tote bags, backpacks, and accessories'),
('Home Decor', 'home-decor', 'Decorative items for the home');

-- Create storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their uploaded images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their uploaded images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add policies for order items creation
CREATE POLICY "Users can create order items for their orders"
ON public.order_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders o 
  WHERE o.id = order_id AND o.user_id = auth.uid()
));

-- Add policies for updating orders (for payment processing)
CREATE POLICY "Users can update their own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id);

-- Create admin role check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Add admin policies for managing products
CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
USING (public.is_admin());

-- Add admin policies for managing categories  
CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (public.is_admin());

-- Add admin policies for managing artist profiles
CREATE POLICY "Admins can view all artist profiles"
ON public.artist_profiles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update artist profiles"
ON public.artist_profiles FOR UPDATE
USING (public.is_admin());

-- Add admin policies for viewing all orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.is_admin());