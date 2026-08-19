import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ShippingAxis {
  id: string;
  name: string;
  areas: string;
  feeNGN: number;
  isCustomQuote?: boolean;
  customNotice?: string;
  active?: boolean;
}

export const DEFAULT_SHIPPING_AXES: ShippingAxis[] = [
  {
    id: 'axis-1',
    name: 'Axis 1',
    areas: 'Yaba, Shomolu, Mushin, Bariga, Surulere',
    feeNGN: 3000,
    active: true,
  },
  {
    id: 'axis-2',
    name: 'Axis 2',
    areas: 'Ikoyi, Victoria Island (VI), Obalende',
    feeNGN: 5000,
    active: true,
  },
  {
    id: 'axis-3',
    name: 'Axis 3',
    areas: 'Lekki',
    feeNGN: 8000,
    active: true,
  },
  {
    id: 'axis-4',
    name: 'Axis 4',
    areas: 'Ajah, Sangotedo',
    feeNGN: 10000,
    active: true,
  },
  {
    id: 'axis-5',
    name: 'Axis 5',
    areas: 'Ikeja, Ogba',
    feeNGN: 7000,
    active: true,
  },
  {
    id: 'axis-other',
    name: 'Other Locations',
    areas: 'Location not listed above',
    feeNGN: 0,
    isCustomQuote: true,
    active: true,
    customNotice:
      'Shipping fee will be calculated based on your delivery address. Once your order is ready, the shipping cost will be sent to your email before dispatch.',
  },
];

export const SHIPPING_AXES = getSavedShippingAxes();

export function getSavedShippingAxes(): ShippingAxis[] {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('shipping_axes_config') : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved shipping axes:', e);
  }
  return DEFAULT_SHIPPING_AXES;
}

export async function fetchShippingAxes(): Promise<ShippingAxis[]> {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'shipping_axes')
      .maybeSingle();

    if (!error && data && Array.isArray(data.value) && data.value.length > 0) {
      const axes = data.value as ShippingAxis[];
      if (typeof window !== 'undefined') {
        localStorage.setItem('shipping_axes_config', JSON.stringify(axes));
      }
      return axes;
    }
  } catch (e) {
    console.warn('Could not fetch shipping axes from backend, using local:', e);
  }
  return getSavedShippingAxes();
}

export async function saveShippingAxes(axes: ShippingAxis[]): Promise<boolean> {
  try {
    // 1. Save to local storage for immediate synchronous access
    if (typeof window !== 'undefined') {
      localStorage.setItem('shipping_axes_config', JSON.stringify(axes));
      window.dispatchEvent(new CustomEvent('shipping_axes_updated', { detail: axes }));
    }

    // 2. Sync to Supabase platform_settings
    const { error } = await supabase
      .from('platform_settings')
      .upsert(
        {
          key: 'shipping_axes',
          category: 'shipping',
          value: axes as any,
          description: 'Shipping delivery axes and fee matrix',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.warn('Could not persist shipping axes to database:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to save shipping axes:', e);
    return false;
  }
}

export function getShippingAxis(id: string, currentAxes?: ShippingAxis[]): ShippingAxis {
  const axes = currentAxes && currentAxes.length > 0 ? currentAxes : getSavedShippingAxes();
  return axes.find((axis) => axis.id === id) || axes[0] || DEFAULT_SHIPPING_AXES[0];
}

export function useShippingAxes() {
  const [axes, setAxes] = useState<ShippingAxis[]>(getSavedShippingAxes());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      const fetched = await fetchShippingAxes();
      if (isMounted && fetched && fetched.length > 0) {
        setAxes(fetched);
      }
      if (isMounted) setIsLoading(false);
    };
    load();

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && Array.isArray(detail)) {
        setAxes(detail);
      } else {
        setAxes(getSavedShippingAxes());
      }
    };

    window.addEventListener('shipping_axes_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('shipping_axes_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const saveAxes = useCallback(async (newAxes: ShippingAxis[]) => {
    setIsSaving(true);
    setAxes(newAxes);
    const success = await saveShippingAxes(newAxes);
    setIsSaving(false);
    return success;
  }, []);

  const resetAxes = useCallback(async () => {
    setIsSaving(true);
    setAxes(DEFAULT_SHIPPING_AXES);
    const success = await saveShippingAxes(DEFAULT_SHIPPING_AXES);
    setIsSaving(false);
    return success;
  }, []);

  return {
    axes,
    isLoading,
    isSaving,
    saveAxes,
    resetAxes,
    setAxes,
  };
}
