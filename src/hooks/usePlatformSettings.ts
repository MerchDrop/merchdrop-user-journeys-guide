import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsData {
  [key: string]: any;
}

export function usePlatformSettings() {
  const queryClient = useQueryClient();

  // Fetch all settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      // Transform array of settings into an object for easier access
      const settingsObject: SettingsData = {};
      data?.forEach((setting: PlatformSetting) => {
        settingsObject[setting.key] = setting.value;
      });

      return {
        raw: data as PlatformSetting[],
        data: settingsObject
      };
    },
  });

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (settingsToSave: SettingsData) => {
      // Fetch existing settings to get category info
      const { data: existingSettings } = await supabase
        .from('platform_settings')
        .select('key, category');

      const categoryMap = new Map(
        existingSettings?.map(s => [s.key, s.category]) || []
      );

      // Prepare updates with category
      const updates = Object.entries(settingsToSave).map(([key, value]) => ({
        key,
        value,
        category: categoryMap.get(key) || 'app_config',
        updated_at: new Date().toISOString(),
      }));

      // Upsert each setting
      const promises = updates.map((update) =>
        supabase
          .from('platform_settings')
          .upsert(update, {
            onConflict: 'key',
          })
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(`Failed to save ${errors.length} settings`);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: any) => {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    },
  });

  return {
    settings: settings?.data || {},
    rawSettings: settings?.raw || [],
    isLoading,
    error,
    saveSettings: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}
