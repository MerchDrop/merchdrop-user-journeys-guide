import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { handleQueryError, handleQuerySuccess, createOptimisticUpdate } from '@/lib/queryUtils';

export interface Product {
  id: string;
  title: string;
  description?: string;
  price_cents: number;
  currency: string;
  stock: number;
  status: string;
  featured: boolean;
  slug: string;
  main_image_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  artist_id?: string;
  category_id?: string;
  variants?: any;
  sku?: string;
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

interface ProductFilters {
  artist?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  published?: boolean;
  search?: string;
}

// Fetch products with filters
async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
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
  if (filters.artist) {
    query = query.eq('artist_id', filters.artist);
  }
  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }
  if (filters.published !== undefined) {
    const status = filters.published ? 'published' : 'draft';
    query = query.eq('status', status);
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Fetch products with pagination
async function fetchProductsPaginated({ pageParam = 0, filters = {} }: { pageParam?: number; filters?: ProductFilters }) {
  const limit = 20;
  const offset = pageParam * limit;

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      artist_profiles(id, artist_name, artist_slug),
      product_images(id, url, sort_order)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters (same as above)
  if (filters.artist) query = query.eq('artist_id', filters.artist);
  if (filters.category) query = query.eq('category_id', filters.category);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.featured !== undefined) query = query.eq('featured', filters.featured);
  if (filters.published !== undefined) {
    const status = filters.published ? 'published' : 'draft';
    query = query.eq('status', status);
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return {
    data: data || [],
    nextPage: data && data.length === limit ? pageParam + 1 : undefined,
  };
}

// Product mutation functions
async function publishProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) throw error;
}

async function unpublishProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ status: 'draft', published_at: null })
    .eq('id', productId);

  if (error) throw error;
}

async function deleteProduct(productId: string): Promise<void> {
  // Delete product images from storage first
  const { data: images } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', productId);

  if (images) {
    const filePaths = images.map(img => img.url.split('/').pop()).filter(Boolean);
    if (filePaths.length > 0) {
      await supabase.storage
        .from('product-images')
        .remove(filePaths);
    }
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
}

async function updateProductStock(productId: string, newStock: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', productId);

  if (error) throw error;
}

// React Query hooks
export function useProductsQuery(filters?: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for products
  });
}

export function useProductsInfiniteQuery(filters?: ProductFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: ({ pageParam }) => fetchProductsPaginated({ pageParam, filters }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

export function usePublishProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishProduct,
    onMutate: async (productId) => {
      // Optimistically update all product queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.products.all },
        (oldData: Product[] | undefined) => {
          if (!oldData) return oldData;
          return createOptimisticUpdate(
            oldData,
            { id: productId, status: 'published', published_at: new Date().toISOString() },
            'update'
          );
        }
      );
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to publish product');
    },
    onSuccess: () => {
      handleQuerySuccess('Product published successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useUnpublishProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unpublishProduct,
    onMutate: async (productId) => {
      queryClient.setQueriesData(
        { queryKey: queryKeys.products.all },
        (oldData: Product[] | undefined) => {
          if (!oldData) return oldData;
          return createOptimisticUpdate(
            oldData,
            { id: productId, status: 'draft', published_at: null },
            'update'
          );
        }
      );
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to unpublish product');
    },
    onSuccess: () => {
      handleQuerySuccess('Product unpublished successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async (productId) => {
      queryClient.setQueriesData(
        { queryKey: queryKeys.products.all },
        (oldData: Product[] | undefined) => {
          if (!oldData) return oldData;
          return createOptimisticUpdate(oldData, { id: productId }, 'delete');
        }
      );
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to delete product');
    },
    onSuccess: () => {
      handleQuerySuccess('Product deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useUpdateProductStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, newStock }: { productId: string; newStock: number }) =>
      updateProductStock(productId, newStock),
    onMutate: async ({ productId, newStock }) => {
      queryClient.setQueriesData(
        { queryKey: queryKeys.products.all },
        (oldData: Product[] | undefined) => {
          if (!oldData) return oldData;
          return createOptimisticUpdate(oldData, { id: productId, stock: newStock }, 'update');
        }
      );
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to update product stock');
    },
    onSuccess: () => {
      handleQuerySuccess('Product stock updated successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

// Legacy hook wrapper for backward compatibility
export function useProducts() {
  const { data: products = [], isLoading: loading, error } = useProductsQuery({ published: true });
  const publishMutation = usePublishProductMutation();
  const unpublishMutation = useUnpublishProductMutation();
  const deleteMutation = useDeleteProductMutation();
  const updateStockMutation = useUpdateProductStockMutation();

  return {
    products,
    loading,
    error: error?.message || null,
    fetchProducts: () => {}, // No longer needed
    fetchArtistProducts: () => {}, // Use useProductsQuery with artist filter instead
    publishProduct: (productId: string) => publishMutation.mutateAsync(productId),
    unpublishProduct: (productId: string) => unpublishMutation.mutateAsync(productId),
    deleteProduct: (productId: string) => deleteMutation.mutateAsync(productId),
    updateProductStock: (productId: string, newStock: number) =>
      updateStockMutation.mutateAsync({ productId, newStock }),
  };
}