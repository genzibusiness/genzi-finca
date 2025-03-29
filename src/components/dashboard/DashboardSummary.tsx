
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { ArrowDown, ArrowUp, PiggyBank } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCashflow } from '@/context/CashflowContext';

const DashboardSummary = () => {
  const [loading, setLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const { 
    filteredTransactions, 
    selectedMonth, 
    selectedYear, 
    selectedCategory, 
    selectedType 
  } = useCashflow();

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netCashflow: 0
  });

  useEffect(() => {
    fetchDefaultCurrency();
    // Set up subscription for transactions
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions' 
      }, () => {
        calculateSummary();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    calculateSummary();
  }, [filteredTransactions]);

  const fetchDefaultCurrency = async () => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('code')
        .eq('is_default', true)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code when no rows are returned
        throw error;
      }
      
      if (data) {
        setDefaultCurrency(data.code);
      }
    } catch (error) {
      console.error('Error fetching default currency:', error);
    }
  };

  const calculateSummary = async () => {
    setLoading(true);
    
    try {
      // Fetch transactions directly from the database to get real-time data
      let query = supabase.from('transactions').select('*');
      
      // Apply filters if provided
      if (selectedMonth) {
        const year = selectedYear || new Date().getFullYear();
        const startDate = `${year}-${selectedMonth}-01`;
        
        // Calculate end date based on month
        const nextMonth = parseInt(selectedMonth) === 12 ? 1 : parseInt(selectedMonth) + 1;
        const nextYear = parseInt(selectedMonth) === 12 ? parseInt(year.toString()) + 1 : year;
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        query = query.gte('date', startDate).lt('date', endDate);
      } else if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        
        query = query.gte('date', startDate).lte('date', endDate);
      }
      
      if (selectedType) {
        query = query.eq('type', selectedType);
      }
      
      if (selectedCategory) {
        query = query.eq('expense_type', selectedCategory);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Calculate totals from transactions
      const transactions = data || [];
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      setSummary({
        totalIncome,
        totalExpenses,
        netCashflow: totalIncome - totalExpenses
      });
    } catch (error) {
      console.error('Error calculating summary:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to get subtitle text based on current filters
  const getSubtitleText = () => {
    const parts = [];
    
    if (selectedYear) {
      parts.push(selectedYear);
    }
    
    if (selectedMonth) {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      parts.push(monthNames[parseInt(selectedMonth) - 1]);
    }
    
    if (selectedCategory) {
      parts.push(`Category: ${selectedCategory}`);
    }
    
    if (selectedType) {
      parts.push(`Type: ${selectedType}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'YTD';
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
            {loading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              <CurrencyDisplay amount={summary.totalIncome} type="income" currency={defaultCurrency} />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getSubtitleText()} Income
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
            {loading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              <CurrencyDisplay amount={summary.totalExpenses} type="expense" currency={defaultCurrency} />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getSubtitleText()} Expenses
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
            {loading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              <CurrencyDisplay amount={summary.netCashflow} currency={defaultCurrency} />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getSubtitleText()} Net
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
