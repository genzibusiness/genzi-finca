
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseType, TransactionType } from '@/types/cashflow';

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
}

export const useSummaryData = (
  selectedMonth: string | null,
  selectedYear: string | null,
  selectedCategory: string | null,
  selectedType: string | null
) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData>({
    totalIncome: 0,
    totalExpenses: 0,
    netCashflow: 0
  });
  const [defaultCurrency, setDefaultCurrency] = useState('INR');

  useEffect(() => {
    fetchDefaultCurrency();
    calculateSummary();

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
  }, [selectedMonth, selectedYear, selectedCategory, selectedType]);

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
      
      if (selectedType && isValidTransactionType(selectedType)) {
        query = query.eq('type', selectedType);
      }
      
      if (selectedCategory && isValidExpenseType(selectedCategory)) {
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

  return {
    summary,
    loading,
    defaultCurrency
  };
};
