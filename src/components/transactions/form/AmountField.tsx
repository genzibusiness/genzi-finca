
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface AmountFieldProps {
  form: UseFormReturn<any>;
}

const AmountField: React.FC<AmountFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount</FormLabel>
          <FormControl>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...field}
              onChange={(e) => {
                // Ensure we're passing a number value to the form
                const value = e.target.value === '' ? '0' : e.target.value;
                field.onChange(parseFloat(value));
              }}
              value={field.value ?? 0}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AmountField;
