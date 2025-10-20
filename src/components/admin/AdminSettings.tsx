import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { 
  Settings2,
  Palette,
  Link2,
  Eye,
  Languages,
  Save,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminSettings = () => {
  const { settings, isLoading, saveSettings, isSaving } = usePlatformSettings();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData(settings);
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    if (Object.keys(settings).length > 0 && Object.keys(formData).length > 0) {
      const changed = JSON.stringify(settings) !== JSON.stringify(formData);
      setHasChanges(changed);
    }
  }, [formData, settings]);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    saveSettings(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Platform Settings</h2>
          <p className="text-muted-foreground">Configure platform operations and integrations</p>
        </div>
        {hasChanges && (
          <Alert className="w-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have unsaved changes
            </AlertDescription>
          </Alert>
        )}
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
                <Label htmlFor="app-name">Application Name</Label>
                <Input
                  id="app-name"
                  value={formData.app_name || ''}
                  onChange={(e) => handleChange('app_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-tagline">Tagline</Label>
                <Input
                  id="app-tagline"
                  value={formData.app_tagline || ''}
                  onChange={(e) => handleChange('app_tagline', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-url">Application URL</Label>
                <Input
                  id="app-url"
                  type="url"
                  value={formData.app_url || ''}
                  onChange={(e) => handleChange('app_url', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={formData.support_email || ''}
                  onChange={(e) => handleChange('support_email', e.target.value)}
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
                  type="url"
                  placeholder="https://..."
                  value={formData.logo_url || ''}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Brand Color</Label>
                <Input
                  id="primary-color"
                  type="color"
                  value={formData.primary_color || '#9b87f5'}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Brand Color</Label>
                <Input
                  id="secondary-color"
                  type="color"
                  value={formData.secondary_color || '#7E69AB'}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                />
              </div>
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
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={formData.facebook_url || ''}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X URL</Label>
                <Input
                  id="twitter"
                  type="url"
                  placeholder="https://twitter.com/..."
                  value={formData.twitter_url || ''}
                  onChange={(e) => handleChange('twitter_url', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={formData.instagram_url || ''}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/..."
                  value={formData.linkedin_url || ''}
                  onChange={(e) => handleChange('linkedin_url', e.target.value)}
                />
              </div>
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
                <Label>Enable Product Reviews</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to review products and artists
                </p>
              </div>
              <Switch
                checked={formData.enable_reviews ?? true}
                onCheckedChange={(checked) => handleChange('enable_reviews', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Wishlist</Label>
                <p className="text-sm text-muted-foreground">
                  Enable product wishlist functionality
                </p>
              </div>
              <Switch
                checked={formData.enable_wishlist ?? true}
                onCheckedChange={(checked) => handleChange('enable_wishlist', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications to users
                </p>
              </div>
              <Switch
                checked={formData.enable_notifications ?? true}
                onCheckedChange={(checked) => handleChange('enable_notifications', checked)}
              />
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
                <Label htmlFor="default-currency">Default Currency</Label>
                <Select
                  value={formData.default_currency || 'NGN'}
                  onValueChange={(value) => handleChange('default_currency', value)}
                >
                  <SelectTrigger id="default-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-language">Default Language</Label>
                <Select
                  value={formData.default_language || 'en'}
                  onValueChange={(value) => handleChange('default_language', value)}
                >
                  <SelectTrigger id="default-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone || 'UTC'}
                onValueChange={(value) => handleChange('timezone', value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">EST - Eastern Time</SelectItem>
                  <SelectItem value="PST">PST - Pacific Time</SelectItem>
                  <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            size="lg"
            disabled={isSaving || !hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
