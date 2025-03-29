
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TransactionStatus } from '@/types/cashflow';

interface StatusData {
  name: string;
  income: number;
  expense: number;
}

export const useStatusBasedData = (
  selectedMonth: string | null,
  selectedYear: string | null,
  selectedCategory: string | null,
  selectedType: string | null
) => {
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [defaultSymbol, setDefaultSymbol] = useState('₹');

  useEffect(() => {
    fetchDefaultCurrency();
    processStatusData();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions' 
      }, () => {
        processStatusData();
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

  const processStatusData = async () => {
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
      
      if (selectedType) {
        query = query.eq('type', selectedType);
      }
      
      if (selectedCategory) {
        query = query.eq('expense_type', selectedCategory);
      }
      
      const { data: transactions, error } = await query;
      
      if (error) throw error;
      
      // Process status data
      const statusMap = new Map<string, { income: number, expense: number }>();
      
      // Initialize with all possible statuses
      const statusNames = {
        'paid': 'Paid',
        'received': 'Received',
        'yet_to_be_paid': 'Yet to be Paid',
        'yet_to_be_received': 'Yet to be Received'
      };
      
      Object.keys(statusNames).forEach(status => {
        statusMap.set(status, { income: 0, expense: 0 });
      });
      
      // Aggregate data by status
      (transactions || []).forEach(transaction => {
        const status = transaction.status;
        const type = transaction.type;
        const amount = Number(transaction.amount);
        
        if (!statusMap.has(status)) {
          statusMap.set(status, { income: 0, expense: 0 });
        }
        
        const statusData = statusMap.get(status)!;
        if (type === 'income') {
          statusData.income += amount;
        } else {
          statusData.expense += amount;
        }
        
        statusMap.set(status, statusData);
      });
      
      // Format for chart display
      const processedStatusData = Array.from(statusMap.entries())
        .map(([status, data]) => ({
          name: statusNames[status as keyof typeof statusNames] || status,
          income: data.income,
          expense: data.expense
        }));
      
      setStatusData(processedStatusData);
    } catch (error) {
      console.error('Error processing status data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    statusData,
    loading,
    defaultCurrency,
    defaultSymbol
  };
};
