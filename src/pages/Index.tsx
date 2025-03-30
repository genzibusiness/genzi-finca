
import React, { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import { supabase } from '@/integrations/supabase/client';
import { useCashflow } from '@/context/CashflowContext';
import { TransactionType } from '@/types/cashflow';

const Index = () => {
  const {
    selectedMonth, 
    selectedYear, 
    selectedCategory, 
    selectedType
  } = useCashflow();

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
      <div className="container px-4 sm:px-6 max-w-7xl py-4 sm:py-6">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your organization's finances"
        />
        
        <DashboardFilters />
        <DashboardSummary />
        <div className="grid gap-4 grid-cols-1">
          <DashboardCharts 
            selectedMonth={selectedMonth || ''}
            selectedYear={selectedYear || ''}
            selectedCategory={selectedCategory || ''}
            selectedType={selectedType as TransactionType || 'expense'}
          />
          <RecentTransactions />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
