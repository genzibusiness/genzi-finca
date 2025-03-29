
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { Transaction } from '@/types/cashflow';
import { toast } from 'sonner';

// Import custom form hooks
import useFormData from './form/useFormData';
import useCurrencyConvertor from './form/useCurrencyConvertor';
import { useTransactionForm } from './form/useTransactionForm';

// Import form layout components
import { FormLayout, FormRow } from './form/FormLayout';
import FormActions from './form/FormActions';

// Import form field components
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
  
  // Initialize form hooks
  const { 
    form, 
    filteredStatuses, 
    applyConversionRate, 
    prepareSubmissionData 
  } = useTransactionForm(transaction, statuses, defaultCurrency, currencyRates);
  
  // Handle form submission
  const onSubmit = async (values: any) => {
    try {
      console.log('Form values:', values);
      
      // Prepare transaction data for submission
      const transactionData = prepareSubmissionData(values);
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
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormLayout>
          {/* First row: Transaction Type, Amount, Date */}
          <FormRow>
            <TransactionTypeField form={form} />
            <AmountField form={form} />
            <DateField form={form} />
          </FormRow>
          
          {/* Second row: Currency, Status, Expense Type (conditional) */}
          <FormRow>
            <CurrencyField 
              form={form} 
              currencies={currencies} 
              defaultCurrency={defaultCurrency}
              onCurrencyChange={applyConversionRate}
            />
            <StatusField form={form} statuses={filteredStatuses} />
            {form.watch('type') === 'expense' && (
              <ExpenseTypeField form={form} expenseTypes={expenseTypes} />
            )}
          </FormRow>
          
          {/* Third row: Payment Type, Paid By, Includes Tax */}
          <FormRow>
            <PaymentTypeField form={form} paymentTypes={paymentTypes} />
            <PaidByField form={form} users={users} />
            <div className="flex items-end">
              <IncludesTaxField form={form} />
            </div>
          </FormRow>
          
          {/* Fourth row: Document URL */}
          <FormRow columns={1}>
            <DocumentUrlField form={form} />
          </FormRow>
          
          {/* Fifth row: Comment */}
          <FormRow columns={1}>
            <CommentField form={form} />
          </FormRow>
          
          {/* Action buttons */}
          <FormActions 
            onCancel={handleCancel} 
            isSubmitting={isSubmitting}
            isUpdate={!!transaction.id}
          />
        </FormLayout>
      </form>
    </Form>
  );
};

export default TransactionForm;
