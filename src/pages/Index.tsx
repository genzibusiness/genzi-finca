
import React, { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  useEffect(() => {
    // Enable real-time updates for transactions
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions' 
      }, (payload) => {
        console.log('Transaction changed:', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AppLayout>
      <div className="container max-w-7xl py-6">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your organization's finances"
        />
        
        <DashboardFilters />
        <DashboardSummary />
        <div className="grid gap-4 grid-cols-1">
          <DashboardCharts />
          <RecentTransactions />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
