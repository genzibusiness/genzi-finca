
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';

interface IncludesTaxFieldProps {
  form: UseFormReturn<any>;
}

const IncludesTaxField: React.FC<IncludesTaxFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="includes_tax"
      render={({ field }) => (
        <FormItem className="w-full flex flex-row items-center space-x-2 h-full pt-6">
          <div className="space-y-0.5">
            <FormLabel>Amount includes tax</FormLabel>
          </div>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default IncludesTaxField;
