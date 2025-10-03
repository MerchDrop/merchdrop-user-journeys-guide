-- Create product_design_selections table for tracking artist design selections
CREATE TABLE product_design_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artist_profiles(id) NOT NULL,
  design_id UUID REFERENCES designs(id) NOT NULL,
  product_id UUID REFERENCES products(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  product_details JSONB DEFAULT '{}'::jsonb,
  admin_feedback TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add design_id to products table
ALTER TABLE products 
ADD COLUMN design_id UUID REFERENCES designs(id);

-- Enable RLS on product_design_selections
ALTER TABLE product_design_selections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_design_selections
CREATE POLICY "Artists can view own selections"
ON product_design_selections
FOR SELECT
USING (artist_id IN (
  SELECT id FROM artist_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Artists can create selections"
ON product_design_selections
FOR INSERT
WITH CHECK (artist_id IN (
  SELECT id FROM artist_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all selections"
ON product_design_selections
FOR ALL
USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_product_design_selections_updated_at
BEFORE UPDATE ON product_design_selections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();