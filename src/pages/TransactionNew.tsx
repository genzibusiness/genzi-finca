
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionForm from '@/components/transactions/TransactionForm';
import { toast } from 'sonner';

const TransactionNew = () => {
  const navigate = useNavigate();

  const handleSave = async (transaction: Partial<Transaction>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
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
    status: 'pending',
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-6">
        <PageHeader
          title="New Transaction"
          description="Create a new transaction record"
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
