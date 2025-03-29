import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseType, TransactionType } from '@/types/cashflow';

interface CategoryData {
  name: string;
  amount: number;
  fill: string;
}

export const useExpenseCategoriesData = (
  selectedMonth: string | null,
  selectedYear: string | null,
  selectedCategory: string | null,
  selectedType: string | null
) => {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [defaultSymbol, setDefaultSymbol] = useState('₹');

  useEffect(() => {
    fetchDefaultCurrency();
    processChartData();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions' 
      }, () => {
        processChartData();
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
    return value !== null;
  };

  // Helper function to validate transaction type
  const isValidTransactionType = (value: string | null): value is TransactionType => {
    if (!value) return false;
    return ['income', 'expense'].includes(value as TransactionType);
  };

  const processChartData = async () => {
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
      
      // Process category data for expenses
      const categoryMap = new Map();
      
      (transactions || [])
        .filter(transaction => transaction.type === 'expense')
        .forEach(transaction => {
          const category = transaction.expense_type || 'Other';
          const existingAmount = categoryMap.get(category) || 0;
          categoryMap.set(category, existingAmount + Number(transaction.amount));
        });
      
      const processedCategoryData = Array.from(categoryMap.entries())
        .map(([name, amount]) => ({
          name,
          amount,
          fill: '#059669'
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Top 5 categories
      
      setCategoryData(processedCategoryData);
    } catch (error) {
      console.error('Error processing chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    categoryData,
    loading,
    defaultCurrency,
    defaultSymbol
  };
};
