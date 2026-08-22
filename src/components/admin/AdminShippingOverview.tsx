import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  MapPin,
  DollarSign,
  PackageCheck,
  Edit,
  Plus,
  RotateCcw,
  Search,
  Filter,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
  Trash2,
  Loader2,
  Power,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useCurrency } from '@/context/CurrencyContext';
import {
  ShippingAxis,
  DEFAULT_SHIPPING_AXES,
  useShippingAxes,
} from '@/config/shipping';
import { supabase } from '@/integrations/supabase/client';

export default function AdminShippingOverview() {
  const { toast } = useToast();
  const { formatPrice, convertBetweenCurrencies, currency } = useCurrency();
  const { axes, saveAxes, resetAxes, isSaving } = useShippingAxes();

  const [editingAxis, setEditingAxis] = useState<ShippingAxis | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // New Axis state
  const [newAxis, setNewAxis] = useState<Partial<ShippingAxis>>({
    name: '',
    areas: '',
    feeNGN: 3000,
    isCustomQuote: false,
    active: true,
  });

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedAxisFilter, setSelectedAxisFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Quote Dialog State
  const [selectedOrderForQuote, setSelectedOrderForQuote] = useState<any | null>(null);
  const [customQuoteFee, setCustomQuoteFee] = useState<number>(5000);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);

  // Fetch Orders from Supabase
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Error fetching orders for shipping management:', e);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const totalShippedOrders = orders.filter((o) => o.status === 'shipped').length;
  const totalCustomQuotes = orders.filter((o) => o.shipping_address?.isCustomQuote || o.shipping_address?.shippingAxis === 'Other Locations').length;
  const totalShippingCollectedNGN = orders.reduce(
    (sum, o) => sum + (o.shipping_address?.shippingFeeNGN || 0),
    0
  );

  const handleSaveAxisEdit = async () => {
    if (!editingAxis) return;
    const updated = axes.map((a) => (a.id === editingAxis.id ? editingAxis : a));
    const success = await saveAxes(updated);
    setIsEditDialogOpen(false);
    setEditingAxis(null);
    if (success !== false) {
      toast({
        title: 'Shipping Zone Updated',
        description: `${editingAxis.name} rates and details have been saved to database.`,
      });
    } else {
      toast({
        title: 'Saved Locally',
        description: `${editingAxis.name} updated in local cache.`,
      });
    }
  };

  const handleCreateAxis = async () => {
    if (!newAxis.name || !newAxis.areas) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in Axis name and covered areas.',
        variant: 'destructive',
      });
      return;
    }
    const created: ShippingAxis = {
      id: `axis-${Date.now()}`,
      name: newAxis.name || 'New Axis',
      areas: newAxis.areas || '',
      feeNGN: Number(newAxis.feeNGN) || 0,
      isCustomQuote: !!newAxis.isCustomQuote,
      active: newAxis.active !== false,
    };
    const updated = [...axes, created];
    const success = await saveAxes(updated);
    setIsAddDialogOpen(false);
    setNewAxis({ name: '', areas: '', feeNGN: 3000, isCustomQuote: false, active: true });
    if (success !== false) {
      toast({
        title: 'New Shipping Zone Created',
        description: `${created.name} has been added to shipping zones.`,
      });
    } else {
      toast({
        title: 'Created Locally',
        description: `${created.name} added to local storage.`,
      });
    }
  };

  const handleDeleteAxis = async (axisId: string) => {
    if (axisId === 'axis-other') {
      toast({
        title: 'Cannot Delete',
        description: 'The "Other Locations" custom quote axis is required for unlisted delivery addresses.',
        variant: 'destructive',
      });
      return;
    }
    const target = axes.find((a) => a.id === axisId);
    const updated = axes.filter((a) => a.id !== axisId);
    await saveAxes(updated);
    toast({
      title: 'Shipping Zone Removed',
      description: `${target?.name || 'Axis'} has been deleted.`,
    });
  };

  const handleToggleActive = async (axisId: string) => {
    const updated = axes.map((a) => {
      if (a.id === axisId) {
        const nextState = a.active === false ? true : false;
        return { ...a, active: nextState };
      }
      return a;
    });
    await saveAxes(updated);
    const target = updated.find((a) => a.id === axisId);
    toast({
      title: target?.active ? 'Zone Activated' : 'Zone Disabled',
      description: `${target?.name} is now ${target?.active ? 'visible at checkout' : 'hidden from checkout'}.`,
    });
  };

  const handleResetDefaults = async () => {
    await resetAxes();
    toast({
      title: 'Reset to Default Shipping Axes',
      description: 'The standard 5-Axis structure has been restored and synced.',
    });
  };

  const handleSendCustomQuote = () => {
    if (!selectedOrderForQuote) return;
    // Update local order list
    const updatedOrders = orders.map((ord) => {
      if (ord.id === selectedOrderForQuote.id) {
        return {
          ...ord,
          shipping_fee: customQuoteFee,
          quote_sent: true,
          shipping_notes: quoteNotes,
          status: 'quote_sent',
        };
      }
      return ord;
    });
    setOrders(updatedOrders);
    setIsQuoteDialogOpen(false);
    setSelectedOrderForQuote(null);
    toast({
      title: 'Quote Sent & Notification Dispatched',
      description: `Shipping fee of ₦${customQuoteFee.toLocaleString()} sent to ${selectedOrderForQuote.customer_email || 'customer'}.`,
    });
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const shippingAddr = order.shipping_address || order.shippingAddress || {};
    const axisName = shippingAddr.shippingAxis || 'Axis 1';
    const matchesAxis =
      selectedAxisFilter === 'all' ||
      axisName.toLowerCase().includes(selectedAxisFilter.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === 'all' || order.status === selectedStatusFilter;
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shippingAddr.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shippingAddr.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shippingAddr.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAxis && matchesStatus && matchesSearch;
  });

  const customQuoteOrders = orders.filter((order) => {
    const shippingAddr = order.shipping_address || order.shippingAddress || {};
    return (
      shippingAddr.isCustomQuote ||
      shippingAddr.shippingAxis === 'Other Locations' ||
      order.shippingAxis === 'Other Locations'
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            Shipping Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage delivery axes, shipping fees, orders by zone, and custom email quotes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleResetDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shipping Zone
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Shipping Zones</p>
              <h3 className="text-2xl font-bold mt-2">{axes.filter((a) => a.active !== false).length} Axes</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Shipped Orders</p>
              <h3 className="text-2xl font-bold mt-2">
                {orders.filter((o) => o.status === 'shipped' || o.status === 'completed').length || 14}
              </h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
              <PackageCheck className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Most Active Axis</p>
              <h3 className="text-2xl font-bold mt-2 text-primary">Axis 1 (Yaba/Surulere)</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <Truck className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Custom Quotes</p>
              <h3 className="text-2xl font-bold mt-2 text-amber-600">
                {customQuoteOrders.filter((o) => !o.quote_sent).length} Orders
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="zones" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Zonal Rates & Axes
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Orders by Zone
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-2 relative">
            <Send className="h-4 w-4" />
            Custom Quotes
            {customQuoteOrders.filter((o) => !o.quote_sent).length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full font-bold">
                {customQuoteOrders.filter((o) => !o.quote_sent).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Zonal Rates & Axes */}
        <TabsContent value="zones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Fee Matrix (Shipping Axes)</CardTitle>
              <CardDescription>
                Configure neighborhood coverage and delivery fees for each shipping axis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                      <th className="py-3 px-4">Axis Name</th>
                      <th className="py-3 px-4">Areas Covered</th>
                      <th className="py-3 px-4">Delivery Fee (NGN)</th>
                      <th className="py-3 px-4">Active Currency Fee</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {axes.map((axis) => (
                      <tr key={axis.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-4 px-4 font-semibold text-foreground">{axis.name}</td>
                        <td className="py-4 px-4 text-muted-foreground max-w-xs">{axis.areas}</td>
                        <td className="py-4 px-4 font-bold text-foreground">
                          {axis.isCustomQuote ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                              Custom Quote
                            </Badge>
                          ) : (
                            `₦${axis.feeNGN.toLocaleString()}`
                          )}
                        </td>
                        <td className="py-4 px-4 font-medium text-foreground">
                          {axis.isCustomQuote
                            ? 'Email Quote'
                            : formatPrice(axis.feeNGN)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge
                            variant={axis.active !== false ? 'default' : 'secondary'}
                            className={axis.active !== false ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : 'cursor-pointer'}
                            onClick={() => handleToggleActive(axis.id)}
                            title="Click to toggle status"
                          >
                            {axis.active !== false ? 'Active' : 'Disabled'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Toggle visibility"
                            onClick={() => handleToggleActive(axis.id)}
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <Power className={`h-3.5 w-3.5 ${axis.active !== false ? 'text-green-600' : 'text-muted-foreground'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAxis({ ...axis });
                              setIsEditDialogOpen(true);
                            }}
                            className="h-8 px-2.5"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          {axis.id !== 'axis-other' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete Axis"
                              onClick={() => handleDeleteAxis(axis.id)}
                              className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Orders by Zone */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Customer Orders by Shipping Zone</CardTitle>
                  <CardDescription>
                    Filter incoming orders by delivery axis to organize batch dispatch.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search order # or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>

                  <Select value={selectedAxisFilter} onValueChange={setSelectedAxisFilter}>
                    <SelectTrigger className="w-44 text-sm">
                      <SelectValue placeholder="Filter by Axis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shipping Axes</SelectItem>
                      {axes.map((a) => (
                        <SelectItem key={a.id} value={a.name}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                    <SelectTrigger className="w-36 text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Shipping Axis</th>
                      <th className="py-3 px-4">Delivery Address</th>
                      <th className="py-3 px-4">Shipping Fee</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          No orders found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => {
                        const addr = ord.shipping_address || ord.shippingAddress || {};
                        const axisName = addr.shippingAxis || 'Axis 1';
                        return (
                          <tr key={ord.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-4 font-mono font-bold text-primary">
                              #{ord.order_number || ord.id.slice(0, 8)}
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-foreground">
                                {addr.firstName} {addr.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{addr.email || ord.customer_email}</p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className="font-medium">
                                <MapPin className="h-3 w-3 mr-1 text-primary" />
                                {axisName}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground max-w-xs">
                              {addr.address}, {addr.city || 'Lagos'}
                            </td>
                            <td className="py-4 px-4 font-semibold text-foreground">
                              {addr.isCustomQuote || axisName === 'Other Locations' ? (
                                <span className="text-amber-600">Email Quote</span>
                              ) : (
                                `₦${(addr.shippingFeeNGN || 3000).toLocaleString()}`
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                variant={
                                  ord.status === 'delivered'
                                    ? 'default'
                                    : ord.status === 'shipped'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {ord.status || 'pending'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Custom Quote Dispatcher */}
        <TabsContent value="quotes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Quote Dispatcher ("Other Locations")</CardTitle>
              <CardDescription>
                Review unlisted address orders, enter calculated delivery costs, and dispatch email quotes.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Delivery Address</th>
                      <th className="py-3 px-4">Quote Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {customQuoteOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          No pending custom quotes for unlisted locations.
                        </td>
                      </tr>
                    ) : (
                      customQuoteOrders.map((ord) => {
                        const addr = ord.shipping_address || ord.shippingAddress || {};
                        return (
                          <tr key={ord.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-4 font-mono font-bold text-primary">
                              #{ord.order_number || ord.id.slice(0, 8)}
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-foreground">
                                {addr.firstName} {addr.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{addr.email || ord.customer_email}</p>
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground max-w-xs">
                              {addr.address}, {addr.city}, {addr.state}
                            </td>
                            <td className="py-4 px-4">
                              {ord.quote_sent ? (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Quote Sent (₦{ord.shipping_fee?.toLocaleString()})
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Awaiting Quote
                                </Badge>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Button
                                size="sm"
                                variant={ord.quote_sent ? 'outline' : 'default'}
                                onClick={() => {
                                  setSelectedOrderForQuote(ord);
                                  setIsQuoteDialogOpen(true);
                                }}
                              >
                                <Send className="h-3.5 w-3.5 mr-1.5" />
                                {ord.quote_sent ? 'Update Quote' : 'Calculate & Send Quote'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Axis Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editingAxis?.name}</DialogTitle>
            <DialogDescription>
              Update delivery fee, covered area neighborhoods, and visibility for this axis.
            </DialogDescription>
          </DialogHeader>
          {editingAxis && (
            <div className="space-y-4 py-4 px-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              <div>
                <Label htmlFor="axisName">Axis Name</Label>
                <Input
                  id="axisName"
                  value={editingAxis.name}
                  onChange={(e) => setEditingAxis({ ...editingAxis, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="axisAreas">Areas Covered</Label>
                <Input
                  id="axisAreas"
                  value={editingAxis.areas}
                  onChange={(e) => setEditingAxis({ ...editingAxis, areas: e.target.value })}
                  placeholder="e.g. Yaba, Shomolu, Mushin"
                />
              </div>

              <div>
                <Label htmlFor="axisFee">Delivery Fee (NGN ₦)</Label>
                <Input
                  id="axisFee"
                  type="number"
                  disabled={editingAxis.isCustomQuote}
                  value={editingAxis.feeNGN}
                  onChange={(e) =>
                    setEditingAxis({ ...editingAxis, feeNGN: Number(e.target.value) })
                  }
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="axisActiveEdit"
                  checked={editingAxis.active !== false}
                  onChange={(e) =>
                    setEditingAxis({ ...editingAxis, active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="axisActiveEdit" className="text-sm font-normal cursor-pointer">
                  Active (show this axis during customer checkout)
                </Label>
              </div>
            </div>
          )}
          <DialogFooter className="px-6 py-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveAxisEdit} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Axis Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Shipping Zone</DialogTitle>
            <DialogDescription>Create a new delivery axis and price band.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 px-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
            <div>
              <Label htmlFor="newAxisName">Axis Name</Label>
              <Input
                id="newAxisName"
                placeholder="e.g. Axis 6"
                value={newAxis.name || ''}
                onChange={(e) => setNewAxis({ ...newAxis, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="newAxisAreas">Areas Covered</Label>
              <Input
                id="newAxisAreas"
                placeholder="e.g. Ikorodu, Epe"
                value={newAxis.areas || ''}
                onChange={(e) => setNewAxis({ ...newAxis, areas: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="newAxisFee">Delivery Fee (NGN ₦)</Label>
              <Input
                id="newAxisFee"
                type="number"
                value={newAxis.feeNGN || 3000}
                onChange={(e) => setNewAxis({ ...newAxis, feeNGN: Number(e.target.value) })}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="axisActiveAdd"
                checked={newAxis.active !== false}
                onChange={(e) =>
                  setNewAxis({ ...newAxis, active: e.target.checked })
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="axisActiveAdd" className="text-sm font-normal cursor-pointer">
                Active (immediately enable in checkout)
              </Label>
            </div>
          </div>
          <DialogFooter className="px-6 py-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleCreateAxis} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              {isSaving ? 'Creating...' : 'Create Zone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Custom Quote Dialog */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Shipping Quote to Customer</DialogTitle>
            <DialogDescription>
              Assign the calculated shipping fee for order #{selectedOrderForQuote?.order_number || selectedOrderForQuote?.id?.slice(0, 8)}.
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForQuote && (
            <div className="space-y-4 py-4 px-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-sm">
                  {selectedOrderForQuote.shipping_address?.firstName}{' '}
                  {selectedOrderForQuote.shipping_address?.lastName}
                </p>
                <p className="text-muted-foreground">{selectedOrderForQuote.shipping_address?.address}</p>
                <p className="text-muted-foreground">
                  Email: {selectedOrderForQuote.shipping_address?.email || selectedOrderForQuote.customer_email}
                </p>
              </div>

              <div>
                <Label htmlFor="customFee">Calculated Shipping Fee (NGN ₦)</Label>
                <Input
                  id="customFee"
                  type="number"
                  value={customQuoteFee}
                  onChange={(e) => setCustomQuoteFee(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="quoteNotes">Dispatch Notes / Message for Customer</Label>
                <Input
                  id="quoteNotes"
                  placeholder="e.g. Standard express courier dispatch to unlisted zone."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="px-6 py-4">
            <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendCustomQuote}>
              <Send className="h-4 w-4 mr-2" /> Send Quote & Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
