
import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionType, TransactionStatus, ExpenseType } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { parse, isValid, format } from 'date-fns';

interface UseTransactionListDataProps {
  selectedMonth: string | null;
  selectedYear: string | null;
  selectedCategory: string | null;
  filterType: TransactionType | null;
}

interface UseTransactionListDataReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  filters: {[key: string]: string};
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  handleSort: (column: string) => void;
  handleFilter: (column: string, value: string) => void;
  clearFilter: (column: string) => void;
  fetchTransactions: () => Promise<void>;
  validTransactionTypes: TransactionType[];
  validTransactionStatuses: TransactionStatus[];
}

export const useTransactionListData = ({
  selectedMonth,
  selectedYear,
  selectedCategory,
  filterType
}: UseTransactionListDataProps): UseTransactionListDataReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<{[key: string]: string}>({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const validTransactionTypes: TransactionType[] = ["income", "expense"];
  const validTransactionStatuses: TransactionStatus[] = ["paid", "received", "yet_to_be_paid", "yet_to_be_received"];
  
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let countQuery = supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });
      
      let query = supabase
        .from('transactions')
        .select('*')
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      
      if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        
        query = query.gte('date', startDate).lte('date', endDate);
        countQuery = countQuery.gte('date', startDate).lte('date', endDate);
      }
      
      if (selectedMonth) {
        const year = selectedYear || new Date().getFullYear();
        const startDate = `${year}-${selectedMonth}-01`;
        
        const nextMonth = parseInt(selectedMonth) === 12 ? 1 : parseInt(selectedMonth) + 1;
        const nextYear = parseInt(selectedMonth) === 12 ? parseInt(year.toString()) + 1 : year;
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        query = query.gte('date', startDate).lt('date', endDate);
        countQuery = countQuery.gte('date', startDate).lt('date', endDate);
      }
      
      if (filterType) {
        query = query.eq('type', filterType);
        countQuery = countQuery.eq('type', filterType);
      }
      
      if (selectedCategory) {
        const validExpenseTypes: ExpenseType[] = ["Salary", "Marketing", "Services", "Software", "Other"];
        if (validExpenseTypes.includes(selectedCategory as ExpenseType)) {
          query = query.eq('expense_type', selectedCategory as ExpenseType);
          countQuery = countQuery.eq('expense_type', selectedCategory as ExpenseType);
        }
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          if (key === 'date') {
            const dateValue = value.trim();
            try {
              const dateMatch = dateValue.match(/^\d{4}-\d{2}-\d{2}$/);
              if (dateMatch) {
                query = query.eq(key, dateValue);
                countQuery = countQuery.eq(key, dateValue);
              } else {
                if (dateValue.match(/^\d{4}-\d{2}$/)) {
                  const yearMonth = dateValue.split('-');
                  const year = yearMonth[0];
                  const month = yearMonth[1];
                  const startDate = `${year}-${month}-01`;
                  
                  const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
                  const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
                  const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
                  
                  query = query.gte(key, startDate).lt(key, endDate);
                  countQuery = countQuery.gte(key, startDate).lt(key, endDate);
                } else if (dateValue.match(/^\d{4}$/)) {
                  const year = dateValue;
                  const startDate = `${year}-01-01`;
                  const endDate = `${year}-12-31`;
                  
                  query = query.gte(key, startDate).lte(key, endDate);
                  countQuery = countQuery.gte(key, startDate).lte(key, endDate);
                } else {
                  const dateFormats = [
                    'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 
                    'MMM d, yyyy', 'MMMM d, yyyy', 'MMM yyyy', 'MMMM yyyy'
                  ];
                  
                  let parsedDate = null;
                  
                  for (const format of dateFormats) {
                    const attemptParse = parse(dateValue, format, new Date());
                    if (isValid(attemptParse)) {
                      parsedDate = format(attemptParse, 'yyyy-MM-dd');
                      break;
                    }
                  }
                  
                  if (parsedDate) {
                    query = query.eq(key, parsedDate);
                    countQuery = countQuery.eq(key, parsedDate);
                  } else {
                    query = query.ilike(key, `%${dateValue}%`);
                    countQuery = countQuery.ilike(key, `%${dateValue}%`);
                  }
                }
              }
            } catch (error) {
              console.error("Date filter error:", error);
              query = query.ilike(key, `%${dateValue}%`);
              countQuery = countQuery.ilike(key, `%${dateValue}%`);
            }
          } else if (key === 'amount') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              query = query.eq(key, numValue);
              countQuery = countQuery.eq(key, numValue);
            } else if (value.includes('>')) {
              const thresh = parseFloat(value.replace('>', '').trim());
              if (!isNaN(thresh)) {
                query = query.gt(key, thresh);
                countQuery = countQuery.gt(key, thresh);
              }
            } else if (value.includes('<')) {
              const thresh = parseFloat(value.replace('<', '').trim());
              if (!isNaN(thresh)) {
                query = query.lt(key, thresh);
                countQuery = countQuery.lt(key, thresh);
              }
            } else {
              query = query.ilike(key, `%${value}%`);
              countQuery = countQuery.ilike(key, `%${value}%`);
            }
          } else if (key === 'type') {
            if (validTransactionTypes.includes(value as TransactionType)) {
              query = query.eq(key, value as TransactionType);
              countQuery = countQuery.eq(key, value as TransactionType);
            } else {
              query = query.ilike(key, `%${value}%`);
              countQuery = countQuery.ilike(key, `%${value}%`);
            }
          } else if (key === 'status') {
            if (validTransactionStatuses.includes(value as TransactionStatus)) {
              query = query.eq(key, value as TransactionStatus);
              countQuery = countQuery.eq(key, value as TransactionStatus);
            } else {
              query = query.ilike(key, `%${value}%`);
              countQuery = countQuery.ilike(key, `%${value}%`);
            }
          } else if (key === 'expense_type') {
            // Special handling for expense_type - ensure we're checking if it exists
            // and handling casting appropriately
            const expenseValue = value.trim();
            try {
              // Try to match against enum values
              const validExpenseTypes: ExpenseType[] = ["Salary", "Marketing", "Services", "Software", "Other"];
              
              // Check for exact match with type assertion
              if (validExpenseTypes.includes(expenseValue as any)) {
                // Safe to use strict equality since we've verified it's a valid enum value
                const typedValue = expenseValue as ExpenseType;
                query = query.eq(key, typedValue);
                countQuery = countQuery.eq(key, typedValue);
              } else {
                // Use partial matching if exact match fails
                const matches = validExpenseTypes.filter(t => 
                  t.toLowerCase().includes(expenseValue.toLowerCase())
                );
                
                if (matches.length > 0) {
                  // `in` operator expects an array of valid types
                  query = query.in(key, matches);
                  countQuery = countQuery.in(key, matches);
                } else {
                  console.log("No matching expense types found for:", expenseValue);
                }
              }
            } catch (error) {
              console.error("Expense type filter error:", error);
            }
          } else {
            // Default case for other string fields - use template literals instead of String()
            query = query.ilike(key, `%${value}%`);
            countQuery = countQuery.ilike(key, `%${value}%`);
          }
        }
      });
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / pageSize));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setError(error.message || 'Failed to load transactions');
      toast.error('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterType, filters, pageSize, selectedCategory, selectedMonth, selectedYear, sortColumn, sortDirection]);
  
  useEffect(() => {
    fetchTransactions();
    
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions' 
      }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactions]);
  
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  }, [sortColumn, sortDirection]);
  
  const handleFilter = useCallback((column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1);
  }, []);
  
  const clearFilter = useCallback((column: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
    setCurrentPage(1);
  }, []);
  
  return {
    transactions,
    isLoading,
    error,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    sortColumn,
    sortDirection,
    filters,
    setCurrentPage,
    setPageSize,
    handleSort,
    handleFilter,
    clearFilter,
    fetchTransactions,
    validTransactionTypes,
    validTransactionStatuses
  };
};
