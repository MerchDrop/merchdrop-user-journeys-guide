import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Banknote,
  CreditCard,
  Wallet,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'paypal' | 'stripe';
  label: string;
  details: string;
  isDefault: boolean;
}

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentMethodDialog({ open, onOpenChange }: PaymentMethodDialogProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'bank_transfer' | 'paypal' | 'stripe'>('bank_transfer');
  const { toast } = useToast();

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    toast({
      title: "Default Updated",
      description: "Payment method set as default",
    });
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
    toast({
      title: "Method Removed",
      description: "Payment method has been deleted",
    });
  };

  const handleAddMethod = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate adding new method
    const newMethod: PaymentMethod = {
      id: (paymentMethods.length + 1).toString(),
      type: newMethodType,
      label: newMethodType === 'bank_transfer' ? 'New Bank Account' : 
             newMethodType === 'paypal' ? 'PayPal Account' : 'Stripe Connect',
      details: newMethodType === 'bank_transfer' ? '••••5678' : 'new@example.com',
      isDefault: paymentMethods.length === 0
    };
    
    setPaymentMethods([...paymentMethods, newMethod]);
    setIsAdding(false);
    toast({
      title: "Method Added",
      description: "New payment method has been added successfully",
    });
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer': return Banknote;
      case 'paypal': return Wallet;
      case 'stripe': return CreditCard;
      default: return CreditCard;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </DialogTitle>
          <DialogDescription>
            Manage your payout payment methods
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="space-y-4 p-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">My Methods</TabsTrigger>
            <TabsTrigger value="add">Add New</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No payment methods added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = getMethodIcon(method.type);
                  return (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {method.details}
                            {method.isDefault && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(method.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <form onSubmit={handleAddMethod} className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method Type</Label>
                <Select value={newMethodType} onValueChange={(value: any) => setNewMethodType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="paypal">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        PayPal
                      </div>
                    </SelectItem>
                    <SelectItem value="stripe">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Stripe Connect
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMethodType === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input id="bank-name" placeholder="Enter bank name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input id="account-number" placeholder="Enter account number" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routing-number">Routing Number</Label>
                    <Input id="routing-number" placeholder="Enter routing number" required />
                  </div>
                </div>
              )}

              {newMethodType === 'paypal' && (
                <div className="space-y-2">
                  <Label htmlFor="paypal-email">PayPal Email</Label>
                  <Input id="paypal-email" type="email" placeholder="Enter PayPal email" required />
                </div>
              )}

              {newMethodType === 'stripe' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to Stripe to connect your account securely.
                  </p>
                  <Button type="button" variant="outline" className="w-full">
                    Connect with Stripe
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}