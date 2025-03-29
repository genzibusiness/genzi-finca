
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Find and fix the issue on line 145 with String type
// Changed from: const dateMatch = dateValue.match(/^\d{4}-\d{2}-\d{2}$/);
// To a properly typed string method call:
const isValidDateFormat = (dateValue: string) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateValue);
};

export const useTransactionListData = (
  options: {
    showSubCategory?: boolean;
    showCreatedBy?: boolean;
    selectedMonth?: string | null;
    selectedYear?: string | null;
    selectedCategory?: string | null;
    filterType?: string | null;
  } = {}
) => {
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const {
    selectedMonth,
    selectedYear,
    selectedCategory,
    filterType
  } = options;

  useEffect(() => {
    const fetchTransactionData = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('transactions')
          .select('*');
        
        // Apply filters
        if (selectedYear) {
          const startDate = `${selectedYear}-01-01`;
          const endDate = `${selectedYear}-12-31`;
          query = query.gte('date', startDate).lte('date', endDate);
        }
        
        if (selectedMonth && selectedYear) {
          const startDate = `${selectedYear}-${selectedMonth}-01`;
          
          // Calculate end date (first day of next month)
          const nextMonth = parseInt(selectedMonth) === 12 ? 1 : parseInt(selectedMonth) + 1;
          const nextYear = parseInt(selectedMonth) === 12 ? parseInt(selectedYear) + 1 : parseInt(selectedYear);
          const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
          
          query = query.gte('date', startDate).lt('date', endDate);
        }
        
        if (filterType) {
          query = query.eq('type', filterType);
        }
        
        if (selectedCategory) {
          query = query.eq('expense_type', selectedCategory);
        }

        const { data, error } = await query;
        if (error) {
          setError(error);
        } else {
          setTransactionData(data || []);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [selectedMonth, selectedYear, selectedCategory, filterType]);

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setTransactionData(prev => prev.filter(item => item.id !== id));
      
      return { success: true };
    } catch (error: any) {
      toast.error(`Failed to delete transaction: ${error.message}`);
      return { success: false, error };
    }
  };

  return { 
    transactions: transactionData, 
    isLoading: loading, 
    error,
    deleteTransaction
  };
};
