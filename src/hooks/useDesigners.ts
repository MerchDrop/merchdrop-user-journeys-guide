import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DesignerProfile {
  id: string;
  user_id: string;
  designer_name: string;
  bio?: string;
  total_designs: number;
  approved_designs: number;
  pending_designs: number;
  declined_designs: number;
  total_earnings: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Design {
  id: string;
  designer_id: string;
  artist_id: string;
  title: string;
  description?: string;
  file_urls: string[];
  status: 'pending' | 'approved' | 'declined';
  admin_feedback?: string;
  approved_by?: string;
  approved_at?: string;
  revenue_generated: number;
  created_at: string;
  updated_at: string;
  artist_profiles?: {
    artist_name: string;
    artist_slug: string;
  };
}

interface DesignerPayout {
  id: string;
  designer_id: string;
  amount: number;
  processing_fee: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_method?: string;
  payment_reference?: string;
  currency: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useDesigners = () => {
  const [designerProfile, setDesignerProfile] = useState<DesignerProfile | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [payouts, setPayouts] = useState<DesignerPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDesignerProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('designer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setDesignerProfile(data);
    } catch (err) {
      console.error('Error fetching designer profile:', err);
      setError('Failed to fetch designer profile');
    }
  };

  const fetchDesigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: designerData } = await supabase
        .from('designer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!designerData) return;

      const { data, error } = await supabase
        .from('designs')
        .select(`
          *,
          artist_profiles:artist_id (
            artist_name,
            artist_slug
          )
        `)
        .eq('designer_id', designerData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns((data || []) as Design[]);
    } catch (err) {
      console.error('Error fetching designs:', err);
      setError('Failed to fetch designs');
    }
  };

  const fetchPayouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: designerData } = await supabase
        .from('designer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!designerData) return;

      const { data, error } = await supabase
        .from('designer_payouts')
        .select('*')
        .eq('designer_id', designerData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts((data || []) as DesignerPayout[]);
    } catch (err) {
      console.error('Error fetching payouts:', err);
      setError('Failed to fetch payouts');
    }
  };

  const createDesignerProfile = async (designerName: string, bio?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('designer_profiles')
        .insert({
          user_id: user.id,
          designer_name: designerName,
          bio
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Designer profile created successfully.",
      });

      fetchDesignerProfile();
    } catch (err) {
      console.error('Error creating designer profile:', err);
      toast({
        title: "Error",
        description: "Failed to create designer profile.",
        variant: "destructive",
      });
    }
  };

  const uploadDesign = async (designData: {
    artist_id: string;
    title: string;
    description?: string;
    file_urls: string[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: designerData } = await supabase
        .from('designer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!designerData) throw new Error('Designer profile not found');

      const { error } = await supabase
        .from('designs')
        .insert({
          designer_id: designerData.id,
          ...designData
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Design uploaded successfully and is pending approval.",
      });

      fetchDesigns();
      fetchDesignerProfile();
    } catch (err) {
      console.error('Error uploading design:', err);
      toast({
        title: "Error",
        description: "Failed to upload design.",
        variant: "destructive",
      });
    }
  };

  const updateDesignerProfile = async (updates: Partial<DesignerProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('designer_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });

      fetchDesignerProfile();
    } catch (err) {
      console.error('Error updating designer profile:', err);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDesignerProfile(),
        fetchDesigns(),
        fetchPayouts()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    designerProfile,
    designs,
    payouts,
    loading,
    error,
    createDesignerProfile,
    uploadDesign,
    updateDesignerProfile,
    refetch: () => {
      fetchDesignerProfile();
      fetchDesigns();
      fetchPayouts();
    }
  };
};