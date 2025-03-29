
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionForm from '@/components/transactions/TransactionForm';
import { useCashflow } from '@/context/CashflowContext';
import { Card, CardContent } from '@/components/ui/card';
import { Transaction } from '@/types/cashflow';

const TransactionContent = () => {
  const navigate = useNavigate();
  const { addTransaction } = useCashflow();
  
  const handleSubmit = (data: Omit<Transaction, 'id'>) => {
    addTransaction(data);
    navigate('/transactions');
  };
  
  return (
    <div className="container max-w-3xl py-6">
      <PageHeader 
        title="New Transaction" 
        description="Create a new transaction record"
      />
      
      <Card>
        <CardContent className="pt-6">
          <TransactionForm 
            onSubmit={handleSubmit}
            onCancel={() => navigate('/transactions')}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const TransactionNew = () => {
  return (
    <AppLayout>
      <TransactionContent />
    </AppLayout>
  );
};

export default TransactionNew;
