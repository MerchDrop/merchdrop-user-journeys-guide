import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MoreHorizontal, Eye, Edit, Trash2, Plus, Archive } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import {
  useProductsQuery,
  usePublishProductMutation,
  useUnpublishProductMutation,
  useDeleteProductMutation,
  Product,
} from '@/hooks/useProductsQuery';
import { ProductForm } from '@/components/forms/ProductForm';

export function FixedAdminProductTable() {
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  // No filters: admins can see all products (draft, published, archived) via RLS
  const { data: products = [], isLoading, error, refetch } = useProductsQuery();
  const publishMutation = usePublishProductMutation();
  const unpublishMutation = useUnpublishProductMutation();
  const deleteMutation = useDeleteProductMutation();

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
      case 'live':
        return 'default' as const;
      case 'draft':
        return 'secondary' as const;
      case 'disabled':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(productId);
    } catch {
      // Error toast is handled by the mutation's onError
    }
  };

  const handleFormSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    refetch();
    toast({
      title: 'Success',
      description: editingProduct ? 'Product updated successfully.' : 'Product created successfully.',
    });
  };

  const closeForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>
              Manage all products across the platform. View, edit, and monitor product performance.
            </CardDescription>
          </div>
          <Button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading products…
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-destructive">
                  Error loading products: {error.message}
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No products found. Click "Add Product" to create one.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.main_image_url ? (
                        <img
                          src={product.main_image_url}
                          alt={product.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted" />
                      )}
                      <span className="font-medium">{product.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.artist_profiles?.artist_name || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(product.status)}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(product.price_cents / 100)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingProduct(product); setShowProductForm(true); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {product.status === 'published' ? (
                          <DropdownMenuItem onClick={() => unpublishMutation.mutate(product.id)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => publishMutation.mutate(product.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] !top-[5%] !translate-y-0 overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
            <ProductForm
              editProduct={editingProduct}
              onSuccess={handleFormSuccess}
              onCancel={closeForm}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
