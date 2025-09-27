-- Create designer_payouts table
CREATE TABLE public.designer_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES public.designer_profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  processing_fee NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT,
  payment_reference TEXT,
  currency TEXT DEFAULT 'USD',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on designer_payouts
ALTER TABLE public.designer_payouts ENABLE ROW LEVEL SECURITY;

-- Create policies for designer_payouts
CREATE POLICY "Designers can view own payouts" 
ON public.designer_payouts 
FOR SELECT 
USING (designer_id IN (
  SELECT id FROM designer_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all designer payouts" 
ON public.designer_payouts 
FOR ALL 
USING (is_admin());

-- Create function to check if user is a designer
CREATE OR REPLACE FUNCTION public.is_designer()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'designer');
$$;

-- Create trigger to update designer_profiles stats when designs change
CREATE OR REPLACE FUNCTION public.update_designer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update designer profile stats
  UPDATE designer_profiles 
  SET 
    total_designs = (
      SELECT COUNT(*) FROM designs WHERE designer_id = NEW.designer_id
    ),
    approved_designs = (
      SELECT COUNT(*) FROM designs WHERE designer_id = NEW.designer_id AND status = 'approved'
    ),
    pending_designs = (
      SELECT COUNT(*) FROM designs WHERE designer_id = NEW.designer_id AND status = 'pending'
    ),
    declined_designs = (
      SELECT COUNT(*) FROM designs WHERE designer_id = NEW.designer_id AND status = 'declined'
    ),
    updated_at = now()
  WHERE id = NEW.designer_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for design stats updates
CREATE TRIGGER update_designer_stats_trigger
  AFTER INSERT OR UPDATE ON public.designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_designer_stats();

-- Create trigger for automatic timestamp updates on designer_profiles
CREATE TRIGGER update_designer_profiles_updated_at
  BEFORE UPDATE ON public.designer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on designs
CREATE TRIGGER update_designs_updated_at
  BEFORE UPDATE ON public.designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on designer_payouts
CREATE TRIGGER update_designer_payouts_updated_at
  BEFORE UPDATE ON public.designer_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();