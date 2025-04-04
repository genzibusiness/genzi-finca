
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExpenseType, TransactionType, Transaction, CurrencyRate } from '@/types/cashflow';
import { convertCurrency } from '@/utils/currencyUtils';

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
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);

  const {
    selectedMonth,
    selectedYear,
    selectedCategory,
    filterType
  } = options;

  // Fetch currency rates once
  useEffect(() => {
    const fetchCurrencyRates = async () => {
      try {
        const { data, error } = await supabase
          .from('currency_rates')
          .select('*');
          
        if (error) {
          console.error('Error fetching currency rates:', error);
        } else {
          setCurrencyRates(data || []);
        }
      } catch (err) {
        console.error('Error in currency rates fetch:', err);
      }
    };
    
    fetchCurrencyRates();
  }, []);

  // Populate missing currency amounts for a transaction
  const populateMissingCurrencyAmounts = async (transaction: Transaction): Promise<Transaction> => {
    // Skip if we already have all currency values
    if (
      transaction.sgd_amount !== null && 
      transaction.inr_amount !== null && 
      transaction.usd_amount !== null
    ) {
      return transaction;
    }
    
    const updates: Partial<Transaction> = {};
    
    // Set the amount for the original currency if missing
    if (transaction.currency === 'SGD' && transaction.sgd_amount === null) {
      updates.sgd_amount = transaction.amount;
    } else if (transaction.currency === 'INR' && transaction.inr_amount === null) {
      updates.inr_amount = transaction.amount;
    } else if (transaction.currency === 'USD' && transaction.usd_amount === null) {
      updates.usd_amount = transaction.amount;
    }
    
    // Calculate missing SGD amount if needed
    if (transaction.sgd_amount === null && transaction.currency !== 'SGD') {
      const sgdAmount = convertCurrency(transaction.amount, transaction.currency, 'SGD', currencyRates);
      if (sgdAmount !== null) updates.sgd_amount = sgdAmount;
    }
    
    // Calculate missing INR amount if needed
    if (transaction.inr_amount === null && transaction.currency !== 'INR') {
      // Try direct conversion first
      const inrAmount = convertCurrency(transaction.amount, transaction.currency, 'INR', currencyRates);
      if (inrAmount !== null) {
        updates.inr_amount = inrAmount;
      } 
      // If direct conversion failed and we have SGD amount, try via SGD
      else if (transaction.sgd_amount !== null || updates.sgd_amount !== undefined) {
        const sgdAmount = transaction.sgd_amount !== null ? transaction.sgd_amount : updates.sgd_amount;
        if (sgdAmount !== undefined) {
          const inrViasgd = convertCurrency(sgdAmount, 'SGD', 'INR', currencyRates);
          if (inrViasgd !== null) updates.inr_amount = inrViasgd;
        }
      }
    }
    
    // Calculate missing USD amount if needed
    if (transaction.usd_amount === null && transaction.currency !== 'USD') {
      // Try direct conversion first
      const usdAmount = convertCurrency(transaction.amount, transaction.currency, 'USD', currencyRates);
      if (usdAmount !== null) {
        updates.usd_amount = usdAmount;
      }
      // If direct conversion failed and we have SGD amount, try via SGD
      else if (transaction.sgd_amount !== null || updates.sgd_amount !== undefined) {
        const sgdAmount = transaction.sgd_amount !== null ? transaction.sgd_amount : updates.sgd_amount;
        if (sgdAmount !== undefined) {
          const usdViasgd = convertCurrency(sgdAmount, 'SGD', 'USD', currencyRates);
          if (usdViasgd !== null) updates.usd_amount = usdViasgd;
        }
      }
    }
    
    // If we have updates to make
    if (Object.keys(updates).length > 0) {
      try {
        const { data: updatedTransaction, error: updateError } = await supabase
          .from('transactions')
          .update(updates)
          .eq('id', transaction.id)
          .select('*')
          .single();
          
        if (updateError) {
          console.error('Error updating transaction currency amounts:', updateError);
          return transaction;
        }
        
        // Return the updated transaction
        return updatedTransaction as unknown as Transaction;
      } catch (err) {
        console.error('Error in update transaction operation:', err);
        return transaction;
      }
    }
    
    return transaction;
  };

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
          // Make sure filterType is either 'income' or 'expense' only
          if (filterType === 'income' || filterType === 'expense') {
            query = query.eq('type', filterType as TransactionType);
          }
        }
        
        if (selectedCategory) {
          // Ensure selectedCategory is a valid ExpenseType
          const validExpenseTypes: ExpenseType[] = ["Salary", "Marketing", "Services", "Software", "Other"];
          if (validExpenseTypes.includes(selectedCategory as ExpenseType)) {
            query = query.eq('expense_type', selectedCategory as ExpenseType);
          }
        }

        const { data, error } = await query;
        if (error) {
          setError(error);
        } else {
          // Process transactions - populate missing currency amounts if needed
          if (data && data.length > 0 && currencyRates.length > 0) {
            // Cast the data to our Transaction type
            const transactions = data as unknown as Transaction[];
            
            // Process each transaction to ensure it has all currency amounts
            const updatedTransactions = await Promise.all(
              transactions.map(transaction => populateMissingCurrencyAmounts(transaction))
            );
            
            setTransactionData(updatedTransactions);
          } else {
            // Cast the data array to our Transaction[] type
            setTransactionData(data as unknown as Transaction[]);
          }
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have currency rates
    if (currencyRates.length > 0) {
      fetchTransactionData();
    }
  }, [selectedMonth, selectedYear, selectedCategory, filterType, currencyRates]);

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
