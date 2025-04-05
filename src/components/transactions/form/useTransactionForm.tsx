import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Transaction } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import { convertCurrency } from '@/utils/currencyUtils';

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
        },
  });

  const filteredStatuses = statuses.filter(
    (status) => !status.type || status.type === form.getValues('type')
  );
  
  const convertToSGD = async (amount: number, fromCurrency: string): Promise<number | null> => {
    if (fromCurrency === 'SGD') {
      return amount;
    }

    const directRate = currencyRates.find(
      rate => rate.from_currency === fromCurrency && rate.to_currency === 'SGD'
    );

    if (directRate) {
      return amount * directRate.rate;
    }

    const inverseRate = currencyRates.find(
      rate => rate.from_currency === 'SGD' && rate.to_currency === fromCurrency
    );

    if (inverseRate) {
      return amount / inverseRate.rate;
    }

    try {
      const { data, error } = await supabase
        .from('currency_rates')
        .select('*')
        .or(`from_currency.eq.${fromCurrency},to_currency.eq.${fromCurrency}`);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const freshDirectRate = data.find(
          rate => rate.from_currency === fromCurrency && rate.to_currency === 'SGD'
        );

        if (freshDirectRate) {
          return amount * freshDirectRate.rate;
        }

        const freshInverseRate = data.find(
          rate => rate.from_currency === 'SGD' && rate.to_currency === fromCurrency
        );

        if (freshInverseRate) {
          return amount / freshInverseRate.rate;
        }
      }
    } catch (error) {
      console.error('Error fetching currency rates:', error);
    }

    console.error(`No conversion rate found for ${fromCurrency} to SGD`);
    return null;
  };

  const applyConversionRate = (selectedCurrency: string) => {
    if (selectedCurrency === 'SGD' && defaultCurrency && defaultCurrency !== 'SGD') {
      const conversionRate = currencyRates.find(
        rate => rate.from_currency === 'SGD' && rate.to_currency === defaultCurrency
      );
      
      if (conversionRate) {
        const currentAmount = form.getValues('amount');
        const convertedAmount = currentAmount * conversionRate.rate;
        console.log(`Converting ${currentAmount} SGD to ${convertedAmount} ${defaultCurrency} (rate: ${conversionRate.rate})`);
        
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

  const convertToAllCurrencies = async (amount: number, fromCurrency: string): Promise<{
    sgd_amount: number | null;
    inr_amount: number | null;
    usd_amount: number | null;
  }> => {
    if (!amount || isNaN(amount)) {
      return {
        sgd_amount: null,
        inr_amount: null,
        usd_amount: null
      };
    }
    
    let sgdAmount: number | null = null;
    let inrAmount: number | null = null;
    let usdAmount: number | null = null;
    
    if (fromCurrency === 'SGD') {
      sgdAmount = amount;
    } else {
      const directToSGD = currencyRates.find(
        rate => rate.from_currency === fromCurrency && rate.to_currency === 'SGD'
      );
      
      if (directToSGD) {
        sgdAmount = amount * directToSGD.rate;
      } else {
        const inverseFromSGD = currencyRates.find(
          rate => rate.from_currency === 'SGD' && rate.to_currency === fromCurrency
        );
        
        if (inverseFromSGD) {
          sgdAmount = amount / inverseFromSGD.rate;
        }
      }
    }
    
    if (fromCurrency === 'INR') {
      inrAmount = amount;
    } else if (sgdAmount !== null) {
      const sgdToINR = currencyRates.find(
        rate => rate.from_currency === 'SGD' && rate.to_currency === 'INR'
      );
      
      if (sgdToINR) {
        inrAmount = sgdAmount * sgdToINR.rate;
      } else {
        const directToINR = currencyRates.find(
          rate => rate.from_currency === fromCurrency && rate.to_currency === 'INR'
        );
        
        if (directToINR) {
          inrAmount = amount * directToINR.rate;
        }
      }
    }
    
    if (fromCurrency === 'USD') {
      usdAmount = amount;
    } else if (sgdAmount !== null) {
      const sgdToUSD = currencyRates.find(
        rate => rate.from_currency === 'SGD' && rate.to_currency === 'USD'
      );
      
      if (sgdToUSD) {
        usdAmount = sgdAmount * sgdToUSD.rate;
      } else {
        const directToUSD = currencyRates.find(
          rate => rate.from_currency === fromCurrency && rate.to_currency === 'USD'
        );
        
        if (directToUSD) {
          usdAmount = amount * directToUSD.rate;
        }
      }
    }
    
    return {
      sgd_amount: sgdAmount,
      inr_amount: inrAmount,
      usd_amount: usdAmount
    };
  };

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
      
      if (name === 'currency' && value.currency === 'SGD') {
        applyConversionRate(value.currency);
      }

      if ((name === 'amount' || name === 'currency') && value.amount && value.currency) {
        form.setValue('original_amount', value.amount);
        form.setValue('original_currency', value.currency);
        
        if (value.currency !== 'SGD') {
          convertToSGD(value.amount, value.currency).then(sgdAmount => {
            if (sgdAmount !== null) {
              form.setValue('sgd_amount', sgdAmount);
            }
          });
        } else {
          form.setValue('sgd_amount', value.amount);
        }
        
        convertToAllCurrencies(value.amount, value.currency).then(amounts => {
          form.setValue('sgd_amount', amounts.sgd_amount);
          form.setValue('inr_amount', amounts.inr_amount);
          form.setValue('usd_amount', amounts.usd_amount);
        });
      }
    });
    
    if (!form.getValues('status') && filteredStatuses.length > 0) {
      form.setValue('status', filteredStatuses[0].name_normalized);
    }

    if (!form.getValues('currency') && defaultCurrency && !transaction.id) {
      form.setValue('currency', defaultCurrency);
    }
    
    return () => subscription.unsubscribe();
  }, [form, statuses, defaultCurrency, filteredStatuses, currencyRates, transaction.id]);

  const prepareSubmissionData = (values: any) => {
    const formattedDate = format(values.date, 'yyyy-MM-dd');
    
    const payment_type_id = values.payment_type_id === 'none' ? null : values.payment_type_id || null;
    const paid_by_user_id = values.paid_by_user_id === 'none' ? null : values.paid_by_user_id || null;
    
    const expense_type = values.type === 'income' ? null : values.expense_type;
    
    const document_url = values.document_url || null;
    const comment = values.comment || null;
    const receipt_url = values.receipt_url || null;
    
    const transactionData = {
      ...values,
      date: formattedDate,
      expense_type: expense_type,
      payment_type_id: payment_type_id,
      paid_by_user_id: paid_by_user_id,
      document_url: document_url,
      comment: comment,
      receipt_url: receipt_url,
      original_amount: values.original_amount || values.amount,
      original_currency: values.original_currency || values.currency,
      sgd_amount: values.sgd_amount || (values.currency === 'SGD' ? values.amount : null),
      inr_amount: values.inr_amount || (values.currency === 'INR' ? values.amount : null),
      usd_amount: values.usd_amount || (values.currency === 'USD' ? values.amount : null)
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
