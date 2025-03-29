
import React from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionList from '@/components/transactions/TransactionList';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Expenses = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout>
      <div className="container max-w-7xl py-6">
        <PageHeader 
          title="Expenses" 
          description="Track and manage all expense transactions"
          action={{
            label: "Add Expense",
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: () => navigate('/transactions/new')
          }}
        />
        
        <DashboardFilters />
        <TransactionList 
          filterType="expense"
        />
      </div>
    </AppLayout>
  );
};

export default Expenses;
