
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Transaction, ExpenseType } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionForm from '@/components/transactions/TransactionForm';
import { toast } from 'sonner';

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!id) {
        setError('Transaction ID is missing');
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setTransaction(data || null);
    } catch (error: any) {
      console.error('Error fetching transaction:', error);
      setError(error.message || 'Failed to load transaction');
      toast.error('Failed to load transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionData();
  }, [id]);

  const handleSave = async (updatedTransaction: Partial<Transaction>) => {
    try {
      // Ensure we have a transaction to update
      if (!transaction || !id) return;
      
      // Optimistically update the transaction in the UI
      setTransaction({ ...transaction, ...updatedTransaction });
    
      // Persist the changes to the database
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: updatedTransaction.amount,
          date: updatedTransaction.date,
          type: updatedTransaction.type,
          currency: updatedTransaction.currency,
          expense_type: updatedTransaction.expense_type,
          comment: updatedTransaction.comment,
          status: updatedTransaction.status,
          document_url: updatedTransaction.document_url,
          includes_tax: updatedTransaction.includes_tax
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Transaction updated successfully');
      // Navigate back to transactions list after successful update
      navigate('/transactions');
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction. Please try again.');
      // Revert the optimistic update if the database update fails
      fetchTransactionData();
    }
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-6">
        <PageHeader
          title="Transaction Details"
          description="View and manage transaction information"
          action={{
            label: "Back to Transactions",
            onClick: handleCancel
          }}
        />

        {isLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchTransactionData}>Retry</Button>
          </div>
        ) : !transaction ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">Transaction not found</p>
            <Button onClick={() => navigate('/transactions/new')}>
              Add Transaction
            </Button>
          </div>
        ) : (
          <TransactionForm 
            transaction={transaction} 
            onSave={handleSave}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default TransactionDetail;
