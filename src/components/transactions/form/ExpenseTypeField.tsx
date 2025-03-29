
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ExpenseType } from '@/types/cashflow';

interface ExpenseTypeFieldProps {
  form: UseFormReturn<any>;
  expenseTypes: { id: string; name: string }[];
}

const ExpenseTypeField: React.FC<ExpenseTypeFieldProps> = ({ form, expenseTypes }) => {
  return (
    <FormField
      control={form.control}
      name="expense_type"
      render={({ field }) => (
        <FormItem className="flex flex-col w-full">
          <FormLabel>Expense Category</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || (expenseTypes.length > 0 ? expenseTypes[0].name : "Other")}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select expense type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent position="popper" className="w-full bg-popover z-50">
              {expenseTypes.map((expenseType) => (
                <SelectItem key={expenseType.id} value={expenseType.name}>
                  {expenseType.name}
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

export default ExpenseTypeField;
