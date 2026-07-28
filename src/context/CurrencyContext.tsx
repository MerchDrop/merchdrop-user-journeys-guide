import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Currency = 'USD' | 'GBP' | 'EUR' | 'NGN';

export interface CurrencyData {
  code: Currency;
  symbol: string;
  name: string;
  rate: number;
}

export const DEFAULT_RATES: Record<Currency, number> = {
  NGN: 1,
  USD: 1 / 1650,
  GBP: 1 / 2088,
  EUR: 1 / 1795,
};

export const CURRENCIES: Record<Currency, CurrencyData> = {
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 / 1650 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 1 / 2088 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 1 / 1795 }
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: Record<Currency, number>;
  updateRates: (newRates: Partial<Record<Currency, number>>) => void;
  formatPrice: (price: number, fromCurrency?: Currency) => string;
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
    } else {
      setCurrencyState('NGN');
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

  // Convert amount between any two specified currencies (Base is NGN)
  const convertBetweenCurrencies = (amount: number, from: Currency, to: Currency): number => {
    if (!amount || isNaN(amount)) return 0;
    if (from === to) return amount;
    const fromRate = rates[from] ?? DEFAULT_RATES[from] ?? 1;
    const toRate = rates[to] ?? DEFAULT_RATES[to] ?? 1;
    const amountInNGN = amount / fromRate;
    return amountInNGN * toRate;
  };

  // Convert price from base/source currency (default NGN) to current active selected currency
  const convertPrice = (price: number, fromCurrency: Currency = 'NGN'): number => {
    return convertBetweenCurrencies(price, fromCurrency, currency);
  };

  // Format price with currency symbol and appropriate decimal places from source currency (default NGN)
  const formatPrice = (price: number, fromCurrency: Currency = 'NGN'): string => {
    const convertedPrice = convertBetweenCurrencies(price, fromCurrency, currency);
    const currencyData = CURRENCIES[currency] || CURRENCIES.NGN;
    
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