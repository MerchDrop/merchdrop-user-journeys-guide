-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  is_artist BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create artist profiles table for additional artist-specific data
CREATE TABLE public.artist_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  artist_slug TEXT UNIQUE NOT NULL,
  brand_colors JSONB DEFAULT '{}',
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  approval_date TIMESTAMP WITH TIME ZONE,
  total_sales DECIMAL(12,2) DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on artist profiles
ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for artist profiles
CREATE POLICY "Anyone can view approved artists" 
ON public.artist_profiles FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Artists can update own profile" 
ON public.artist_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create artist profile" 
ON public.artist_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_provider TEXT DEFAULT 'paystack',
  payment_reference TEXT,
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  artist_id UUID NOT NULL REFERENCES public.artist_profiles(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  product_variant JSONB DEFAULT '{}', -- size, color, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on order items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for order items
CREATE POLICY "Users can view own order items" 
ON public.order_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders o 
  WHERE o.id = order_id AND o.user_id = auth.uid()
));

-- Create payouts table for artist earnings
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.artist_profiles(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT,
  payment_reference TEXT,
  processing_fee DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create policies for payouts
CREATE POLICY "Artists can view own payouts" 
ON public.payouts FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.artist_profiles ap 
  WHERE ap.id = artist_id AND ap.user_id = auth.uid()
));

-- Update products table to add artist reference
ALTER TABLE public.products 
ADD COLUMN artist_id UUID REFERENCES public.artist_profiles(id),
ADD COLUMN variants JSONB DEFAULT '{}',
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN featured BOOLEAN DEFAULT FALSE;

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artist_profiles_updated_at
  BEFORE UPDATE ON public.artist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();