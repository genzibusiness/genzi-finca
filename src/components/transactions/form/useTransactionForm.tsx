import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Transaction } from '@/types/cashflow';

// Create the form schema
const createTransactionFormSchema = () => {
  return z.object({
    amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
    date: z.date(),
    type: z.enum(['income', 'expense']),
    expense_type: z.string().nullable().optional(),
    status: z.string(),
    currency: z.string(),
    comment: z.string().nullable().optional(),
    document_url: z.string().nullable().optional(),
    receipt_url: z.string().nullable().optional(),
    includes_tax: z.boolean().optional(),
    payment_type_id: z.string().optional(),
    paid_by_user_id: z.string().optional(),
  });
};

export const useTransactionForm = (
  transaction: Partial<Transaction>,
  statuses: { id: string; name: string; type: string; name_normalized: string }[],
  defaultCurrency: string,
  currencyRates: any[]
) => {
  const formSchema = createTransactionFormSchema();
  
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
          expense_type: transaction.expense_type || null,
          document_url: transaction.document_url || null,
          comment: transaction.comment || null,
          receipt_url: transaction.receipt_url || null,
        }
      : {
          amount: 0,
          date: new Date(),
          type: 'expense',
          status: '',
          currency: defaultCurrency,
          comment: null,
          document_url: null,
          receipt_url: null,
          includes_tax: false,
          payment_type_id: '',
          paid_by_user_id: '',
          expense_type: null,
        },
  });

  // Filter statuses based on selected transaction type
  const filteredStatuses = statuses.filter(
    (status) => !status.type || status.type === form.getValues('type')
  );
  
  // Apply currency conversion for SGD
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
          return true;
        }
      }
    }
    return false;
  };
  
  // Watch for type changes to update status options and expense type
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'type') {
        // Update status based on transaction type
        const relevantStatuses = statuses.filter(
          (status) => !status.type || status.type === value.type
        );
        
        if (relevantStatuses.length > 0 && !relevantStatuses.find(s => s.name_normalized === form.getValues('status'))) {
          form.setValue('status', relevantStatuses[0].name_normalized);
        }
        
        // If transaction type changes to income, set expense_type to null
        if (value.type === 'income') {
          form.setValue('expense_type', null);
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
  }, [form, statuses, defaultCurrency, filteredStatuses, currencyRates, transaction.id]);

  // Format form values for submission
  const prepareSubmissionData = (values: any) => {
    // Format the date for database
    const formattedDate = format(values.date, 'yyyy-MM-dd');
    
    // Handle the "none" value for payment_type_id and paid_by_user_id
    const payment_type_id = values.payment_type_id === 'none' ? null : values.payment_type_id || null;
    const paid_by_user_id = values.paid_by_user_id === 'none' ? null : values.paid_by_user_id || null;
    
    // Prepare expense_type - ensure it's null for income transactions
    const expense_type = values.type === 'income' ? null : values.expense_type;
    
    // Handle empty strings for nullable text fields
    const document_url = values.document_url || null;
    const comment = values.comment || null;
    const receipt_url = values.receipt_url || null;
    
    // Prepare transaction data
    const transactionData = {
      ...values,
      date: formattedDate,
      expense_type: expense_type,
      payment_type_id: payment_type_id,
      paid_by_user_id: paid_by_user_id,
      document_url: document_url,
      comment: comment,
      receipt_url: receipt_url,
    };
    
    return transactionData;
  };

  return {
    form,
    filteredStatuses,
    applyConversionRate,
    prepareSubmissionData
  };
};

export default useTransactionForm;
