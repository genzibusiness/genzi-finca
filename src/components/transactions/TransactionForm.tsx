
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Transaction, CurrencyType, ExpenseType } from '@/types/cashflow';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  date: z.date(),
  type: z.enum(['income', 'expense']),
  expense_type: z.string().optional(),
  status: z.string(),
  currency: z.string(),
  comment: z.string().optional(),
});

type TransactionFormProps = {
  transaction: Partial<Transaction>;
  onSave: (transaction: Partial<Transaction>) => Promise<void>;
  isSubmitting?: boolean;
};

const TransactionForm = ({ transaction, onSave, isSubmitting = false }: TransactionFormProps) => {
  const navigate = useNavigate();
  
  const [expenseTypes, setExpenseTypes] = useState<{id: string, name: string}[]>([]);
  const [statuses, setStatuses] = useState<{id: string, name: string, type: string}[]>([]);
  const [currencies, setCurrencies] = useState<{id: string, code: string, name: string, symbol: string}[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState<string>('INR');
  
  // Initialize form with transaction data or defaults
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: transaction
      ? {
          ...transaction,
          date: transaction.date ? new Date(transaction.date) : new Date(),
        }
      : {
          amount: 0,
          date: new Date(),
          type: 'expense',
          status: '',
          currency: '',
          comment: '',
        },
  });

  // Fetch expense types, statuses, currencies, and default currency on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching form data');
        
        // Fetch expense types
        const { data: expenseTypesData, error: expenseTypesError } = await supabase
          .from('expense_types')
          .select('id, name')
          .eq('active', true);
        
        if (expenseTypesError) {
          console.error('Error fetching expense types:', expenseTypesError);
          throw expenseTypesError;
        }
        
        if (expenseTypesData) {
          console.log('Expense types:', expenseTypesData);
          setExpenseTypes(expenseTypesData);
        }
        
        // Fetch transaction statuses
        const { data: statusesData, error: statusesError } = await supabase
          .from('transaction_statuses')
          .select('id, name, type')
          .eq('active', true);
        
        if (statusesError) {
          console.error('Error fetching statuses:', statusesError);
          throw statusesError;
        }
        
        if (statusesData) {
          console.log('Statuses:', statusesData);
          // Transform status names to lowercase to match database enum values
          const normalizedStatuses = statusesData.map(status => ({
            ...status,
            name_normalized: status.name.toLowerCase().replace(/\s+/g, '_')
          }));
          
          setStatuses(normalizedStatuses);
          
          // Set default status based on transaction type
          const currentType = form.getValues('type');
          const relevantStatuses = normalizedStatuses.filter(
            (status) => !status.type || status.type === currentType
          );
          
          if (relevantStatuses.length > 0 && !form.getValues('status')) {
            form.setValue('status', relevantStatuses[0].name_normalized);
          }
        }
        
        // Fetch currencies
        const { data: currenciesData, error: currenciesError } = await supabase
          .from('currencies')
          .select('id, code, name, symbol')
          .eq('active', true);
        
        if (currenciesError) {
          console.error('Error fetching currencies:', currenciesError);
          throw currenciesError;
        }
        
        if (currenciesData) {
          console.log('Currencies:', currenciesData);
          setCurrencies(currenciesData);
        }
        
        // Fetch default currency
        const { data: defaultCurrencyData, error: defaultCurrencyError } = await supabase
          .from('currencies')
          .select('code')
          .eq('is_default', true)
          .single();
        
        if (defaultCurrencyError && defaultCurrencyError.code !== 'PGRST116') {
          console.error('Error fetching default currency:', defaultCurrencyError);
          throw defaultCurrencyError;
        }
        
        if (defaultCurrencyData) {
          console.log('Default currency:', defaultCurrencyData.code);
          setDefaultCurrency(defaultCurrencyData.code);
          
          // Set default currency if creating a new transaction
          if (!transaction.id && !form.getValues('currency')) {
            form.setValue('currency', defaultCurrencyData.code);
          }
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
        toast.error('Failed to load form data. Please try again.');
      }
    };
    
    fetchData();
  }, []);
  
  // Update displayed form fields based on transaction type
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'type') {
        const relevantStatuses = statuses.filter(
          (status) => !status.type || status.type === value.type
        );
        
        if (relevantStatuses.length > 0 && !relevantStatuses.find(s => s.name_normalized === form.getValues('status'))) {
          form.setValue('status', relevantStatuses[0].name_normalized);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, statuses]);
  
  // Filter statuses based on selected transaction type
  const filteredStatuses = statuses.filter(
    (status) => !status.type || status.type === form.getValues('type')
  );
  
  // Handle form submission
  const onSubmit = async (values) => {
    try {
      console.log('Form values:', values);
      
      // Format the date for database
      const formattedDate = format(values.date, 'yyyy-MM-dd');
      
      // Prepare transaction data
      const transactionData = {
        ...values,
        date: formattedDate,
        // If expense type is empty and type is income, set to null
        expense_type: values.type === 'income' ? null : values.expense_type,
      };
      
      console.log('Submitting transaction:', transactionData);
      
      // Save transaction data
      if (onSave) {
        await onSave(transactionData);
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    navigate(-1);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || defaultCurrency}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
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
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.name_normalized}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {form.watch('type') === 'expense' && (
          <FormField
            control={form.control}
            name="expense_type"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expense Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
        )}
        
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add details about this transaction"
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : transaction.id ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;
