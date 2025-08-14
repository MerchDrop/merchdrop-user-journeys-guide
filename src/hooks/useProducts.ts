import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price_cents: number;
  stock: number;
  category_id: string | null;
  artist_id: string | null;
  currency: string;
  status: string;
  slug: string;
  sku: string | null;
  main_image_url: string | null;
  tags: string[] | null;
  variants: any;
  featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  // Joined data
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  artist_profiles?: {
    id: string;
    artist_name: string;
    artist_slug: string;
  };
  product_images?: Array<{
    id: string;
    url: string;
    sort_order: number;
  }>;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isArtist } = useAuth();

  const fetchProducts = async (filters?: {
    artistId?: string;
    categoryId?: string;
    status?: string;
    featured?: boolean;
    published?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug),
          artist_profiles(id, artist_name, artist_slug),
          product_images(id, url, sort_order)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.artistId) {
        query = query.eq('artist_id', filters.artistId);
      }
      
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }
      
      if (filters?.published) {
        query = query.eq('status', 'published');
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistProducts = async () => {
    if (!user || !isArtist) return;

    try {
      // Get artist profile first
      const { data: artistProfile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (artistProfile) {
        await fetchProducts({ artistId: artistProfile.id });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const publishProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Refresh products
      await fetchProducts();
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const unpublishProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          status: 'draft',
          published_at: null
        })
        .eq('id', productId);

      if (error) throw error;

      // Refresh products
      await fetchProducts();
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      // Delete product images from storage first
      const { data: images } = await supabase
        .from('product_images')
        .select('url')
        .eq('product_id', productId);

      if (images && images.length > 0) {
        const imagePaths = images.map(img => {
          const url = new URL(img.url);
          return url.pathname.split('/').slice(-2).join('/'); // Get the last two parts (folder/filename)
        });

        await supabase.storage
          .from('product-images')
          .remove(imagePaths);
      }

      // Delete product images records
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      // Delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Refresh products
      await fetchProducts();
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, stock: newStock }
            : product
        )
      );
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchProducts({ published: true }); // Default to showing published products
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchArtistProducts,
    publishProduct,
    unpublishProduct,
    deleteProduct,
    updateProductStock,
    refetch: () => fetchProducts(),
  };
};