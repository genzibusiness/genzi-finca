
import React from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionList from '@/components/transactions/TransactionList';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Transactions = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout>
      <div className="container max-w-7xl py-6">
        <PageHeader 
          title="Transactions" 
          description="View and manage all transactions"
          action={{
            label: "Add Transaction",
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: () => navigate('/transactions/new')
          }}
        />
        
        <DashboardFilters />
        <TransactionList showSubCategory showCreatedBy />
      </div>
    </AppLayout>
  );
};

export default Transactions;
