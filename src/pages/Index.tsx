
import React from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout>
      <div className="container max-w-7xl py-6">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your organization's finances"
          action={{
            label: "Add Transaction",
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: () => navigate('/transactions/new')
          }}
        />
        
        <DashboardFilters />
        <DashboardSummary />
        <DashboardCharts />
        <RecentTransactions />
      </div>
    </AppLayout>
  );
};

export default Index;
