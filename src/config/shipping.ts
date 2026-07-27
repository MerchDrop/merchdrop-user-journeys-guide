import { Currency } from '@/context/CurrencyContext';

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
    const saved = localStorage.getItem('shipping_axes_config');
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

export function saveShippingAxes(axes: ShippingAxis[]): void {
  try {
    localStorage.setItem('shipping_axes_config', JSON.stringify(axes));
  } catch (e) {
    console.error('Failed to save shipping axes:', e);
  }
}

export function getShippingAxis(id: string): ShippingAxis {
  const axes = getSavedShippingAxes();
  return axes.find((axis) => axis.id === id) || axes[0];
}
