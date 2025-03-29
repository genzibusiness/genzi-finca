
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

// Currency options
const currencyOptions = [
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

// Expense type options
const expenseTypeOptions = [
  { value: 'Salary', label: 'Salary' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Services', label: 'Services' },
  { value: 'Software', label: 'Software' },
  { value: 'Other', label: 'Other' },
];

// Transaction status options based on type
const getStatusOptions = (type: string) => {
  if (type === 'income') {
    return [
      { value: 'received', label: 'Received' },
      { value: 'yet_to_be_received', label: 'Yet to be received' },
    ];
  } else {
    return [
      { value: 'paid', label: 'Paid' },
      { value: 'yet_to_be_paid', label: 'Yet to be paid' },
    ];
  }
};

interface TransactionFormProps {
  initialData?: Transaction;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onCancel,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
    type: initialData?.type || 'expense',
    currency: initialData?.currency || 'SGD',
    expense_type: initialData?.expense_type || 'Salary',
    comment: initialData?.comment || '',
    status: initialData?.status || 'yet_to_be_paid',
  });
  
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Update status options when type changes
  useEffect(() => {
    const statusOptions = getStatusOptions(formData.type);
    // Reset status if it's not valid for the current type
    const isValidStatus = statusOptions.some(option => option.value === formData.status);
    if (!isValidStatus) {
      setFormData(prev => ({
        ...prev,
        status: formData.type === 'income' ? 'yet_to_be_received' : 'yet_to_be_paid'
      }));
    }
  }, [formData.type]);

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
          .update(transactionData)
          .eq('id', initialData.id);
      } else {
        // Insert new transaction
        console.log('Creating new transaction');
        result = await supabase
          .from('transactions')
          .insert(transactionData);
      }
      
      console.log('Supabase result:', result);
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success(initialData?.id ? 'Transaction updated successfully' : 'Transaction created successfully');
      setTimeout(() => navigate('/transactions'), 1000); // Added a short delay to ensure the toast is shown before navigation
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
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
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
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
              {getStatusOptions(formData.type).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
