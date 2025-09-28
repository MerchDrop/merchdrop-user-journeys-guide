-- Add admin access policies for order_items
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can manage all order items" 
ON public.order_items 
FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Add admin access policies for payouts
CREATE POLICY "Admins can manage all payouts" 
ON public.payouts 
FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Add admin access policies for product_images
CREATE POLICY "Admins can manage all product images" 
ON public.product_images 
FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Add admin access policy for user_roles (for completeness)
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin());