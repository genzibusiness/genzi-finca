import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Find and fix the issue on line 145 with String type
// Changed from: const dateMatch = dateValue.match(/^\d{4}-\d{2}-\d{2}$/);
// To a properly typed string method call:
const isValidDateFormat = (dateValue: string) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateValue);
};

export const useTransactionListData = () => {
  const [transactionData, setTransactionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*');
        if (error) {
          setError(error);
        } else {
          setTransactionData(data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, []);

  return { transactionData, loading, error };
};
