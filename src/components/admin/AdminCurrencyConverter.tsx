import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency, Currency, CURRENCIES } from '@/context/CurrencyContext';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { DollarSign, RefreshCw, Save, ArrowRightLeft, CheckCircle, Calculator } from 'lucide-react';
import { toast } from 'sonner';

export const AdminCurrencyConverter: React.FC = () => {
  const { rates, updateRates, convertBetweenCurrencies } = useCurrency();
  const { saveSettings, isSaving } = usePlatformSettings();

  // Exchange rates form state
  const [gbpRate, setGbpRate] = useState<string>(rates.GBP?.toString() || '0.79');
  const [ngnRate, setNgnRate] = useState<string>(rates.NGN?.toString() || '1650');

  // Converter tool state
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcFrom, setCalcFrom] = useState<Currency>('USD');
  const [calcTo, setCalcTo] = useState<Currency>('NGN');

  useEffect(() => {
    if (rates.GBP) setGbpRate(rates.GBP.toString());
    if (rates.NGN) setNgnRate(rates.NGN.toString());
  }, [rates]);

  const handleSaveRates = async () => {
    const parsedGbp = parseFloat(gbpRate);
    const parsedNgn = parseFloat(ngnRate);

    if (isNaN(parsedGbp) || parsedGbp <= 0) {
      toast.error('Please enter a valid rate for British Pound (GBP)');
      return;
    }

    if (isNaN(parsedNgn) || parsedNgn <= 0) {
      toast.error('Please enter a valid rate for Nigerian Naira (NGN)');
      return;
    }

    const newRates = {
      USD: 1,
      GBP: parsedGbp,
      NGN: parsedNgn,
    };

    // Update CurrencyContext state and localStorage
    updateRates(newRates);

    // Save to backend platform_settings
    try {
      await saveSettings({
        exchange_rate_gbp: parsedGbp,
        exchange_rate_ngn: parsedNgn,
        exchange_rates: newRates,
      });
    } catch (e) {
      console.error('Saved locally, error syncing to server:', e);
    }
  };

  const convertedResult = convertBetweenCurrencies(calcAmount || 0, calcFrom, calcTo);

  const getSymbol = (c: Currency) => CURRENCIES[c].symbol;

  const formatValue = (val: number, c: Currency) => {
    if (c === 'NGN') {
      return `${CURRENCIES[c].symbol}${Math.round(val).toLocaleString()}`;
    }
    return `${CURRENCIES[c].symbol}${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Exchange Rates Configurator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Currency Exchange Rates Configuration
          </CardTitle>
          <CardDescription>
            Configure official exchange figures for USD ($), British Pounds (£), and Nigerian Naira (₦).
            Base rate is 1 USD ($1.00).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* NGN Base */}
            <div className="p-4 border rounded-xl bg-gray-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-700">Nigerian Naira (NGN)</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  Base Currency
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-900">₦1.00 NGN</div>
              <p className="text-xs text-gray-500">All pricing reference calculations originate in NGN.</p>
            </div>

            {/* GBP Rate */}
            <div className="p-4 border rounded-xl bg-white space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <Label htmlFor="gbp-rate" className="font-semibold text-sm text-gray-800">
                  British Pound (£ GBP)
                </Label>
                <span className="text-xs font-medium text-gray-500">1 USD =</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">£</span>
                <Input
                  id="gbp-rate"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={gbpRate}
                  onChange={(e) => setGbpRate(e.target.value)}
                  className="pl-7 font-semibold"
                  placeholder="0.79"
                />
              </div>
              <p className="text-xs text-gray-500">Current active rate: 1 USD = £{rates.GBP || 0.79} GBP</p>
            </div>

            {/* NGN Rate */}
            <div className="p-4 border rounded-xl bg-white space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <Label htmlFor="ngn-rate" className="font-semibold text-sm text-gray-800">
                  Nigerian Naira (₦ NGN)
                </Label>
                <span className="text-xs font-medium text-gray-500">1 USD =</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₦</span>
                <Input
                  id="ngn-rate"
                  type="number"
                  step="1"
                  min="1"
                  value={ngnRate}
                  onChange={(e) => setNgnRate(e.target.value)}
                  className="pl-7 font-semibold"
                  placeholder="1650"
                />
              </div>
              <p className="text-xs text-gray-500">Current active rate: 1 USD = ₦{(rates.NGN || 1650).toLocaleString()} NGN</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveRates} disabled={isSaving} className="gap-2 bg-black hover:bg-gray-800 text-white">
              <Save className="h-4 w-4" />
              {isSaving ? 'Updating Rates...' : 'Save Exchange Rates'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Currency Converter Tool */}
      <Card className="border-primary/20 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Calculator className="h-5 w-5 text-indigo-600" />
            Live Currency Converter Tool
          </CardTitle>
          <CardDescription>
            Test and convert figures dynamically between USD, GBP, and NGN using current exchange rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Input Amount */}
            <div className="md:col-span-4 space-y-2">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-gray-500">
                  {getSymbol(calcFrom)}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                  className="pl-8 font-semibold text-lg"
                />
              </div>
            </div>

            {/* From Currency */}
            <div className="md:col-span-3 space-y-2">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">From</Label>
              <Select value={calcFrom} onValueChange={(val: Currency) => setCalcFrom(val)}>
                <SelectTrigger className="font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">$ USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">£ GBP - British Pound</SelectItem>
                  <SelectItem value="NGN">₦ NGN - Nigerian Naira</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Switch Button */}
            <div className="md:col-span-1 flex justify-center pt-5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCalcFrom(calcTo);
                  setCalcTo(calcFrom);
                }}
                className="rounded-full shadow-sm hover:bg-gray-100"
                title="Swap Currencies"
              >
                <ArrowRightLeft className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            {/* To Currency */}
            <div className="md:col-span-4 space-y-2">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">To</Label>
              <Select value={calcTo} onValueChange={(val: Currency) => setCalcTo(val)}>
                <SelectTrigger className="font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">$ USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">£ GBP - British Pound</SelectItem>
                  <SelectItem value="NGN">₦ NGN - Nigerian Naira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conversion Display Banner */}
          <div className="p-4 rounded-xl bg-black text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <div className="text-xs text-gray-400 font-medium">Conversion Result</div>
              <div className="text-2xl font-extrabold tracking-tight">
                {formatValue(calcAmount || 0, calcFrom)} = {formatValue(convertedResult, calcTo)}
              </div>
            </div>
            <div className="text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-right">
              Rate: 1 {calcFrom} = {formatValue(convertBetweenCurrencies(1, calcFrom, calcTo), calcTo)}
            </div>
          </div>

          {/* Simultaneous Breakdown Table */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Equivalent Values Across All Currencies
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['USD', 'GBP', 'NGN'] as Currency[]).map((currCode) => {
                const equivalent = convertBetweenCurrencies(calcAmount || 0, calcFrom, currCode);
                const isSelected = currCode === calcTo;
                return (
                  <div
                    key={currCode}
                    className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                      isSelected ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' : 'bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-gray-500">{CURRENCIES[currCode].name}</span>
                      <div className="text-base font-bold text-gray-900">{formatValue(equivalent, currCode)}</div>
                    </div>
                    {isSelected && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCurrencyConverter;
