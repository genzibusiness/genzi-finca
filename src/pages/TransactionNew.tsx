
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, CurrencyType, TransactionStatus } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionForm from '@/components/transactions/TransactionForm';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { convertCurrency } from '@/utils/currencyUtils';

const TransactionNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyType>("INR");
  const [loading, setIsLoading] = useState(false);
  const [currencyRates, setCurrencyRates] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch default currency
        const { data: currencyData, error: currencyError } = await supabase
          .from('currencies')
          .select('code')
          .eq('is_default', true)
          .maybeSingle();
        
        if (currencyError) {
          console.error('Error fetching default currency:', currencyError);
        } else if (currencyData && currencyData.code) {
          console.log('Default currency fetched:', currencyData.code);
          setDefaultCurrency(currencyData.code as CurrencyType);
        }

        // Fetch currency rates
        const { data: ratesData, error: ratesError } = await supabase
          .from('currency_rates')
          .select('*');

        if (ratesError) {
          console.error('Error fetching currency rates:', ratesError);
        } else if (ratesData) {
          setCurrencyRates(ratesData);
        }
      } catch (err) {
        console.error('Error in fetchInitialData:', err);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleSave = async (transaction: Partial<Transaction>) => {
    try {
      setIsLoading(true);
      console.log('Attempting to save transaction:', transaction);
      
      if (!transaction.amount || !transaction.date || !transaction.currency || !transaction.status || !transaction.type) {
        throw new Error('Missing required fields for transaction');
      }
      
      // Use the user from Auth context
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const validStatus = isValidTransactionStatus(transaction.status) 
        ? transaction.status 
        : 'yet_to_be_paid';
      
      // Handle expense_type properly based on transaction type
      let validExpenseType = null;
      if (transaction.type === 'expense' && transaction.expense_type) {
        validExpenseType = transaction.expense_type;
      }
      
      // Handle payment_type_id and paid_by_user_id
      const payment_type_id = transaction.payment_type_id === 'none' ? null : transaction.payment_type_id;
      const paid_by_user_id = transaction.paid_by_user_id === 'none' ? null : transaction.paid_by_user_id;
      
      // Ensure document_url, receipt_url and comment are properly handled as null if empty
      const document_url = transaction.document_url || null;
      const receipt_url = transaction.receipt_url || null;
      const comment = transaction.comment || null;
      
      // Calculate SGD amount if not already calculated
      let sgdAmount = transaction.sgd_amount;
      
      if (!sgdAmount && transaction.currency !== 'SGD') {
        // Find applicable conversion rate
        const directRate = currencyRates.find(
          (rate) => rate.from_currency === transaction.currency && rate.to_currency === 'SGD'
        );
        
        if (directRate) {
          sgdAmount = transaction.amount * directRate.rate;
        } else {
          // Look for inverse rate
          const inverseRate = currencyRates.find(
            (rate) => rate.from_currency === 'SGD' && rate.to_currency === transaction.currency
          );
          
          if (inverseRate) {
            sgdAmount = transaction.amount / inverseRate.rate;
          }
        }
      } else if (transaction.currency === 'SGD') {
        sgdAmount = transaction.amount;
      }

      // Set original amount if not already set
      const originalAmount = transaction.original_amount || transaction.amount;
      const originalCurrency = transaction.original_currency || transaction.currency;
      
      const transactionData = {
        amount: transaction.amount,
        date: transaction.date,
        currency: transaction.currency,
        status: validStatus,
        type: transaction.type,
        user_id: user.id,
        expense_type: validExpenseType,
        comment: comment,
        document_url: document_url,
        receipt_url: receipt_url,
        includes_tax: transaction.includes_tax || false,
        payment_type_id: payment_type_id,
        paid_by_user_id: paid_by_user_id,
        original_amount: originalAmount,
        original_currency: originalCurrency,
        sgd_amount: sgdAmount
      };
      
      console.log('Saving transaction:', transactionData);
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast.success('Transaction created successfully');
      navigate('/transactions');
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error(error.message || 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to validate transaction status
  const isValidTransactionStatus = (status: string): status is TransactionStatus => {
    return ['paid', 'received', 'yet_to_be_paid', 'yet_to_be_received'].includes(status as TransactionStatus);
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  const emptyTransaction: Partial<Transaction> = {
    type: 'expense',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'yet_to_be_paid',
    currency: defaultCurrency,
    document_url: '',
    receipt_url: '',
    includes_tax: false,
    payment_type_id: '',
    paid_by_user_id: '',
    expense_type: null,
    original_amount: null,
    original_currency: null,
    sgd_amount: null
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-6">
        <PageHeader
          title="New Transaction"
          description="Create a new transaction record"
          action={{
            label: "Cancel",
            onClick: handleCancel
          }}
        />
        
        <TransactionForm 
          transaction={emptyTransaction}
          onSave={handleSave}
          isSubmitting={loading}
        />
      </div>
    </AppLayout>
  );
};

export default TransactionNew;
