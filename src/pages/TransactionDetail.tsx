
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
          includes_tax: updatedTransaction.includes_tax,
          payment_type_id: updatedTransaction.payment_type_id || null,
          paid_by_user_id: updatedTransaction.paid_by_user_id || null
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

  const handleDelete = async () => {
    try {
      if (!id) return;
      
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Transaction deleted successfully');
      navigate('/transactions');
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction. Please try again.');
    } finally {
      setIsDeleting(false);
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
          <>
            <div className="flex justify-end mb-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Transaction
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the 
                      transaction and remove it from our database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <TransactionForm 
              transaction={transaction} 
              onSave={handleSave}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default TransactionDetail;
