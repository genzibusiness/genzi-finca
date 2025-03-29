import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/cashflow';

// Import custom form hooks
import useFormData from './form/useFormData';
import useCurrencyConvertor from './form/useCurrencyConvertor';

// Import form components
import FormSection from './form/FormSection';
import TransactionTypeField from './form/TransactionTypeField';
import AmountField from './form/AmountField';
import DateField from './form/DateField';
import CurrencyField from './form/CurrencyField';
import StatusField from './form/StatusField';
import PaymentTypeField from './form/PaymentTypeField';
import PaidByField from './form/PaidByField';
import ExpenseTypeField from './form/ExpenseTypeField';
import DocumentUrlField from './form/DocumentUrlField';
import IncludesTaxField from './form/IncludesTaxField';
import CommentField from './form/CommentField';

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

const TransactionForm = ({ transaction, onSave, isSubmitting = false }: TransactionFormProps) => {
  const navigate = useNavigate();
  
  // Fetch all form data
  const { 
    expenseTypes, 
    statuses, 
    currencies, 
    paymentTypes, 
    users, 
    currencyRates, 
    defaultCurrency,
    isLoading,
    error
  } = useFormData();
  
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
          currency: defaultCurrency,
          comment: '',
          document_url: '',
          includes_tax: false,
          payment_type_id: '',
          paid_by_user_id: '',
        },
  });

  const { applyConversionRate } = useCurrencyConvertor({ 
    currencyRates, 
    defaultCurrency, 
    form 
  });
  
  // Filter statuses based on selected transaction type
  const filteredStatuses = statuses.filter(
    (status) => !status.type || status.type === form.getValues('type')
  );
  
  // Set default status when transaction type changes
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
    
    // Set default status based on transaction type on initial load
    if (!form.getValues('status') && filteredStatuses.length > 0) {
      form.setValue('status', filteredStatuses[0].name_normalized);
    }

    // Set default currency if not set
    if (!form.getValues('currency') && defaultCurrency && !transaction.id) {
      form.setValue('currency', defaultCurrency);
    }
    
    return () => subscription.unsubscribe();
  }, [form, statuses, defaultCurrency, filteredStatuses, currencyRates]);
  
  // Handle form submission
  const onSubmit = async (values) => {
    try {
      console.log('Form values:', values);
      
      // Format the date for database
      const formattedDate = format(values.date, 'yyyy-MM-dd');
      
      // Handle the "none" value for payment_type_id and paid_by_user_id
      const payment_type_id = values.payment_type_id === 'none' ? null : values.payment_type_id || null;
      const paid_by_user_id = values.paid_by_user_id === 'none' ? null : values.paid_by_user_id || null;
      
      // Prepare transaction data
      const transactionData = {
        ...values,
        date: formattedDate,
        // If expense type is empty and type is income, set to null
        expense_type: values.type === 'income' ? null : values.expense_type,
        // Set payment_type_id to null if it's 'none' or empty
        payment_type_id: payment_type_id,
        // Set paid_by_user_id to null if it's 'none' or empty
        paid_by_user_id: paid_by_user_id,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive mb-4">Failed to load form data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* First row: Transaction Type, Amount, Date */}
        <FormSection className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
            <TransactionTypeField form={form} />
          </div>
          <div className="w-full">
            <AmountField form={form} />
          </div>
          <div className="w-full">
            <DateField form={form} />
          </div>
        </FormSection>
        
        {/* Second row: Currency, Status, Expense Type (conditional) */}
        <FormSection className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
            <CurrencyField 
              form={form} 
              currencies={currencies} 
              defaultCurrency={defaultCurrency}
              onCurrencyChange={applyConversionRate}
            />
          </div>
          <div className="w-full">
            <StatusField form={form} statuses={filteredStatuses} />
          </div>
          {form.watch('type') === 'expense' ? (
            <div className="w-full">
              <ExpenseTypeField form={form} expenseTypes={expenseTypes} />
            </div>
          ) : (
            <div className="w-full"> {/* Empty div to maintain grid layout when expense type is not shown */}
              <div className="invisible h-10">Placeholder</div>
            </div>
          )}
        </FormSection>
        
        {/* Third row: Payment Type, Paid By, Includes Tax */}
        <FormSection className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
            <PaymentTypeField form={form} paymentTypes={paymentTypes} />
          </div>
          <div className="w-full">
            <PaidByField form={form} users={users} />
          </div>
          <div className="w-full flex items-end">
            <IncludesTaxField form={form} />
          </div>
        </FormSection>
        
        {/* Fourth row: Document URL only */}
        <FormSection className="grid grid-cols-1 gap-4">
          <div className="w-full">
            <DocumentUrlField form={form} />
          </div>
        </FormSection>
        
        {/* Fifth row: Comment - Full width */}
        <FormSection className="grid grid-cols-1 gap-4">
          <div className="w-full">
            <CommentField form={form} />
          </div>
        </FormSection>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-2 pt-4">
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
