import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  PackageCheck,
  Plus,
  Minus,
  Edit3,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminInventory() {
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [adjustedStock, setAdjustedStock] = useState<number>(0);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) {
        setInventoryItems(data.map((p) => ({
          id: p.id,
          sku: `SKU-${p.id.slice(0, 6).toUpperCase()}`,
          name: p.title,
          size: 'All Sizes',
          stock: p.stock || 0,
        })));
      } else {
        setInventoryItems([]);
      }
    } catch (e) {
      console.error('Error fetching inventory:', e);
      setInventoryItems([]);
    }
  };

  const handleSaveStock = () => {
    if (!editingItem) return;
    const updated = inventoryItems.map((item) => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          stock: adjustedStock,
          status: adjustedStock === 0 ? 'out_of_stock' : adjustedStock <= 5 ? 'low_stock' : 'in_stock',
        };
      }
      return item;
    });
    setInventoryItems(updated);
    setIsStockDialogOpen(false);
    setEditingItem(null);
    toast({
      title: 'Stock Updated',
      description: `Stock level updated to ${adjustedStock} units.`,
    });
  };

  const filteredInventory = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = inventoryItems.filter((i) => i.stock <= 5 && i.stock > 0).length;
  const outOfStockCount = inventoryItems.filter((i) => i.stock === 0).length;
  const totalStockUnits = inventoryItems.reduce((sum, i) => sum + i.stock, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Boxes className="h-8 w-8 text-primary" />
            Inventory & Stock Control
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor variant stock levels, track low stock alerts, and perform inventory replenishment.
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total In-Stock Units</p>
              <h3 className="text-2xl font-bold mt-2">{totalStockUnits} Units</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Boxes className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock Warnings (≤ 5)</p>
              <h3 className="text-2xl font-bold mt-2 text-amber-600">{lowStockCount} Items</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <h3 className="text-2xl font-bold mt-2 text-red-600">{outOfStockCount} Items</h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl text-red-600">
              <PackageCheck className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Product Stock Matrix</CardTitle>
              <CardDescription>
                View inventory details across product apparel variants.
              </CardDescription>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SKU or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Variant / Size</th>
                  <th className="py-3 px-4">Available Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-primary">{item.sku}</td>
                    <td className="py-4 px-4 font-semibold text-foreground">{item.name}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{item.size || 'Universal'}</Badge>
                    </td>
                    <td className="py-4 px-4 font-bold text-foreground">{item.stock} units</td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          item.stock === 0
                            ? 'destructive'
                            : item.stock <= 5
                            ? 'secondary'
                            : 'default'
                        }
                        className={item.stock <= 5 && item.stock > 0 ? 'bg-amber-500 text-white' : ''}
                      >
                        {item.stock === 0 ? 'Out of Stock' : item.stock <= 5 ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingItem(item);
                          setAdjustedStock(item.stock);
                          setIsStockDialogOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-1" /> Adjust Stock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjust Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>
              Update current available inventory for {editingItem?.name} ({editingItem?.size}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="stockUnits">New Quantity (Units)</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAdjustedStock(Math.max(0, adjustedStock - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="stockUnits"
                  type="number"
                  className="text-center text-lg font-bold"
                  value={adjustedStock}
                  onChange={(e) => setAdjustedStock(Number(e.target.value))}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAdjustedStock(adjustedStock + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStock}>Save Inventory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
