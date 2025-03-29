
export type TransactionStatus = 'pending' | 'done' | 'cancelled' | 'recurring';

export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  categoryId: string;
  subCategoryId: string;
  status: TransactionStatus;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
}

export interface CashflowSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
    type: TransactionType;
  }[];
  byMonth: {
    month: string;
    income: number;
    expense: number;
  }[];
}
