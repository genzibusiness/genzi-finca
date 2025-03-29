
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Transaction, TransactionType } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import TypeBadge from '@/components/TypeBadge';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';

interface TransactionListProps {
  showSubCategory?: boolean;
  showCreatedBy?: boolean;
  selectedMonth?: string | null;
  selectedYear?: string | null;
  selectedCategory?: string | null;
  filterType?: TransactionType | null;
}

const TransactionList: React.FC<TransactionListProps> = ({
  showSubCategory = false,
  showCreatedBy = false,
  selectedMonth = null,
  selectedYear = null,
  selectedCategory = null,
  filterType = null,
}) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, selectedYear, selectedCategory, filterType]);
  
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      // Apply filters if provided
      if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        
        query = query.gte('date', startDate).lte('date', endDate);
      }
      
      if (selectedMonth) {
        const year = selectedYear || new Date().getFullYear();
        const startDate = `${year}-${selectedMonth}-01`;
        
        // Calculate end date based on month
        const nextMonth = parseInt(selectedMonth) === 12 ? 1 : parseInt(selectedMonth) + 1;
        const nextYear = parseInt(selectedMonth) === 12 ? parseInt(year) + 1 : year;
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        query = query.gte('date', startDate).lt('date', endDate);
      }
      
      if (filterType) {
        query = query.eq('type', filterType as any);
      }
      
      if (selectedCategory) {
        query = query.eq('expense_type', selectedCategory as any);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('Fetched transactions:', data);
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setError(error.message || 'Failed to load transactions');
      toast.error('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRowClick = (id: string) => {
    navigate(`/transactions/${id}`);
  };
  
  return (
    <>
      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchTransactions}>Retry</Button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">No transactions found</p>
          <Button onClick={() => navigate('/transactions/new')}>
            Add Transaction
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                {showSubCategory && <TableHead>Category</TableHead>}
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comment</TableHead>
                {showCreatedBy && <TableHead>Created By</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(transaction.id)}
                >
                  <TableCell>
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={transaction.type} />
                  </TableCell>
                  {showSubCategory && (
                    <TableCell>
                      {transaction.expense_type || '-'}
                    </TableCell>
                  )}
                  <TableCell>
                    <CurrencyDisplay 
                      amount={transaction.amount} 
                      currency={transaction.currency}
                      type={transaction.type}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transaction.comment || '-'}
                  </TableCell>
                  {showCreatedBy && (
                    <TableCell>User</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default TransactionList;
