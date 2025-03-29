
export type TransactionStatus = "paid" | "received" | "yet_to_be_paid" | "yet_to_be_received";

export type TransactionType = "income" | "expense";

export type CurrencyType = "SGD" | "INR" | "USD" | "EUR" | "GBP";

// Define both types for compatibility - the specific enum values for Supabase
export type ExpenseTypeEnum = "Salary" | "Marketing" | "Services" | "Software" | "Other";
// And the string type for our UI which can handle any string
export type ExpenseType = string;

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
  payment_type_id?: string | null;
  paid_by_user_id?: string | null;
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

export interface PaymentTypeItem {
  id: string;
  name: string;
  active: boolean;
}

export interface CurrencyRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}
