
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Transaction } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import { convertCurrency } from '@/utils/currencyUtils';
import { useCurrencyConvertor } from './useCurrencyConvertor';

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
    original_amount: z.number().nullable().optional(),
    original_currency: z.string().nullable().optional(),
    sgd_amount: z.number().nullable().optional(),
    inr_amount: z.number().nullable().optional(),
    usd_amount: z.number().nullable().optional(),
  });
};

export const useTransactionForm = (
  transaction: Partial<Transaction>,
  statuses: { id: string; name: string; type: string; name_normalized: string }[],
  defaultCurrency: string,
  currencyRates: any[]
) => {
  const formSchema = createTransactionFormSchema();
  
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
          original_amount: transaction.original_amount || null,
          original_currency: transaction.original_currency || null,
          sgd_amount: transaction.sgd_amount || null,
          inr_amount: transaction.inr_amount || null,
          usd_amount: transaction.usd_amount || null,
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
          original_amount: null,
          original_currency: null,
          sgd_amount: null,
          inr_amount: null,
          usd_amount: null,
        },
  });

  const filteredStatuses = statuses.filter(
    (status) => !status.type || status.type === form.getValues('type')
  );
  
  // Use our currency converter hook
  const { calculateCurrencyAmounts } = useCurrencyConvertor({
    currencyRates,
    defaultCurrency,
    form
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'type') {
        const relevantStatuses = statuses.filter(
          (status) => !status.type || status.type === value.type
        );
        
        if (relevantStatuses.length > 0 && !relevantStatuses.find(s => s.name_normalized === form.getValues('status'))) {
          form.setValue('status', relevantStatuses[0].name_normalized);
        }
        
        if (value.type === 'income') {
          form.setValue('expense_type', null);
        }
      }
    });
    
    if (!form.getValues('status') && filteredStatuses.length > 0) {
      form.setValue('status', filteredStatuses[0].name_normalized);
    }

    if (!form.getValues('currency') && defaultCurrency && !transaction.id) {
      form.setValue('currency', defaultCurrency);
    }
    
    return () => subscription.unsubscribe();
  }, [form, statuses, defaultCurrency, filteredStatuses, transaction.id]);

  const prepareSubmissionData = (values: any) => {
    const formattedDate = format(values.date, 'yyyy-MM-dd');
    
    const payment_type_id = values.payment_type_id === 'none' ? null : values.payment_type_id || null;
    const paid_by_user_id = values.paid_by_user_id === 'none' ? null : values.paid_by_user_id || null;
    
    const expense_type = values.type === 'income' ? null : values.expense_type;
    
    const document_url = values.document_url || null;
    const comment = values.comment || null;
    const receipt_url = values.receipt_url || null;
    
    // Calculate currency conversions for all transactions
    const currencyAmounts = calculateCurrencyAmounts(values.amount, values.currency);
    
    const transactionData = {
      ...values,
      date: formattedDate,
      expense_type: expense_type,
      payment_type_id: payment_type_id,
      paid_by_user_id: paid_by_user_id,
      document_url: document_url,
      comment: comment,
      receipt_url: receipt_url,
      original_amount: values.amount,
      original_currency: values.currency,
      sgd_amount: currencyAmounts.sgd_amount,
      inr_amount: currencyAmounts.inr_amount,
      usd_amount: currencyAmounts.usd_amount
    };
    
    return transactionData;
  };

  return {
    form,
    filteredStatuses,
    prepareSubmissionData
  };
};

export default useTransactionForm;
