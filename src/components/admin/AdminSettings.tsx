import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Truck, 
  Gift, 
  Shield, 
  Mail, 
  Globe, 
  Database, 
  Bell,
  Settings2,
  BarChart3,
  Image,
  FileText
} from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Platform settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Platform Settings</h2>
        <p className="text-muted-foreground">Configure platform operations and integrations</p>
      </div>

      <div className="grid gap-6">
        {/* Payment Gateway Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Gateways
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                <Input
                  id="stripe-key"
                  type="password"
                  placeholder="sk_live_..."
                  defaultValue="sk_live_************************************"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-webhook">Stripe Webhook Secret</Label>
                <Input
                  id="stripe-webhook"
                  type="password"
                  placeholder="whsec_..."
                  defaultValue="whsec_************************************"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paystack-key">Paystack Secret Key</Label>
                <Input
                  id="paystack-key"
                  type="password"
                  placeholder="sk_live_..."
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack-public">Paystack Public Key</Label>
                <Input
                  id="paystack-public"
                  placeholder="pk_live_..."
                  defaultValue=""
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fulfillment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Fulfillment Partners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="printful-key">Printful API Key</Label>
                <Input
                  id="printful-key"
                  type="password"
                  placeholder="Enter API key..."
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fulfillment-endpoint">Fulfillment Webhook URL</Label>
                <Input
                  id="fulfillment-endpoint"
                  placeholder="https://api.yourplatform.com/webhooks/fulfillment"
                  defaultValue="https://api.yourplatform.com/webhooks/fulfillment"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shipping-info">Default Shipping Information</Label>
              <Textarea
                id="shipping-info"
                placeholder="Enter default shipping details..."
                defaultValue="Standard shipping: 5-7 business days
Express shipping: 2-3 business days
International shipping: 10-14 business days"
              />
            </div>
          </CardContent>
        </Card>

        {/* Referral & Coupon Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Referral & Coupons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Referral Program</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to earn rewards for referrals
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referral-reward">Referral Reward (%)</Label>
                <Input
                  id="referral-reward"
                  type="number"
                  placeholder="10"
                  defaultValue="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-payout">Minimum Payout Amount</Label>
                <Input
                  id="min-payout"
                  type="number"
                  placeholder="50"
                  defaultValue="50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-prefix">Coupon Code Prefix</Label>
                <Input
                  id="coupon-prefix"
                  placeholder="ART"
                  defaultValue="ART"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-discount">Maximum Discount (%)</Label>
                <Input
                  id="max-discount"
                  type="number"
                  placeholder="50"
                  defaultValue="50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all admin accounts
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verification Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require email verification for new accounts
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Select defaultValue="60">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Email & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  placeholder="smtp.gmail.com"
                  defaultValue="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  placeholder="587"
                  defaultValue="587"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input
                  id="smtp-user"
                  placeholder="noreply@yourplatform.com"
                  defaultValue="noreply@yourplatform.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-pass">SMTP Password</Label>
                <Input
                  id="smtp-pass"
                  type="password"
                  placeholder="App password..."
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Confirmation Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Send automatic order confirmations
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Artist Application Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Notify admins of new artist applications
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Send weekly performance reports
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Platform Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input
                  id="platform-name"
                  placeholder="MerchDrop"
                  defaultValue="MerchDrop"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-url">Platform URL</Label>
                <Input
                  id="platform-url"
                  placeholder="https://merchdrop.com"
                  defaultValue="https://merchdrop.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-description">Platform Description</Label>
              <Textarea
                id="platform-description"
                placeholder="Enter platform description..."
                defaultValue="A marketplace connecting artists with customers for custom merchandise"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-currency">Default Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select defaultValue="UTC">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">EST - Eastern Time</SelectItem>
                    <SelectItem value="PST">PST - Pacific Time</SelectItem>
                    <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                    <SelectItem value="CET">CET - Central European Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put platform in maintenance mode
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Artist Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new artist registrations
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Content Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Max Upload Size (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  placeholder="10"
                  defaultValue="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowed-formats">Allowed File Formats</Label>
                <Input
                  id="allowed-formats"
                  placeholder="jpg, png, svg, pdf"
                  defaultValue="jpg, png, svg, pdf"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Image Compression</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically compress uploaded images
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Content Moderation</Label>
                <p className="text-sm text-muted-foreground">
                  Require admin approval for new content
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-guidelines">Content Guidelines</Label>
              <Textarea
                id="content-guidelines"
                placeholder="Enter content guidelines..."
                defaultValue="- No offensive or inappropriate content
- Original artwork only
- High-quality images required
- Proper attribution for collaborative work"
              />
            </div>
          </CardContent>
        </Card>

        {/* API & Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              API & Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api-rate-limit">API Rate Limit (per minute)</Label>
                <Input
                  id="api-rate-limit"
                  type="number"
                  placeholder="100"
                  defaultValue="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-timeout">Webhook Timeout (seconds)</Label>
                <Input
                  id="webhook-timeout"
                  type="number"
                  placeholder="30"
                  defaultValue="30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cors-origins">CORS Allowed Origins</Label>
              <Textarea
                id="cors-origins"
                placeholder="https://yourapp.com, https://app.yourplatform.com"
                defaultValue="https://yourapp.com, https://app.yourplatform.com"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>API Documentation Public</Label>
                <p className="text-sm text-muted-foreground">
                  Make API documentation publicly accessible
                </p>
              </div>
              <Switch />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="analytics-key">Google Analytics ID</Label>
                <Input
                  id="analytics-key"
                  placeholder="GA-XXXXXXXXX-X"
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
                <Input
                  id="facebook-pixel"
                  placeholder="123456789012345"
                  defaultValue=""
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cache-duration">Cache Duration (hours)</Label>
                <Input
                  id="cache-duration"
                  type="number"
                  placeholder="24"
                  defaultValue="24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Debug Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable detailed logging and error reporting
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Performance Monitoring</Label>
                <p className="text-sm text-muted-foreground">
                  Track platform performance metrics
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-css">Custom CSS</Label>
              <Textarea
                id="custom-css"
                placeholder="/* Add custom CSS here */"
                className="font-mono text-sm"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-js">Custom JavaScript</Label>
              <Textarea
                id="custom-js"
                placeholder="// Add custom JavaScript here"
                className="font-mono text-sm"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg">
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;