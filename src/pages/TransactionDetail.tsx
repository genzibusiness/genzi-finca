
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { useCashflow } from '@/context/CashflowContext';
import TransactionDetailView from '@/components/transactions/TransactionDetail';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { Transaction } from '@/types/cashflow';
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

const TransactionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTransactionById, updateTransaction, deleteTransaction } = useCashflow();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const transaction = getTransactionById(id || '');
  
  if (!transaction) {
    return (
      <AppLayout>
        <div className="container max-w-3xl py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Transaction Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              The transaction you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/transactions')} className="mt-4">
              Back to Transactions
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  const handleUpdate = (data: Omit<Transaction, 'id'>) => {
    updateTransaction({ ...data, id: transaction.id });
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    deleteTransaction(transaction.id);
    navigate('/transactions');
  };
  
  return (
    <AppLayout>
      <div className="container max-w-3xl py-6">
        <PageHeader 
          title={isEditing ? "Edit Transaction" : "Transaction Details"}
          action={
            !isEditing ? {
              label: "Edit",
              icon: <Edit className="h-4 w-4 mr-2" />,
              onClick: () => setIsEditing(true)
            } : undefined
          }
        />
        
        {isEditing ? (
          <TransactionForm 
            initialData={transaction}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <TransactionDetailView transaction={transaction} />
            
            <div className="mt-6 flex justify-end">
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Transaction
              </Button>
            </div>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this transaction record.
                    This action cannot be undone.
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
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default TransactionDetailPage;
