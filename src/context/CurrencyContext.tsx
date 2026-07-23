import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Currency = 'USD' | 'GBP' | 'NGN';

export interface CurrencyData {
  code: Currency;
  symbol: string;
  name: string;
}

export const DEFAULT_RATES: Record<Currency, number> = {
  USD: 1,
  GBP: 0.79,
  NGN: 1650
};

export const CURRENCIES: Record<Currency, CurrencyData> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' }
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: Record<Currency, number>;
  updateRates: (newRates: Partial<Record<Currency, number>>) => void;
  formatPrice: (price: number) => string;
  convertPrice: (price: number, fromCurrency?: Currency) => number;
  convertBetweenCurrencies: (amount: number, from: Currency, to: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('NGN');
  const [rates, setRatesState] = useState<Record<Currency, number>>(() => {
    const savedRates = localStorage.getItem('exchangeRates');
    if (savedRates) {
      try {
        const parsed = JSON.parse(savedRates);
        return { ...DEFAULT_RATES, ...parsed };
      } catch (e) {
        console.error('Failed to parse saved exchange rates:', e);
      }
    }
    return DEFAULT_RATES;
  });

  // Load currency and exchange rates on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && savedCurrency in CURRENCIES) {
      setCurrencyState(savedCurrency as Currency);
    }

    // Fetch exchange rates from platform_settings table if available
    const fetchRemoteRates = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('key, value')
          .in('key', ['exchange_rates', 'exchange_rate_gbp', 'exchange_rate_ngn']);

        if (error) return;

        if (data && data.length > 0) {
          const newRates = { ...rates };
          data.forEach((setting) => {
            if (setting.key === 'exchange_rates' && typeof setting.value === 'object') {
              Object.assign(newRates, setting.value);
            } else if (setting.key === 'exchange_rate_gbp') {
              const val = Number(setting.value);
              if (!isNaN(val) && val > 0) newRates.GBP = val;
            } else if (setting.key === 'exchange_rate_ngn') {
              const val = Number(setting.value);
              if (!isNaN(val) && val > 0) newRates.NGN = val;
            }
          });

          setRatesState(newRates);
          localStorage.setItem('exchangeRates', JSON.stringify(newRates));
        }
      } catch (e) {
        console.error('Error loading remote exchange rates:', e);
      }
    };

    fetchRemoteRates();
  }, []);

  // Save currency preference to localStorage whenever it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  // Update exchange rates locally & in localStorage
  const updateRates = (newRates: Partial<Record<Currency, number>>) => {
    setRatesState((prev) => {
      const updated = { ...prev, ...newRates, USD: 1 };
      localStorage.setItem('exchangeRates', JSON.stringify(updated));
      return updated;
    });
  };

  // Convert amount between any two specified currencies
  const convertBetweenCurrencies = (amount: number, from: Currency, to: Currency): number => {
    if (from === to) return amount;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  };

  // Convert price from base/source currency (default USD) to current active selected currency
  const convertPrice = (price: number, fromCurrency: Currency = 'USD'): number => {
    return convertBetweenCurrencies(price, fromCurrency, currency);
  };

  // Format price with currency symbol and appropriate decimal places
  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price);
    const currencyData = CURRENCIES[currency];
    
    if (currency === 'NGN') {
      return `${currencyData.symbol}${Math.round(convertedPrice).toLocaleString()}`;
    } else {
      return `${currencyData.symbol}${convertedPrice.toFixed(2)}`;
    }
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    rates,
    updateRates,
    formatPrice,
    convertPrice,
    convertBetweenCurrencies
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};