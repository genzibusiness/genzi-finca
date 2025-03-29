
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  Transaction, 
  Category, 
  SubCategory, 
  User, 
  TransactionType, 
  CashflowSummary 
} from '@/types/cashflow';
import { mockCategories, mockSubCategories, mockTransactions, mockUsers } from '@/lib/data';
import { toast } from "sonner";

interface CashflowContextType {
  transactions: Transaction[];
  categories: Category[];
  subCategories: SubCategory[];
  users: User[];
  filteredTransactions: Transaction[];
  selectedMonth: string | null;
  selectedYear: string | null;
  selectedCategory: string | null;
  selectedType: TransactionType | null;
  summary: CashflowSummary;
  setSelectedMonth: (month: string | null) => void;
  setSelectedYear: (year: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedType: (type: TransactionType | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  getUserById: (id: string) => User | undefined;
  filterTransactions: () => void;
  calculateSummary: () => void;
}

const CashflowContext = createContext<CashflowContextType | undefined>(undefined);

const STORAGE_KEY = 'cashflow-data';

export const CashflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null);
  const [summary, setSummary] = useState<CashflowSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netCashflow: 0,
    byCategory: [],
    byMonth: []
  });

  // Initialize data from localStorage or mock data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
      try {
        const { transactions, categories, subCategories, users } = JSON.parse(savedData);
        setTransactions(transactions);
        setCategories(categories);
        setSubCategories(subCategories);
        setUsers(users);
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

  // Initialize with mock data
  const initializeMockData = () => {
    setTransactions(mockTransactions);
    setCategories(mockCategories);
    setSubCategories(mockSubCategories);
    setUsers(mockUsers);
  };

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        transactions,
        categories,
        subCategories,
        users
      }));
    }
  }, [transactions, categories, subCategories, users]);

  // Apply filters and calculate summary whenever data or filters change
  useEffect(() => {
    filterTransactions();
    calculateSummary();
  }, [transactions, selectedMonth, selectedYear, selectedCategory, selectedType]);

  // Filter transactions based on selected filters
  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (selectedMonth) {
      filtered = filtered.filter(transaction => {
        const transactionMonth = transaction.date.split('-')[1];
        return transactionMonth === selectedMonth;
      });
    }
    
    if (selectedYear) {
      filtered = filtered.filter(transaction => {
        const transactionYear = transaction.date.split('-')[0];
        return transactionYear === selectedYear;
      });
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(transaction => 
        transaction.expense_type === selectedCategory
      );
    }
    
    if (selectedType) {
      filtered = filtered.filter(transaction => 
        transaction.type === selectedType
      );
    }
    
    setFilteredTransactions(filtered);
  };

  // Calculate summary for dashboard
  const calculateSummary = () => {
    const transactionsToAnalyze = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    
    const totalIncome = transactionsToAnalyze
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactionsToAnalyze
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Summarize by expense type
    const byCategory = [];
    
    // Group income transactions
    const totalIncomeByType = {
      categoryId: 'income',
      categoryName: 'Income',
      amount: totalIncome,
      type: 'income' as TransactionType
    };
    
    if (totalIncome > 0) {
      byCategory.push(totalIncomeByType);
    }
    
    // Group expense transactions by expense_type
    const expenseTypeMap = new Map<string, number>();
    
    transactionsToAnalyze
      .filter(t => t.type === 'expense' && t.expense_type)
      .forEach(transaction => {
        const expenseType = transaction.expense_type || 'Other';
        const currentAmount = expenseTypeMap.get(expenseType) || 0;
        expenseTypeMap.set(expenseType, currentAmount + transaction.amount);
      });
    
    expenseTypeMap.forEach((amount, expenseType) => {
      byCategory.push({
        categoryId: expenseType,
        categoryName: expenseType,
        amount,
        type: 'expense' as TransactionType
      });
    });

    // Summarize by month
    const monthMap = new Map<string, {income: number, expense: number}>();
    
    transactionsToAnalyze.forEach(transaction => {
      const month = transaction.date.substring(0, 7); // YYYY-MM
      const existing = monthMap.get(month) || {income: 0, expense: 0};
      
      if (transaction.type === 'income') {
        existing.income += transaction.amount;
      } else {
        existing.expense += transaction.amount;
      }
      
      monthMap.set(month, existing);
    });
    
    const byMonth = Array.from(monthMap.entries())
      .map(([month, values]) => ({
        month,
        income: values.income,
        expense: values.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    setSummary({
      totalIncome,
      totalExpenses,
      netCashflow: totalIncome - totalExpenses,
      byCategory,
      byMonth
    });
  };

  // CRUD operations for transactions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `trans${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    toast.success('Transaction added successfully');
  };

  const updateTransaction = (transaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === transaction.id ? {
        ...transaction,
        updated_at: new Date().toISOString()
      } : t)
    );
    toast.success('Transaction updated successfully');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transaction deleted successfully');
  };

  // Helper functions to get entities by ID
  const getTransactionById = (id: string) => 
    transactions.find(t => t.id === id);

  const getUserById = (id: string) => 
    users.find(u => u.id === id);

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
