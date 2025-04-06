
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface CurrencyFieldProps {
  form: UseFormReturn<any>;
  currencies: { id: string; code: string; name: string; symbol: string }[];
  defaultCurrency: string;
}

const CurrencyField: React.FC<CurrencyFieldProps> = ({ 
  form, 
  currencies, 
  defaultCurrency
}) => {
  const handleValueChange = (value: string) => {
    form.setValue('currency', value);
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
        <FormItem className="w-full">
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
            <SelectContent position="popper" className="w-full bg-popover z-50">
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
