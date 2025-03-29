
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, CurrencyType, TransactionStatus, ExpenseType, TransactionType, ExpenseTypeEnum } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionForm from '@/components/transactions/TransactionForm';
import { toast } from 'sonner';

const TransactionNew = () => {
  const navigate = useNavigate();
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyType>("INR");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDefaultCurrency = async () => {
      try {
        const { data, error } = await supabase
          .from('currencies')
          .select('code')
          .eq('is_default', true)
          .single();
        
        if (error) {
          console.error('Error fetching default currency:', error);
          return;
        }
        
        if (data) {
          console.log('Default currency fetched:', data.code);
          setDefaultCurrency(data.code as CurrencyType);
        }
      } catch (err) {
        console.error('Error in fetchDefaultCurrency:', err);
      }
    };
    
    fetchDefaultCurrency();
  }, []);

  const handleSave = async (transaction: Partial<Transaction>) => {
    try {
      setLoading(true);
      console.log('Attempting to save transaction:', transaction);
      
      if (!transaction.amount || !transaction.date || !transaction.currency || !transaction.status || !transaction.type) {
        throw new Error('Missing required fields for transaction');
      }
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('User not authenticated');
      }
      
      if (!userData || !userData.user) {
        throw new Error('User not authenticated');
      }
      
      const validStatus = isValidTransactionStatus(transaction.status) 
        ? transaction.status 
        : 'yet_to_be_paid';
      
      // Cast expense_type to ExpenseTypeEnum if it's a valid type, otherwise null
      const validExpenseType = transaction.expense_type && isValidExpenseType(transaction.expense_type) 
        ? transaction.expense_type as ExpenseTypeEnum
        : null;
      
      const transactionData = {
        amount: transaction.amount,
        date: transaction.date,
        currency: transaction.currency,
        status: validStatus,
        type: transaction.type,
        user_id: userData.user.id,
        expense_type: validExpenseType,
        comment: transaction.comment || null,
        document_url: transaction.document_url || null,
        includes_tax: transaction.includes_tax || false,
        payment_type_id: transaction.payment_type_id || null,
        paid_by_user_id: transaction.paid_by_user_id || null
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
      setLoading(false);
    }
  };

  // Helper function to validate transaction status
  const isValidTransactionStatus = (status: string): status is TransactionStatus => {
    return ['paid', 'received', 'yet_to_be_paid', 'yet_to_be_received'].includes(status as TransactionStatus);
  };
  
  // Helper function to validate expense type
  const isValidExpenseType = (type: string): type is ExpenseTypeEnum => {
    return ['Salary', 'Marketing', 'Services', 'Software', 'Other'].includes(type as ExpenseTypeEnum);
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
    includes_tax: false,
    payment_type_id: '',
    paid_by_user_id: ''
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
