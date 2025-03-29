
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StatusDataItem {
  status: string;
  value: number;
  currency: string;
}

interface StatusData {
  income: StatusDataItem[];
  expense: StatusDataItem[];
}

export const useStatusBasedData = () => {
  const [statusData, setStatusData] = useState<StatusData>({ income: [], expense: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStatusData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("User is not authenticated");
        }

        // Get all transactions for the current user
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', session.user.id);

        if (transactionsError) {
          throw new Error(transactionsError.message);
        }

        // Aggregate data by transaction type and status
        const incomeByStatus: Record<string, number> = {};
        const expenseByStatus: Record<string, number> = {};
        let defaultCurrency = 'USD';

        // Process transactions
        transactions.forEach((transaction) => {
          const { type, amount, status, currency } = transaction;
          defaultCurrency = currency || defaultCurrency;

          // Skip transactions without status
          if (!status) return;

          if (type === 'income') {
            incomeByStatus[status] = (incomeByStatus[status] || 0) + amount;
          } else if (type === 'expense') {
            expenseByStatus[status] = (expenseByStatus[status] || 0) + amount;
          }
        });

        // Convert to arrays for chart data
        const incomeData: StatusDataItem[] = Object.entries(incomeByStatus).map(([status, value]) => ({
          status,
          value,
          currency: defaultCurrency,
        }));

        const expenseData: StatusDataItem[] = Object.entries(expenseByStatus).map(([status, value]) => ({
          status,
          value,
          currency: defaultCurrency,
        }));

        setStatusData({
          income: incomeData,
          expense: expenseData,
        });
      } catch (err) {
        console.error('Error fetching status data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  return { statusData, isLoading, error };
};
