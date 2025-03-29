
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface PaymentTypeFieldProps {
  form: UseFormReturn<any>;
  paymentTypes: { id: string; name: string }[];
}

const PaymentTypeField: React.FC<PaymentTypeFieldProps> = ({ form, paymentTypes }) => {
  return (
    <FormField
      control={form.control}
      name="payment_type_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Payment Type</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {paymentTypes.map((paymentType) => (
                <SelectItem key={paymentType.id} value={paymentType.id}>
                  {paymentType.name}
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

export default PaymentTypeField;
