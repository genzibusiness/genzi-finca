
import { 
  Transaction, 
  Category, 
  SubCategory, 
  User, 
  TransactionType, 
  CashflowSummary 
} from '@/types/cashflow';

export interface CashflowContextType {
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
