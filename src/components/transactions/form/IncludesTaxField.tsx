
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
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Amount includes tax</FormLabel>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default IncludesTaxField;
