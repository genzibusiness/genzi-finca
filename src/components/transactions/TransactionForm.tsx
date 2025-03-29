
import React, { useEffect, useState } from 'react';
import { Transaction } from '@/types/cashflow';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface TransactionFormProps {
  initialData?: Transaction;
  onCancel: () => void;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

interface ExpenseTypeOption {
  id: string;
  name: string;
}

interface TransactionTypeOption {
  id: string;
  name: string;
}

interface StatusOption {
  id: string;
  name: string;
  type: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onCancel,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for form data
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
    type: initialData?.type || '',
    currency: initialData?.currency || '',
    expense_type: initialData?.expense_type || '',
    comment: initialData?.comment || '',
    status: initialData?.status || '',
  });
  
  // State for the date picker
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  
  // State for master data options
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>([]);
  const [expenseTypeOptions, setExpenseTypeOptions] = useState<ExpenseTypeOption[]>([]);
  const [transactionTypeOptions, setTransactionTypeOptions] = useState<TransactionTypeOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch master data options from Supabase
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // Fetch currencies
        const { data: currencies, error: currenciesError } = await supabase
          .from('currencies')
          .select('*')
          .eq('active', true);
        
        if (currenciesError) throw currenciesError;
        setCurrencyOptions(currencies || []);
        
        // Fetch expense types
        const { data: expenseTypes, error: expenseTypesError } = await supabase
          .from('expense_types')
          .select('*')
          .eq('active', true);
        
        if (expenseTypesError) throw expenseTypesError;
        setExpenseTypeOptions(expenseTypes || []);
        
        // Fetch transaction types
        const { data: transactionTypes, error: transactionTypesError } = await supabase
          .from('transaction_types')
          .select('*')
          .eq('active', true);
        
        if (transactionTypesError) throw transactionTypesError;
        setTransactionTypeOptions(transactionTypes || []);
        
        // Fetch statuses
        const { data: statuses, error: statusesError } = await supabase
          .from('transaction_statuses')
          .select('*')
          .eq('active', true);
        
        if (statusesError) throw statusesError;
        setStatusOptions(statuses || []);
        
        // If no initial data and we have default values, set them
        if (!initialData && currencies?.length && transactionTypes?.length && expenseTypes?.length && statuses?.length) {
          // Default to first values
          const defaultTransactionType = transactionTypes[0]?.name || '';
          const defaultCurrency = currencies[0]?.code || '';
          const defaultStatus = statuses.find(s => s.type === defaultTransactionType)?.name || statuses[0]?.name || '';
          
          setFormData(prev => ({
            ...prev,
            currency: defaultCurrency,
            type: defaultTransactionType,
            status: defaultStatus,
            expense_type: defaultTransactionType === 'expense' ? expenseTypes[0]?.name || '' : '',
          }));
        }
      } catch (error) {
        console.error('Error fetching master data:', error);
        toast.error('Failed to load form options');
      }
    };
    
    fetchMasterData();
  }, [initialData]);
  
  // Update status options when type changes
  useEffect(() => {
    // Filter status options based on the selected type
    const filteredOptions = statusOptions.filter(option => option.type === formData.type);
    
    // If current status is not valid for the selected type, reset it
    if (filteredOptions.length > 0 && !filteredOptions.some(o => o.name === formData.status)) {
      setFormData(prev => ({
        ...prev,
        status: filteredOptions[0]?.name || ''
      }));
    }
  }, [formData.type, statusOptions, formData.status]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setFormData(prev => ({
        ...prev,
        date: format(newDate, 'yyyy-MM-dd'),
      }));
    }
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear expense_type if type changes to income
    if (name === 'type' && value === 'income') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        expense_type: null
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a transaction');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount.toString()) <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Submitting transaction:', formData);
      
      // Prepare data for insertion
      const transactionData = {
        amount: parseFloat(formData.amount.toString()),
        date: formData.date,
        type: formData.type,
        currency: formData.currency,
        expense_type: formData.type === 'expense' ? formData.expense_type : null,
        comment: formData.comment || null,
        status: formData.status,
        user_id: user.id,
      };
      
      console.log('Transaction data to submit:', transactionData);
      
      let result;
      
      if (initialData?.id) {
        // Update existing transaction
        console.log('Updating transaction:', initialData.id);
        result = await supabase
          .from('transactions')
          .update(transactionData as any) // Type assertion to bypass TS error
          .eq('id', initialData.id);
      } else {
        // Insert new transaction
        console.log('Creating new transaction');
        result = await supabase
          .from('transactions')
          .insert(transactionData as any); // Type assertion to bypass TS error
      }
      
      console.log('Supabase result:', result);
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success(initialData?.id ? 'Transaction updated successfully' : 'Transaction created successfully');
      setTimeout(() => navigate('/transactions'), 1000);
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast.error(error.message || 'Failed to save transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {transactionTypeOptions.map((option) => (
                <SelectItem key={option.id} value={option.name}>
                  {option.name.charAt(0).toUpperCase() + option.name.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleSelectChange('currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.code} - {option.name} ({option.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.type === 'expense' && (
          <div className="space-y-2">
            <Label htmlFor="expense_type">Expense Type</Label>
            <Select
              value={formData.expense_type || ''}
              onValueChange={(value) => handleSelectChange('expense_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expense type" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions
                .filter(option => option.type === formData.type)
                .map((option) => (
                  <SelectItem key={option.id} value={option.name}>
                    {option.name.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Add any additional details..."
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData ? 'Update' : 'Create')} Transaction
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
