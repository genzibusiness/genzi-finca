
import { useState } from 'react';
import { Transaction, User } from '@/types/cashflow';
import { toast } from 'sonner';
import { STORAGE_KEY } from '@/utils/cashflowUtils';

export const useTransactionOperations = (
  initialTransactions: Transaction[],
  initialUsers: User[]
) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [users] = useState<User[]>(initialUsers);

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

  // Save data to localStorage
  const saveToLocalStorage = (
    categories: any[],
    subCategories: any[]
  ) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      transactions,
      categories,
      subCategories,
      users
    }));
  };

  return {
    transactions,
    setTransactions,
    users,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getUserById,
    saveToLocalStorage
  };
};
