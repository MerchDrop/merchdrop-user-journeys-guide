import { useCallback, useEffect, useState } from 'react';
import { Tag, Plus, DollarSign, Copy, Trash2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Coupon = Tables<'coupons'>;

const EMPTY_FORM = { code: '', type: 'percentage', value: '10', min_spend: '0', usage_limit: '', expires_at: '' };

export default function AdminPromotions() {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null);

  const load = useCallback(async () => {
    const [{ data, error }, { data: orders }] = await Promise.all([
      supabase.from('coupons').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('discount_amount').eq('payment_status', 'paid').gt('discount_amount', 0),
    ]);
    if (error) {
      toast({ title: "Couldn't load promo codes", description: error.message, variant: 'destructive' });
      setCoupons([]);
      return;
    }
    setCoupons(data ?? []);
    setTotalSavings((orders ?? []).reduce((sum, o) => sum + Number(o.discount_amount), 0));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);
    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
      toast({ title: 'Invalid code', description: 'Use 3–32 letters, numbers, - or _.', variant: 'destructive' });
      return;
    }
    if (!(value > 0) || (form.type === 'percentage' && value > 100)) {
      toast({ title: 'Invalid discount', description: 'Percentages must be 1–100; amounts above 0.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('coupons').insert({
      code,
      type: form.type,
      value,
      min_spend: Number(form.min_spend) || 0,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      // End of the chosen day, local time.
      expires_at: form.expires_at ? new Date(`${form.expires_at}T23:59:59`).toISOString() : null,
    });
    setSaving(false);
    if (error) {
      toast({
        title: "Couldn't create code",
        description: error.code === '23505' ? `${code} already exists.` : error.message,
        variant: 'destructive',
      });
      return;
    }
    setIsCreateOpen(false);
    setForm(EMPTY_FORM);
    toast({ title: 'Promo code created', description: `${code} can be used at checkout now.` });
    load();
  };

  const toggleActive = async (coupon: Coupon) => {
    const { error } = await supabase.from('coupons').update({ active: !coupon.active }).eq('id', coupon.id);
    if (error) {
      toast({ title: "Couldn't update code", description: error.message, variant: 'destructive' });
      return;
    }
    setCoupons((prev) => prev?.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c)) ?? null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { error } = await supabase.from('coupons').delete().eq('id', pendingDelete.id);
    if (error) {
      toast({ title: "Couldn't delete code", description: error.message, variant: 'destructive' });
    } else {
      setCoupons((prev) => prev?.filter((c) => c.id !== pendingDelete.id) ?? null);
    }
    setPendingDelete(null);
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: 'Code copied', description: `${code} copied to clipboard.` });
    } catch {
      toast({ title: "Couldn't copy", description: code });
    }
  };

  const list = coupons ?? [];
  const isExpired = (c: Coupon) => c.expires_at !== null && Date.parse(c.expires_at) < Date.now();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="h-8 w-8 text-primary" />
            Discounts & Promo Codes
          </h1>
          <p className="text-muted-foreground mt-1">
            Codes customers can enter at checkout. Discounts apply to the item subtotal, not delivery.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create Promo Code
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active codes</p>
              <h3 className="text-2xl font-bold mt-2">{list.filter((c) => c.active && !isExpired(c)).length}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Tag className="h-6 w-6" /></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Times used</p>
              <h3 className="text-2xl font-bold mt-2">{list.reduce((sum, c) => sum + c.used_count, 0)}</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl text-green-600"><TrendingUp className="h-6 w-6" /></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer savings (paid orders)</p>
              <h3 className="text-2xl font-bold mt-2 text-foreground">{formatPrice(totalSavings)}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600"><DollarSign className="h-6 w-6" /></div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promo codes</CardTitle>
          <CardDescription>Switch a code off to stop new orders using it. Deleting doesn't change past orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {coupons === null ? (
            <div className="h-24 rounded-md bg-muted animate-pulse" aria-busy="true" />
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No promo codes yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Min spend</th>
                    <th className="py-3 px-4">Used / limit</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4">Active</th>
                    <th className="py-3 px-4 text-right"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {list.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-primary">
                        <span className="inline-flex items-center gap-2">
                          {coupon.code}
                          <button onClick={() => copyCode(coupon.code)} aria-label={`Copy ${coupon.code}`}
                            className="text-muted-foreground hover:text-foreground">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold">
                        {coupon.type === 'percentage' ? `${Number(coupon.value)}% off` : `${formatPrice(Number(coupon.value))} off`}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {Number(coupon.min_spend) > 0 ? formatPrice(Number(coupon.min_spend)) : '—'}
                      </td>
                      <td className="py-4 px-4">{coupon.used_count} / {coupon.usage_limit ?? '∞'}</td>
                      <td className="py-4 px-4 text-xs text-muted-foreground">
                        {coupon.expires_at
                          ? <span className={isExpired(coupon) ? 'text-destructive' : ''}>
                              {new Date(coupon.expires_at).toLocaleDateString()}{isExpired(coupon) && ' (expired)'}
                            </span>
                          : 'Never'}
                      </td>
                      <td className="py-4 px-4">
                        <Switch checked={coupon.active} onCheckedChange={() => toggleActive(coupon)}
                          aria-label={`${coupon.code} active`} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"
                          onClick={() => setPendingDelete(coupon)} aria-label={`Delete ${coupon.code}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create promo code</DialogTitle>
            <DialogDescription>Customers enter this code at checkout.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 px-6 overflow-y-auto flex-1 min-h-0">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" placeholder="e.g. LAUNCH10" className="uppercase" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Discount type</Label>
                <Select value={form.type} onValueChange={(type) => setForm({ ...form, type })}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed amount (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">{form.type === 'percentage' ? 'Percent off' : 'Amount off (₦)'}</Label>
                <Input id="value" type="number" min={1} max={form.type === 'percentage' ? 100 : undefined}
                  value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minSpend">Min spend (₦)</Label>
                <Input id="minSpend" type="number" min={0} value={form.min_spend}
                  onChange={(e) => setForm({ ...form, min_spend: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="limit">Usage limit</Label>
                <Input id="limit" type="number" min={1} placeholder="Unlimited" value={form.usage_limit}
                  onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="expires">Expires after</Label>
              <Input id="expires" type="date" value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">Leave empty for no expiry.</p>
            </div>
          </div>
          <DialogFooter className="px-6 py-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create code'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {pendingDelete?.code}?</DialogTitle>
            <DialogDescription>Customers won't be able to use it. Past orders keep their discount.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 py-4">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
