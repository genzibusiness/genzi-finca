
export type TransactionStatus = "paid" | "received" | "yet_to_be_paid" | "yet_to_be_received";

export type TransactionType = "income" | "expense";

export type CurrencyType = "SGD" | "INR" | "USD" | "EUR" | "GBP";

export type ExpenseType = "Salary" | "Marketing" | "Services" | "Software" | "Other" | string;

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
  date: string; // YYYY-MM-DD
  type: TransactionType;
  currency: CurrencyType;
  expense_type?: ExpenseType | null;
  comment?: string | null;
  user_id: string;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
  document_url?: string | null;
  includes_tax?: boolean | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
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

export interface Currency {
  id: string;
  code: CurrencyType;
  name: string;
  symbol: string;
  active: boolean;
}

export interface ExpenseTypeItem {
  id: string;
  name: string;
  active: boolean;
}

export interface TransactionTypeItem {
  id: string;
  name: string;
  active: boolean;
}

export interface TransactionStatusItem {
  id: string;
  name: string;
  type: string;
  active: boolean;
}

export interface CurrencyRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}
