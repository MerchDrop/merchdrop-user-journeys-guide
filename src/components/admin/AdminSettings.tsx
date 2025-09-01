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
  FileText,
  Server,
  HardDrive,
  Activity,
  Clock,
  Palette,
  Languages,
  Smartphone,
  Link2,
  Eye
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
        {/* App Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              App Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">App Name</Label>
                <Input
                  id="app-name"
                  placeholder="MerchDrop"
                  defaultValue="MerchDrop"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-version">App Version</Label>
                <Input
                  id="app-version"
                  placeholder="1.0.0"
                  defaultValue="1.0.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-tagline">App Tagline</Label>
                <Input
                  id="app-tagline"
                  placeholder="Create, Sell, Succeed"
                  defaultValue="Create, Sell, Succeed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-url">Primary App URL</Label>
                <Input
                  id="app-url"
                  placeholder="https://merchdrop.com"
                  defaultValue="https://merchdrop.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-description">App Description</Label>
              <Textarea
                id="app-description"
                placeholder="Enter app description..."
                defaultValue="A marketplace connecting artists with customers for custom merchandise and creative designs."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="contact@merchdrop.com"
                  defaultValue="contact@merchdrop.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder="support@merchdrop.com"
                  defaultValue="support@merchdrop.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="MerchDrop Inc."
                  defaultValue="MerchDrop Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Company Address</Label>
                <Input
                  id="company-address"
                  placeholder="123 Business St, City, State 12345"
                  defaultValue=""
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding & Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding & Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  placeholder="https://your-cdn.com/logo.png"
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon-url">Favicon URL</Label>
                <Input
                  id="favicon-url"
                  placeholder="https://your-cdn.com/favicon.ico"
                  defaultValue=""
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Brand Color</Label>
                <Input
                  id="primary-color"
                  type="color"
                  defaultValue="#3b82f6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Brand Color</Label>
                <Input
                  id="secondary-color"
                  type="color"
                  defaultValue="#10b981"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-theme">Default Theme</Label>
              <Select defaultValue="light">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System Preference</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Theme Switching</Label>
                <p className="text-sm text-muted-foreground">
                  Let users switch between light and dark themes
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-image">Social Share Image URL</Label>
              <Input
                id="og-image"
                placeholder="https://your-cdn.com/og-image.jpg"
                defaultValue=""
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media & Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Social Media & Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook-url">Facebook URL</Label>
                <Input
                  id="facebook-url"
                  placeholder="https://facebook.com/merchdrop"
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter-url">Twitter/X URL</Label>
                <Input
                  id="twitter-url"
                  placeholder="https://twitter.com/merchdrop"
                  defaultValue=""
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram-url">Instagram URL</Label>
                <Input
                  id="instagram-url"
                  placeholder="https://instagram.com/merchdrop"
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin-url">LinkedIn URL</Label>
                <Input
                  id="linkedin-url"
                  placeholder="https://linkedin.com/company/merchdrop"
                  defaultValue=""
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input
                  id="youtube-url"
                  placeholder="https://youtube.com/@merchdrop"
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok-url">TikTok URL</Label>
                <Input
                  id="tiktok-url"
                  placeholder="https://tiktok.com/@merchdrop"
                  defaultValue=""
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-url">Blog URL</Label>
              <Input
                id="blog-url"
                placeholder="https://blog.merchdrop.com"
                defaultValue=""
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Feature Toggles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Reviews & Ratings</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to review products and artists
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Wishlist Feature</Label>
                <p className="text-sm text-muted-foreground">
                  Enable product wishlist functionality
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Live Chat Support</Label>
                <p className="text-sm text-muted-foreground">
                  Enable live chat widget for customer support
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Social Login</Label>
                <p className="text-sm text-muted-foreground">
                  Allow login via Google, Facebook, etc.
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Multi-language Support</Label>
                <p className="text-sm text-muted-foreground">
                  Enable multiple language options
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mobile App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send push notifications to mobile app users
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Newsletter Subscription</Label>
                <p className="text-sm text-muted-foreground">
                  Show newsletter signup options
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Localization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-language">Default Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="mm/dd/yyyy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number-format">Number Format</Label>
                <Select defaultValue="1,234.56">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1,234.56">1,234.56 (US)</SelectItem>
                    <SelectItem value="1.234,56">1.234,56 (EU)</SelectItem>
                    <SelectItem value="1 234,56">1 234,56 (FR)</SelectItem>
                    <SelectItem value="1'234.56">1'234.56 (CH)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-day-week">First Day of Week</Label>
                <Select defaultValue="sunday">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supported-languages">Supported Languages</Label>
              <Textarea
                id="supported-languages"
                placeholder="en, es, fr, de"
                defaultValue="en, es, fr"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mobile App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile App Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ios-app-url">iOS App Store URL</Label>
                <Input
                  id="ios-app-url"
                  placeholder="https://apps.apple.com/app/merchdrop"
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="android-app-url">Google Play Store URL</Label>
                <Input
                  id="android-app-url"
                  placeholder="https://play.google.com/store/apps/details?id=com.merchdrop"
                  defaultValue=""
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-version-ios">iOS App Version</Label>
                <Input
                  id="app-version-ios"
                  placeholder="1.0.0"
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-version-android">Android App Version</Label>
                <Input
                  id="app-version-android"
                  placeholder="1.0.0"
                  defaultValue=""
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Force App Update</Label>
                <p className="text-sm text-muted-foreground">
                  Force users to update to the latest app version
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show App Download Banner</Label>
                <p className="text-sm text-muted-foreground">
                  Show mobile app download banner on web
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-banner-text">App Banner Text</Label>
              <Input
                id="app-banner-text"
                placeholder="Get our mobile app for the best experience!"
                defaultValue="Get our mobile app for the best experience!"
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="privacy-policy-url">Privacy Policy URL</Label>
                <Input
                  id="privacy-policy-url"
                  placeholder="/privacy"
                  defaultValue="/privacy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms-of-service-url">Terms of Service URL</Label>
                <Input
                  id="terms-of-service-url"
                  placeholder="/terms"
                  defaultValue="/terms"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cookie-policy-url">Cookie Policy URL</Label>
                <Input
                  id="cookie-policy-url"
                  placeholder="/cookies"
                  defaultValue=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gdpr-contact">GDPR Contact Email</Label>
                <Input
                  id="gdpr-contact"
                  type="email"
                  placeholder="privacy@merchdrop.com"
                  defaultValue=""
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cookie Consent Banner</Label>
                <p className="text-sm text-muted-foreground">
                  Show cookie consent banner for GDPR compliance
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Age Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require age verification for new accounts
                </p>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copyright-notice">Copyright Notice</Label>
              <Input
                id="copyright-notice"
                placeholder="© 2024 MerchDrop Inc. All rights reserved."
                defaultValue="© 2024 MerchDrop Inc. All rights reserved."
              />
            </div>
          </CardContent>
        </Card>

        {/* API Keys & Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              API Keys & Payment Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paystack-public-key">Paystack Public Key</Label>
                <Input
                  id="paystack-public-key"
                  placeholder="pk_test_..."
                  defaultValue=""
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack-secret-key">Paystack Secret Key</Label>
                <Input
                  id="paystack-secret-key"
                  placeholder="sk_test_..."
                  defaultValue=""
                  type="password"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-public-key">Stripe Public Key</Label>
                <Input
                  id="stripe-public-key"
                  placeholder="pk_test_..."
                  defaultValue=""
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-secret-key">Stripe Secret Key</Label>
                <Input
                  id="stripe-secret-key"
                  placeholder="sk_test_..."
                  defaultValue=""
                  type="password"
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
                <Select defaultValue="NGN">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
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

        {/* Database Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-connections">Max Connections</Label>
                <Input
                  id="max-connections"
                  type="number"
                  placeholder="100"
                  defaultValue="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connection-timeout">Connection Timeout (seconds)</Label>
                <Input
                  id="connection-timeout"
                  type="number"
                  placeholder="30"
                  defaultValue="30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="query-timeout">Query Timeout (seconds)</Label>
                <Input
                  id="query-timeout"
                  type="number"
                  placeholder="60"
                  defaultValue="60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statement-timeout">Statement Timeout (seconds)</Label>
                <Input
                  id="statement-timeout"
                  type="number"
                  placeholder="30"
                  defaultValue="30"
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Row Level Security (RLS)</Label>
                <p className="text-sm text-muted-foreground">
                  Enable RLS for all new tables by default
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Audit Logging</Label>
                <p className="text-sm text-muted-foreground">
                  Log all database operations for compliance
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Query Performance Insights</Label>
                <p className="text-sm text-muted-foreground">
                  Monitor and analyze slow queries
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Backup & Recovery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Backup & Recovery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backup-schedule">Backup Schedule</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-retention">Retention Period (days)</Label>
                <Input
                  id="backup-retention"
                  type="number"
                  placeholder="30"
                  defaultValue="30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backup-location">Backup Storage Location</Label>
                <Select defaultValue="s3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Storage</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                    <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                    <SelectItem value="azure">Azure Blob Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-compression">Compression Level</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Point-in-Time Recovery</Label>
                <p className="text-sm text-muted-foreground">
                  Enable continuous backup for recovery
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Encryption</Label>
                <p className="text-sm text-muted-foreground">
                  Encrypt backup files at rest
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Performance Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slow-query-threshold">Slow Query Threshold (ms)</Label>
                <Input
                  id="slow-query-threshold"
                  type="number"
                  placeholder="1000"
                  defaultValue="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metrics-retention">Metrics Retention (days)</Label>
                <Input
                  id="metrics-retention"
                  type="number"
                  placeholder="90"
                  defaultValue="90"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu-alert-threshold">CPU Alert Threshold (%)</Label>
                <Input
                  id="cpu-alert-threshold"
                  type="number"
                  placeholder="80"
                  defaultValue="80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory-alert-threshold">Memory Alert Threshold (%)</Label>
                <Input
                  id="memory-alert-threshold"
                  type="number"
                  placeholder="85"
                  defaultValue="85"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Real-time Monitoring</Label>
                <p className="text-sm text-muted-foreground">
                  Monitor database performance in real-time
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Index Usage Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Track index usage and optimization suggestions
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Query Plan Caching</Label>
                <p className="text-sm text-muted-foreground">
                  Cache execution plans for faster queries
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Storage Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Storage Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storage-limit">Storage Limit (GB)</Label>
                <Input
                  id="storage-limit"
                  type="number"
                  placeholder="500"
                  defaultValue="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage-alert-threshold">Storage Alert Threshold (%)</Label>
                <Input
                  id="storage-alert-threshold"
                  type="number"
                  placeholder="90"
                  defaultValue="90"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="auto-vacuum-scale">Auto Vacuum Scale Factor</Label>
                <Input
                  id="auto-vacuum-scale"
                  type="number"
                  step="0.1"
                  placeholder="0.2"
                  defaultValue="0.2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vacuum-cost-delay">Vacuum Cost Delay (ms)</Label>
                <Input
                  id="vacuum-cost-delay"
                  type="number"
                  placeholder="20"
                  defaultValue="20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Vacuum</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically clean up dead tuples
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Table Statistics Auto-update</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically update table statistics for better query plans
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance-window">Maintenance Window</Label>
              <Select defaultValue="sunday-2am">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday-2am">Sunday 2:00 AM</SelectItem>
                  <SelectItem value="saturday-3am">Saturday 3:00 AM</SelectItem>
                  <SelectItem value="daily-3am">Daily 3:00 AM</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Connection Pooling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Connection Pooling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pool-size">Pool Size</Label>
                <Input
                  id="pool-size"
                  type="number"
                  placeholder="20"
                  defaultValue="20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-overflow">Max Overflow</Label>
                <Input
                  id="max-overflow"
                  type="number"
                  placeholder="30"
                  defaultValue="30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pool-timeout">Pool Timeout (seconds)</Label>
                <Input
                  id="pool-timeout"
                  type="number"
                  placeholder="30"
                  defaultValue="30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pool-recycle">Pool Recycle (seconds)</Label>
                <Input
                  id="pool-recycle"
                  type="number"
                  placeholder="3600"
                  defaultValue="3600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pooling-mode">Pooling Mode</Label>
              <Select defaultValue="transaction">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="session">Session</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                  <SelectItem value="statement">Statement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Connection Pool Monitoring</Label>
                <p className="text-sm text-muted-foreground">
                  Monitor connection pool usage and performance
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Pool Pre-ping</Label>
                <p className="text-sm text-muted-foreground">
                  Test connections before use
                </p>
              </div>
              <Switch defaultChecked />
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