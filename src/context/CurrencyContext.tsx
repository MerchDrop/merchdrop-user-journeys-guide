import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'GBP' | 'NGN';

export interface CurrencyData {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to USD
}

export const CURRENCIES: Record<Currency, CurrencyData> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1650 }
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  convertPrice: (price: number, fromCurrency?: Currency) => number;
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

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && savedCurrency in CURRENCIES) {
      setCurrencyState(savedCurrency as Currency);
    }
  }, []);

  // Save currency to localStorage whenever it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  // Convert price from USD to selected currency
  const convertPrice = (price: number, fromCurrency: Currency = 'USD'): number => {
    if (fromCurrency === currency) return price;
    
    // Convert to USD first if not already
    const priceInUSD = fromCurrency === 'USD' ? price : price / CURRENCIES[fromCurrency].rate;
    
    // Convert from USD to target currency
    return priceInUSD * CURRENCIES[currency].rate;
  };

  // Format price with currency symbol
  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price);
    const currencyData = CURRENCIES[currency];
    
    // Format based on currency
    if (currency === 'NGN') {
      return `${currencyData.symbol}${Math.round(convertedPrice).toLocaleString()}`;
    } else {
      return `${currencyData.symbol}${convertedPrice.toFixed(2)}`;
    }
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    formatPrice,
    convertPrice
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};