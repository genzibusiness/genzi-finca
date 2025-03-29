
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Transaction, CurrencyType, ExpenseType, TransactionStatus } from '@/types/cashflow';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  date: z.date(),
  type: z.enum(['income', 'expense']),
  expense_type: z.string().optional(),
  status: z.string(),
  currency: z.string(),
  comment: z.string().optional(),
  document_url: z.string().optional(),
  includes_tax: z.boolean().optional(),
  payment_type_id: z.string().optional(),
  paid_by_user_id: z.string().optional(),
});

type TransactionFormProps = {
  transaction: Partial<Transaction>;
  onSave: (transaction: Partial<Transaction>) => Promise<void>;
  isSubmitting?: boolean;
};

// Define an extended status interface that includes the normalized name
interface TransactionStatusWithNormalized {
  id: string;
  name: string; 
  type: string;
  name_normalized: string;
}

interface PaymentType {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
}

const TransactionForm = ({ transaction, onSave, isSubmitting = false }: TransactionFormProps) => {
  const navigate = useNavigate();
  
  const [expenseTypes, setExpenseTypes] = useState<{id: string, name: string}[]>([]);
  const [statuses, setStatuses] = useState<TransactionStatusWithNormalized[]>([]);
  const [currencies, setCurrencies] = useState<{id: string, code: string, name: string, symbol: string}[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState<string>('INR');
  const [currencyRates, setCurrencyRates] = useState<{from_currency: string, to_currency: string, rate: number}[]>([]);
  
  // Initialize form with transaction data or defaults
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: transaction
      ? {
          ...transaction,
          date: transaction.date ? new Date(transaction.date) : new Date(),
          includes_tax: transaction.includes_tax || false,
          payment_type_id: transaction.payment_type_id || '',
          paid_by_user_id: transaction.paid_by_user_id || '',
        }
      : {
          amount: 0,
          date: new Date(),
          type: 'expense',
          status: '',
          currency: '',
          comment: '',
          document_url: '',
          includes_tax: false,
          payment_type_id: '',
          paid_by_user_id: '',
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
        
        // Fetch payment types
        const { data: paymentTypesData, error: paymentTypesError } = await supabase
          .from('payment_types')
          .select('id, name')
          .eq('active', true);
        
        if (paymentTypesError) {
          console.error('Error fetching payment types:', paymentTypesError);
          throw paymentTypesError;
        }
        
        if (paymentTypesData) {
          console.log('Payment types:', paymentTypesData);
          setPaymentTypes(paymentTypesData);
        }
        
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, name');
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
          throw usersError;
        }
        
        if (usersData) {
          console.log('Users:', usersData);
          setUsers(usersData);
        }
        
        // Fetch currency rates
        const { data: ratesData, error: ratesError } = await supabase
          .from('currency_rates')
          .select('from_currency, to_currency, rate');
        
        if (ratesError) {
          console.error('Error fetching currency rates:', ratesError);
          throw ratesError;
        }
        
        if (ratesData) {
          console.log('Currency rates:', ratesData);
          setCurrencyRates(ratesData);
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
      
      // Apply currency conversion for SGD
      if (name === 'currency' && value.currency === 'SGD') {
        applyConversionRate(value.currency);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, statuses, currencyRates]);
  
  // Filter statuses based on selected transaction type
  const filteredStatuses = statuses.filter(
    (status) => !status.type || status.type === form.getValues('type')
  );
  
  // Apply currency conversion
  const applyConversionRate = (selectedCurrency: string) => {
    if (selectedCurrency === 'SGD' && defaultCurrency && defaultCurrency !== 'SGD') {
      const conversionRate = currencyRates.find(
        rate => rate.from_currency === 'SGD' && rate.to_currency === defaultCurrency
      );
      
      if (conversionRate) {
        const currentAmount = form.getValues('amount');
        const convertedAmount = currentAmount * conversionRate.rate;
        console.log(`Converting ${currentAmount} SGD to ${convertedAmount} ${defaultCurrency} (rate: ${conversionRate.rate})`);
        
        // Ask the user if they want to apply the conversion
        const confirmConversion = window.confirm(
          `Do you want to convert ${currentAmount} SGD to ${convertedAmount.toFixed(2)} ${defaultCurrency}?`
        );
        
        if (confirmConversion) {
          form.setValue('amount', Number(convertedAmount.toFixed(2)));
          form.setValue('currency', defaultCurrency);
          toast.success(`Converted amount from SGD to ${defaultCurrency}`);
        }
      } else {
        console.log(`No conversion rate found for SGD to ${defaultCurrency}`);
      }
    }
  };
  
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
        // Set payment_type_id to null if it's empty
        payment_type_id: values.payment_type_id || null,
        // Set paid_by_user_id to null if it's empty
        paid_by_user_id: values.paid_by_user_id || null,
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <SelectItem value="">None</SelectItem>
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
          
          <FormField
            control={form.control}
            name="paid_by_user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paid By</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="document_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document URL (Invoice/PO)</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="https://example.com/invoice.pdf"
                      {...field}
                      value={field.value || ''}
                    />
                    {field.value && (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => window.open(field.value, '_blank')}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="includes_tax"
            render={({ field }) => (
              <FormItem className="flex flex-row items-end space-x-2">
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
        </div>
        
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
