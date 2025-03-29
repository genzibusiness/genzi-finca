
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, CurrencyType } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionForm from '@/components/transactions/TransactionForm';
import { toast } from 'sonner';

const TransactionNew = () => {
  const navigate = useNavigate();
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyType>("INR");

  // Fetch the default currency
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
      // Ensure we're passing a single object, not an array
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select('id')
        .single();
      
      if (error) throw error;
      
      toast.success('Transaction created successfully');
      navigate(`/transactions/${data.id}`);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error(error.message || 'Failed to create transaction');
    }
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  // Create an empty transaction object
  const emptyTransaction: Partial<Transaction> = {
    type: 'expense',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'yet_to_be_paid',
    currency: defaultCurrency,
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
        />
      </div>
    </AppLayout>
  );
};

export default TransactionNew;
