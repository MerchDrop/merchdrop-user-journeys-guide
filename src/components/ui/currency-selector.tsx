import React from 'react';
import { Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency, CURRENCIES } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ className }) => {
  const { currency, setCurrency, rates } = useCurrency();
  const currentCurrency = CURRENCIES[currency];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-1.5 bg-transparent text-sm font-medium border-gray-300 hover:bg-gray-100/10", className)}>
          <Globe className="h-4 w-4 opacity-70" />
          <span className="font-semibold">{currentCurrency.symbol}</span>
          <span>{currentCurrency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 bg-white border border-gray-200 shadow-lg z-50 p-1">
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Select Currency
        </div>
        {Object.values(CURRENCIES).map((curr) => {
          const rate = rates[curr.code];
          return (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => setCurrency(curr.code)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-800 text-xs font-bold">
                  {curr.symbol}
                </span>
                <div>
                  <div className="font-medium text-sm text-gray-900 leading-tight">
                    {curr.code} <span className="text-xs text-gray-500 font-normal">({curr.name})</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {curr.code === 'USD' ? 'Base Currency' : `1 USD = ${rate?.toLocaleString()} ${curr.code}`}
                  </div>
                </div>
              </div>
              {currency === curr.code && (
                <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};