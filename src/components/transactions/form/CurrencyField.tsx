
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface CurrencyFieldProps {
  form: UseFormReturn<any>;
  currencies: { id: string; code: string; name: string; symbol: string }[];
  defaultCurrency: string;
  onCurrencyChange?: (currency: string) => void;
}

const CurrencyField: React.FC<CurrencyFieldProps> = ({ 
  form, 
  currencies, 
  defaultCurrency,
  onCurrencyChange
}) => {
  const handleValueChange = (value: string) => {
    form.setValue('currency', value);
    if (onCurrencyChange) {
      onCurrencyChange(value);
    }
  };

  // Find the currency display format based on the code
  const getCurrencyDisplay = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? `${currency.code} - ${currency.symbol}` : code;
  };

  return (
    <FormField
      control={form.control}
      name="currency"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Currency</FormLabel>
          <Select 
            onValueChange={handleValueChange}
            value={field.value || defaultCurrency}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {field.value ? getCurrencyDisplay(field.value) : "Select currency"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CurrencyField;
