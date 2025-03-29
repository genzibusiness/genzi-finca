import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionForm from '@/components/transactions/TransactionForm';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleSave = (updatedTransaction: Partial<Transaction>) => {
    // Optimistically update the transaction in the UI
    setTransaction((prevTransaction) => {
      if (!prevTransaction) return prevTransaction;
      return { ...prevTransaction, ...updatedTransaction };
    });
  
    // Persist the changes to the database
    supabase
      .from('transactions')
      .update(updatedTransaction)
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating transaction:', error);
          toast.error('Failed to update transaction. Please try again.');
          // Revert the optimistic update if the database update fails
          fetchTransactionData();
        } else {
          toast.success('Transaction updated successfully');
        }
      });
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  const handleDelete = async () => {
    try {
      setIsDeleteDialogOpen(false);
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Transaction deleted successfully');
      navigate('/transactions');
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error(error.message || 'Failed to delete transaction');
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-6">
        <PageHeader
          title="Transaction Details"
          description="View and manage transaction information"
          actions={
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </div>
          }
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

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this transaction from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default TransactionDetail;
