
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface ExpenseTypeFieldProps {
  form: UseFormReturn<any>;
  expenseTypes: { id: string; name: string }[];
}

const ExpenseTypeField: React.FC<ExpenseTypeFieldProps> = ({ form, expenseTypes }) => {
  // Get the transaction type to conditionally set default value
  const transactionType = form.watch('type');
  
  // Only set expense_type if transaction type is expense
  React.useEffect(() => {
    const currentExpenseType = form.getValues('expense_type');
    // If transaction type is income, set expense_type to null
    if (transactionType !== 'expense') {
      form.setValue('expense_type', null);
    } 
    // If transaction type is expense and expense_type is null or undefined, set a default
    else if (!currentExpenseType && expenseTypes.length > 0) {
      form.setValue('expense_type', expenseTypes[0].name);
    }
  }, [transactionType, form, expenseTypes]);

  return (
    <FormField
      control={form.control}
      name="expense_type"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>Expense Category</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || (expenseTypes.length > 0 ? expenseTypes[0].name : "Other")}
            disabled={transactionType !== 'expense'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select expense type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent position="popper" className="w-full bg-popover z-50 max-h-[300px]">
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
