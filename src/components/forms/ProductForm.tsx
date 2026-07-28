import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCurrency, CURRENCIES } from '@/context/CurrencyContext';
import { Upload, X, Plus, Check, Palette } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Navy', value: '#1E293B' },
  { name: 'Heather Grey', value: '#94A3B8' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Forest Green', value: '#15803D' },
  { name: 'Beige', value: '#F5F5DC' },
  { name: 'Royal Blue', value: '#2563EB' },
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Olive', value: '#556B2F' },
  { name: 'Brown', value: '#78350F' },
];

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price_cents: z.number().min(1, 'Price must be greater than 0'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  category_id: z.string().min(1, 'Category is required'),
  sku: z.string().optional(),
  tags: z.array(z.string()).optional(),
  variants: z.record(z.any()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editProduct?: any;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel, editProduct }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [artistProfile, setArtistProfile] = useState<any>(null);
  
  // Color Choices State
  const [selectedColors, setSelectedColors] = useState<{ name: string; value: string }[]>(
    editProduct?.variants?.colors || editProduct?.colors || []
  );
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');
  
  const { user, isArtist, isAdmin } = useAuth();
  const { currency, convertPrice, convertBetweenCurrencies } = useCurrency();
  const { toast } = useToast();

  const toggleColor = (colorObj: { name: string; value: string }) => {
    setSelectedColors(prev => {
      const exists = prev.some(c => c.name.toLowerCase() === colorObj.name.toLowerCase());
      if (exists) {
        return prev.filter(c => c.name.toLowerCase() !== colorObj.name.toLowerCase());
      } else {
        return [...prev, colorObj];
      }
    });
  };

  const addCustomColor = () => {
    const trimmed = customColorName.trim();
    if (!trimmed) {
      toast({
        title: "Color Name Required",
        description: "Please enter a name for your custom color.",
        variant: "destructive",
      });
      return;
    }
    const exists = selectedColors.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast({
        title: "Color already added",
        description: `Color "${trimmed}" is already in your selected color list.`,
      });
      return;
    }
    setSelectedColors(prev => [...prev, { name: trimmed, value: customColorHex }]);
    setCustomColorName('');
  };

  const removeColor = (colorName: string) => {
    setSelectedColors(prev => prev.filter(c => c.name.toLowerCase() !== colorName.toLowerCase()));
  };

  // Create and cleanup blob URLs for image previews
  useEffect(() => {
    const previews = images.map(image => URL.createObjectURL(image));
    setImagePreviews(previews);

    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: editProduct?.title || '',
      description: editProduct?.description || '',
      price_cents: editProduct ? Number(convertPrice(editProduct.price_cents / 100).toFixed(2)) : 0,
      stock: editProduct?.stock || 0,
      category_id: editProduct?.category_id || '',
      sku: editProduct?.sku || '',
      tags: editProduct?.tags || [],
      variants: editProduct?.variants || {},
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchArtistProfile();
    
    if (editProduct) {
      if (editProduct.tags) setTags(editProduct.tags);
      const displayVal = Number(convertPrice(editProduct.price_cents / 100).toFixed(2));
      setValue('price_cents', displayVal);
    }
  }, [editProduct, currency]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Couldn't load categories",
        description: `${error.message} — try reloading the page.`,
        variant: "destructive",
      });
      return;
    }

    setCategories(data || []);
  };

  const fetchArtistProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      toast({
        title: "Couldn't load your artist profile",
        description: `${error.message} — try reloading the page.`,
        variant: "destructive",
      });
      return;
    }

    setArtistProfile(data);
  };

  const generateSlug = async (title: string) => {
    const { data, error } = await supabase.rpc('generate_product_slug', { title });
    if (error) {
      console.error('Error generating slug:', error);
      return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    return data;
  };

  const uploadImages = async (productId: string) => {
    const uploadPromises = images.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      // Storage RLS only allows uploads under the current user's folder
      const fileName = `${user!.id}/${productId}/${Date.now()}-${index}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return {
        product_id: productId,
        url: publicUrl,
        sort_order: index,
      };
    });

    const imageData = await Promise.all(uploadPromises);

    const { error } = await supabase
      .from('product_images')
      .insert(imageData);

    if (error) throw error;

    return imageData;
  };

  const onSubmit = async (data: ProductFormData) => {
    const canSubmitAsArtist = isArtist && artistProfile;
    if (!canSubmitAsArtist && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an approved artist or an admin to create products.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // data.price_cents is entered in display currency (e.g., $25.00 USD, £19.75 GBP, or ₦41,250 NGN).
      // Convert display amount to USD dollars, then to canonical USD cents for database storage.
      const priceInUsdDollars = convertBetweenCurrencies(data.price_cents, currency, 'USD');
      const priceCentsUsd = Math.round(priceInUsdDollars * 100);

      if (!priceCentsUsd || priceCentsUsd <= 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid product price greater than 0.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      const productData = {
        title: data.title,
        description: data.description,
        price_cents: priceCentsUsd,
        stock: data.stock,
        category_id: data.category_id,
        sku: data.sku,
        // Preserve the owner on edit; admins without an artist profile
        // create platform-owned products (artist_id is nullable)
        artist_id: editProduct?.artist_id ?? artistProfile?.id ?? null,
        // price_cents is always USD now, so the stored currency must match
        currency: 'USD',
        tags,
        status: 'draft' as const,
        slug: await generateSlug(data.title),
        variants: {
          ...(data.variants || editProduct?.variants || {}),
          colors: selectedColors,
        },
        main_image_url: images.length > 0 ? null : editProduct?.main_image_url || null,
      };

      let productId;

      if (editProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editProduct.id);

        if (error) throw error;
        productId = editProduct.id;
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();

        if (error) throw error;
        productId = newProduct.id;
      }

      if (images.length > 0) {
        const uploadedImages = await uploadImages(productId);

        // Update main_image_url with the first uploaded image
        if (!editProduct && uploadedImages.length > 0) {
          await supabase
            .from('products')
            .update({ main_image_url: uploadedImages[0].url })
            .eq('id', productId);
        }
      }

      toast({
        title: "Success",
        description: `Product ${editProduct ? 'updated' : 'created'} successfully!`,
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!isArtist && !isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You need to be an approved artist or an admin to create products.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editProduct ? 'Edit Product' : 'Create New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter product title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Optional)</Label>
              <Input
                id="sku"
                {...register('sku')}
                placeholder="Enter SKU"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price_cents">Price ({currency})</Label>
              <Input
                id="price_cents"
                type="number"
                step="0.01"
                min="0.01"
                {...register('price_cents', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price_cents && (
                <p className="text-sm text-destructive">{errors.price_cents.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                {...register('stock', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-sm text-destructive">{errors.stock.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={watch('category_id')}
                onValueChange={(value) => setValue('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-destructive">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          {/* Color Choice Section */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <Label className="font-semibold text-sm">Product Colors</Label>
              </div>
              <span className="text-xs text-muted-foreground">Select color options available for buyers</span>
            </div>

            {/* Quick Select Presets */}
            <div className="flex flex-wrap gap-2 p-3 rounded-md bg-muted/40 border">
              {PRESET_COLORS.map((color) => {
                const isSelected = selectedColors.some(c => c.name.toLowerCase() === color.name.toLowerCase());
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-semibold'
                        : 'border-border bg-background hover:bg-muted text-foreground'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.name}
                    {isSelected && <Check className="w-3 h-3 text-primary ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Creator */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                placeholder="Custom color (e.g. Acid Wash Cyan)"
                className="text-xs flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
              />
              <input
                type="color"
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                className="w-9 h-9 p-0.5 rounded cursor-pointer border bg-background"
                title="Pick color hex"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCustomColor} className="text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Color
              </Button>
            </div>

            {/* Selected Colors List */}
            {selectedColors.length > 0 && (
              <div className="pt-2 border-t mt-2">
                <span className="text-xs font-medium text-muted-foreground block mb-2">Selected Color Options ({selectedColors.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {selectedColors.map((color) => (
                    <Badge key={color.name} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 text-xs">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{color.name}</span>
                      <button
                        type="button"
                        onClick={() => removeColor(color.name)}
                        className="ml-1 hover:text-destructive text-muted-foreground transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <Label htmlFor="images" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:text-primary/80">
                      Click to upload images
                    </span>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG up to 10MB each
                  </p>
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imagePreviews[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : isSubmitting ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};