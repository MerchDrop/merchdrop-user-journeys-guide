import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  Trash2,
  Edit,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function AdminPromotions() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage', // 'percentage' | 'fixed'
    value: 10,
    min_spend_ngn: 5000,
    usage_limit: 100,
    expires_at: '2026-12-31',
    active: true,
  });

  const handleCreateCoupon = () => {
    if (!newCoupon.code) {
      toast({
        title: 'Missing Coupon Code',
        description: 'Please enter a unique promo code name.',
        variant: 'destructive',
      });
      return;
    }
    const created = {
      id: `cop-${Date.now()}`,
      code: newCoupon.code.toUpperCase().trim(),
      type: newCoupon.type,
      value: Number(newCoupon.value),
      min_spend_ngn: Number(newCoupon.min_spend_ngn),
      usage_limit: Number(newCoupon.usage_limit),
      used_count: 0,
      expires_at: newCoupon.expires_at,
      active: true,
    };
    setCoupons([created, ...coupons]);
    setIsCreateOpen(false);
    setNewCoupon({
      code: '',
      type: 'percentage',
      value: 10,
      min_spend_ngn: 5000,
      usage_limit: 100,
      expires_at: '2026-12-31',
      active: true,
    });
    toast({
      title: 'Promo Code Created',
      description: `Coupon ${created.code} is now active.`,
    });
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    toast({
      title: 'Status Updated',
      description: 'Coupon status changed successfully.',
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code Copied',
      description: `${code} copied to clipboard.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="h-8 w-8 text-primary" />
            Discounts & Promo Coupons
          </h1>
          <p className="text-muted-foreground mt-1">
            Create promotional codes, set discount values, minimum purchase rules, and track voucher usage.
          </p>
        </div>
        <div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Promo Code
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Coupons</p>
              <h3 className="text-2xl font-bold mt-2">{coupons.filter((c) => c.active).length} Active</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Tag className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Redemption Count</p>
              <h3 className="text-2xl font-bold mt-2">
                {coupons.reduce((sum, c) => sum + c.used_count, 0)} Uses
              </h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Savings Provided</p>
              <h3 className="text-2xl font-bold mt-2 text-foreground">₦450,000</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Coupon List */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Past Promo Codes</CardTitle>
          <CardDescription>
            Manage voucher codes redeemable by customers during checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                  <th className="py-3 px-4">Promo Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min Spend</th>
                  <th className="py-3 px-4">Usage (Used / Limit)</th>
                  <th className="py-3 px-4">Expiration</th>
                  <th className="py-3 px-4">Active Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-primary flex items-center gap-2">
                      {coupon.code}
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td className="py-4 px-4 font-bold text-foreground">
                      {coupon.type === 'percentage'
                        ? `${coupon.value}% OFF`
                        : `₦${coupon.value.toLocaleString()} OFF`}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      ₦{coupon.min_spend_ngn.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      {coupon.used_count} / {coupon.usage_limit}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {coupon.expires_at}
                    </td>
                    <td className="py-4 px-4">
                      <Switch
                        checked={coupon.active}
                        onCheckedChange={() => toggleCouponStatus(coupon.id)}
                      />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setCoupons(coupons.filter((c) => c.id !== coupon.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Coupon Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Promo Code</DialogTitle>
            <DialogDescription>
              Define coupon rules and discount value for customer checkout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="code">Promo Code</Label>
              <Input
                id="code"
                placeholder="e.g. MERCH10"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Discount Type</Label>
                <Select
                  value={newCoupon.type}
                  onValueChange={(val) => setNewCoupon({ ...newCoupon, type: val })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">Discount Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minSpend">Min Spend (NGN ₦)</Label>
                <Input
                  id="minSpend"
                  type="number"
                  value={newCoupon.min_spend_ngn}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, min_spend_ngn: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label htmlFor="limit">Usage Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  value={newCoupon.usage_limit}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, usage_limit: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expires">Expiration Date</Label>
              <Input
                id="expires"
                type="date"
                value={newCoupon.expires_at}
                onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCoupon}>Create Coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
