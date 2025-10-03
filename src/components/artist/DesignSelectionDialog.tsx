import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Design {
  id: string;
  title: string;
  file_urls: string[];
}

interface DesignSelectionDialogProps {
  design: Design;
  artistId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DesignSelectionDialog({
  design,
  artistId,
  open,
  onOpenChange,
}: DesignSelectionDialogProps) {
  const [productTitle, setProductTitle] = useState(design.title);
  const [productDescription, setProductDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productType, setProductType] = useState('');
  const queryClient = useQueryClient();

  const submitSelection = useMutation({
    mutationFn: async () => {
      const productDetails = {
        title: productTitle,
        description: productDescription,
        price_cents: Math.round(parseFloat(price) * 100),
        product_type: productType,
      };

      const { error } = await supabase
        .from('product_design_selections')
        .insert({
          artist_id: artistId,
          design_id: design.id,
          product_details: productDetails,
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-design-selections'] });
      queryClient.invalidateQueries({ queryKey: ['approved-designs'] });
      toast.success('Design selection submitted for admin approval');
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Selection error:', error);
      toast.error('Failed to submit selection');
    },
  });

  const resetForm = () => {
    setProductTitle(design.title);
    setProductDescription('');
    setPrice('');
    setProductType('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle || !price || !productType) {
      toast.error('Please fill in all required fields');
      return;
    }
    submitSelection.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Design for Product</DialogTitle>
          <DialogDescription>
            Provide product details. This will be sent to admin for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <img
              src={design.file_urls[0]}
              alt={design.title}
              className="w-full aspect-square object-cover rounded-lg"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Product Type *</Label>
              <Input
                id="type"
                placeholder="e.g., T-Shirt, Hoodie, Poster"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="29.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the product..."
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitSelection.isPending}>
                {submitSelection.isPending ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
