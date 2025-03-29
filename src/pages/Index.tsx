
import React from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import DashboardFilters from '@/components/dashboard/DashboardFilters';

const Index = () => {
  return (
    <AppLayout>
      <div className="container max-w-7xl py-6">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your organization's finances"
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
