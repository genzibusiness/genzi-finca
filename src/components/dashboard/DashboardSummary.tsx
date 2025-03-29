
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { ArrowDown, ArrowUp, PiggyBank } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DashboardSummary = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netCashflow: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      
      // Fetch total income
      const { data: incomeData, error: incomeError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'income');
      
      if (incomeError) throw incomeError;
      
      // Fetch total expenses
      const { data: expenseData, error: expenseError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'expense');
      
      if (expenseError) throw expenseError;
      
      // Calculate totals
      const totalIncome = incomeData.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const totalExpenses = expenseData.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      
      setSummary({
        totalIncome,
        totalExpenses,
        netCashflow: totalIncome - totalExpenses
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Income
          </CardTitle>
          <ArrowUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CurrencyDisplay amount={summary.totalIncome} type="income" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            YTD Income
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Expenses
          </CardTitle>
          <ArrowDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CurrencyDisplay amount={summary.totalExpenses} type="expense" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            YTD Expenses
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Net Cashflow
          </CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CurrencyDisplay amount={summary.netCashflow} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            YTD Net
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
