import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, CurrencyType, TransactionStatus, ExpenseType, TransactionType } from '@/types/cashflow';
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
      const { data } = await supabase
        .from('currencies')
        .select('code')
        .eq('is_default', true)
        .single();
      
      if (data) {
        setDefaultCurrency(data.code as CurrencyType);
      }
    };
    
    fetchDefaultCurrency();
  }, []);

  const handleSave = async (transaction: Partial<Transaction>) => {
    try {
      setLoading(true);
      
      if (!transaction.amount || !transaction.date || !transaction.currency || !transaction.status || !transaction.type) {
        throw new Error('Missing required fields for transaction');
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        throw new Error('User not authenticated');
      }
      
      const validStatus = isValidTransactionStatus(transaction.status) 
        ? transaction.status 
        : 'yet_to_be_paid';
      
      const transactionData = {
        amount: transaction.amount,
        date: transaction.date,
        currency: transaction.currency,
        status: validStatus,
        type: transaction.type,
        user_id: userData.user.id,
        expense_type: transaction.expense_type || null,
        comment: transaction.comment || null,
        document_url: transaction.document_url || null,
        includes_tax: transaction.includes_tax || false
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
    includes_tax: false
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
