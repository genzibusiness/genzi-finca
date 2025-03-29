
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  Transaction, 
  Category, 
  SubCategory, 
  User, 
  TransactionType 
} from '@/types/cashflow';
import { CashflowContextType } from '@/types/cashflowContext';
import { mockCategories, mockSubCategories, mockTransactions, mockUsers } from '@/lib/data';
import { 
  STORAGE_KEY, 
  filterTransactionsByFilters, 
  calculateCashflowSummary 
} from '@/utils/cashflowUtils';
import { useTransactionOperations } from '@/hooks/useTransactionOperations';

const CashflowContext = createContext<CashflowContextType | undefined>(undefined);

export const CashflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for categories and subcategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  
  // State for filters
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null);
  
  // Filtered transactions and summary
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState(calculateCashflowSummary([]));

  // Initialize data from localStorage or mock data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
      try {
        const { transactions, categories, subCategories, users } = JSON.parse(savedData);
        setInitialData(transactions, categories, subCategories, users);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        // Fall back to mock data if localStorage data is invalid
        initializeMockData();
      }
    } else {
      // No data in localStorage, use mock data
      initializeMockData();
    }
  }, []);

  // Initialize transaction operations with empty arrays first
  // They will be updated when data is loaded
  const { 
    transactions, 
    setTransactions,
    users,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getUserById,
    saveToLocalStorage
  } = useTransactionOperations([], []);

  // Set initial data from localStorage or mock data
  const setInitialData = (
    transactions: Transaction[], 
    categories: Category[], 
    subCategories: SubCategory[], 
    users: User[]
  ) => {
    setTransactions(transactions);
    setCategories(categories);
    setSubCategories(subCategories);
  };

  // Initialize with mock data
  const initializeMockData = () => {
    setInitialData(mockTransactions, mockCategories, mockSubCategories, mockUsers);
  };

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (transactions.length > 0) {
      saveToLocalStorage(categories, subCategories);
    }
  }, [transactions, categories, subCategories, users]);

  // Apply filters and calculate summary whenever data or filters change
  useEffect(() => {
    filterTransactions();
    calculateSummary();
  }, [transactions, selectedMonth, selectedYear, selectedCategory, selectedType]);

  // Filter transactions based on selected filters
  const filterTransactions = () => {
    const filtered = filterTransactionsByFilters(
      transactions,
      selectedMonth,
      selectedYear,
      selectedCategory,
      selectedType
    );
    setFilteredTransactions(filtered);
  };

  // Calculate summary for dashboard
  const calculateSummary = () => {
    const transactionsToAnalyze = filteredTransactions.length > 0 
      ? filteredTransactions 
      : transactions;
    
    setSummary(calculateCashflowSummary(transactionsToAnalyze));
  };

  const contextValue: CashflowContextType = {
    transactions,
    categories,
    subCategories,
    users,
    filteredTransactions,
    selectedMonth,
    selectedYear,
    selectedCategory,
    selectedType,
    summary,
    setSelectedMonth,
    setSelectedYear,
    setSelectedCategory,
    setSelectedType,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getUserById,
    filterTransactions,
    calculateSummary
  };

  return (
    <CashflowContext.Provider value={contextValue}>
      {children}
    </CashflowContext.Provider>
  );
};

export const useCashflow = (): CashflowContextType => {
  const context = useContext(CashflowContext);
  if (!context) {
    throw new Error('useCashflow must be used within a CashflowProvider');
  }
  return context;
};
