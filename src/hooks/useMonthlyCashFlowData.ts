
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseType, TransactionType } from '@/types/cashflow';

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
  net: number;
  sortKey: string;
}

export const useMonthlyCashFlowData = (
  selectedMonth: string | null,
  selectedYear: string | null,
  selectedCategory: string | null,
  selectedType: string | null
) => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [defaultSymbol, setDefaultSymbol] = useState('₹');

  useEffect(() => {
    fetchDefaultCurrency();
    processMonthlyData();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions' 
      }, () => {
        processMonthlyData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMonth, selectedYear, selectedCategory, selectedType]);

  const fetchDefaultCurrency = async () => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('code, symbol')
        .eq('is_default', true)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code when no rows are returned
        throw error;
      }
      
      if (data) {
        setDefaultCurrency(data.code);
        setDefaultSymbol(data.symbol);
      }
    } catch (error) {
      console.error('Error fetching default currency:', error);
    }
  };

  // Helper function to validate expense type
  const isValidExpenseType = (value: string | null): value is ExpenseType => {
    if (!value) return false;
    return ['Salary', 'Marketing', 'Services', 'Software', 'Other'].includes(value as ExpenseType);
  };

  // Helper function to validate transaction type
  const isValidTransactionType = (value: string | null): value is TransactionType => {
    if (!value) return false;
    return ['income', 'expense'].includes(value as TransactionType);
  };

  const processMonthlyData = async () => {
    try {
      setLoading(true);
      
      // Build query with filters
      let query = supabase.from('transactions').select('*');
      
      if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }
      
      if (selectedMonth) {
        const year = selectedYear || new Date().getFullYear();
        const startDate = `${year}-${selectedMonth}-01`;
        
        // Calculate end date based on month
        const nextMonth = parseInt(selectedMonth) === 12 ? 1 : parseInt(selectedMonth) + 1;
        const nextYear = parseInt(selectedMonth) === 12 ? parseInt(year.toString()) + 1 : year;
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        query = query.gte('date', startDate).lt('date', endDate);
      }
      
      if (selectedType && isValidTransactionType(selectedType)) {
        query = query.eq('type', selectedType);
      }
      
      if (selectedCategory && isValidExpenseType(selectedCategory)) {
        query = query.eq('expense_type', selectedCategory);
      }
      
      const { data: transactions, error } = await query;
      
      if (error) throw error;
      
      // Process monthly data
      const monthMap = new Map();
      
      (transactions || []).forEach(transaction => {
        const month = transaction.date.substring(0, 7); // YYYY-MM format
        if (!monthMap.has(month)) {
          monthMap.set(month, { income: 0, expense: 0 });
        }
        
        const monthData = monthMap.get(month);
        if (transaction.type === 'income') {
          monthData.income += Number(transaction.amount);
        } else {
          monthData.expense += Number(transaction.amount);
        }
        
        monthMap.set(month, monthData);
      });
      
      const processedMonthlyData = Array.from(monthMap.entries())
        .map(([month, data]) => ({
          name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          income: data.income,
          expense: data.expense,
          net: data.income - data.expense,
          // Keep the original month string for sorting
          sortKey: month
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
      
      setMonthlyData(processedMonthlyData);
    } catch (error) {
      console.error('Error processing monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    monthlyData,
    loading,
    defaultCurrency,
    defaultSymbol
  };
};
