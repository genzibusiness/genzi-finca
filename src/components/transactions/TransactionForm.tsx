import React, { useEffect, useState } from 'react';
import { useCashflow } from '@/context/CashflowContext';
import { Transaction, TransactionStatus, TransactionType } from '@/types/cashflow';
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

interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

const statusOptions: { value: TransactionStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'done', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'recurring', label: 'Recurring' },
];

const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { categories, getSubCategoriesForCategory, users } = useCashflow();
  
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
    type: initialData?.type || 'expense',
    categoryId: initialData?.categoryId || '',
    subCategoryId: initialData?.subCategoryId || '',
    status: initialData?.status || 'pending',
    createdBy: initialData?.createdBy || (users[0]?.id || ''),
  });
  
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  
  const [availableSubCategories, setAvailableSubCategories] = useState(
    getSubCategoriesForCategory(formData.categoryId)
  );
  
  useEffect(() => {
    setAvailableSubCategories(getSubCategoriesForCategory(formData.categoryId));
    
    if (formData.categoryId && formData.subCategoryId) {
      const validSubCategories = getSubCategoriesForCategory(formData.categoryId);
      if (!validSubCategories.some(sc => sc.id === formData.subCategoryId)) {
        setFormData(prev => ({
          ...prev,
          subCategoryId: validSubCategories[0]?.id || '',
        }));
      }
    }
  }, [formData.categoryId, getSubCategoriesForCategory]);
  
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
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange('type', value as TransactionType)}
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
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value as TransactionStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => handleSelectChange('categoryId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter(category => 
                  formData.type === 'income' 
                    ? ['cat1', 'cat2'].includes(category.id) 
                    : !['cat1', 'cat2'].includes(category.id)
                )
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subCategoryId">Sub-Category</Label>
          <Select
            value={formData.subCategoryId}
            onValueChange={(value) => handleSelectChange('subCategoryId', value)}
            disabled={!formData.categoryId || availableSubCategories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sub-category" />
            </SelectTrigger>
            <SelectContent>
              {availableSubCategories.length > 0 ? (
                availableSubCategories.map((subCategory) => (
                  <SelectItem key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-subcategories">No subcategories available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="createdBy">Created By</Label>
        <Select
          value={formData.createdBy}
          onValueChange={(value) => handleSelectChange('createdBy', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Transaction
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
