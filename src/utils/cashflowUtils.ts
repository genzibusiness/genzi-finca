
import { Transaction, CashflowSummary, TransactionType } from '@/types/cashflow';

// Storage key for localStorage
export const STORAGE_KEY = 'cashflow-data';

// Filter transactions based on selected filters
export const filterTransactionsByFilters = (
  transactions: Transaction[],
  selectedMonth: string | null,
  selectedYear: string | null,
  selectedCategory: string | null,
  selectedType: TransactionType | null
): Transaction[] => {
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
  
  return filtered;
};

// Calculate summary for dashboard
export const calculateCashflowSummary = (
  transactions: Transaction[]
): CashflowSummary => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
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
  
  transactions
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
  
  transactions.forEach(transaction => {
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

  return {
    totalIncome,
    totalExpenses,
    netCashflow: totalIncome - totalExpenses,
    byCategory,
    byMonth
  };
};
