-- Create designer_profiles table for additional designer information
CREATE TABLE public.designer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  designer_name TEXT NOT NULL,
  bio TEXT,
  total_designs INTEGER DEFAULT 0,
  approved_designs INTEGER DEFAULT 0,
  pending_designs INTEGER DEFAULT 0,
  declined_designs INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on designer_profiles
ALTER TABLE public.designer_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for designer_profiles
CREATE POLICY "Designers can view own profile" 
ON public.designer_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Designers can update own profile" 
ON public.designer_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all designer profiles" 
ON public.designer_profiles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can manage designer profiles" 
ON public.designer_profiles 
FOR ALL 
USING (is_admin());

-- Create designs table for designer uploads
CREATE TABLE public.designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES public.designer_profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_urls TEXT[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  admin_feedback TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on designs
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Create policies for designs
CREATE POLICY "Designers can view own designs" 
ON public.designs 
FOR SELECT 
USING (designer_id IN (
  SELECT id FROM designer_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Designers can create designs" 
ON public.designs 
FOR INSERT 
WITH CHECK (designer_id IN (
  SELECT id FROM designer_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Designers can update own designs" 
ON public.designs 
FOR UPDATE 
USING (designer_id IN (
  SELECT id FROM designer_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all designs" 
ON public.designs 
FOR ALL 
USING (is_admin());

CREATE POLICY "Artists can view designs for their profile" 
ON public.designs 
FOR SELECT 
USING (artist_id IN (
  SELECT id FROM artist_profiles WHERE user_id = auth.uid()
));