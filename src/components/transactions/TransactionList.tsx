
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import StatusBadge from '@/components/StatusBadge';
import TypeBadge from '@/components/TypeBadge';
import { Transaction, TransactionType } from '@/types/cashflow';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface TransactionListProps {
  showSubCategory?: boolean;
  showCreatedBy?: boolean;
  limit?: number;
  filterType?: TransactionType;
  selectedMonth?: string | null;
  selectedYear?: string | null;
  selectedCategory?: string | null;
}

const TransactionList: React.FC<TransactionListProps> = ({
  showSubCategory = false,
  showCreatedBy = false,
  limit,
  filterType,
  selectedMonth,
  selectedYear,
  selectedCategory,
}) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [limit, filterType, selectedMonth, selectedYear, selectedCategory, currentPage]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Count total rows for pagination
      let countQuery = supabase
        .from('transactions')
        .select('id', { count: 'exact' });
      
      // Apply filters to count query
      if (filterType) {
        countQuery = countQuery.eq('type', filterType);
      }
      
      if (selectedMonth) {
        countQuery = countQuery.ilike('date', `%-${selectedMonth}-%`);
      }
      
      if (selectedYear) {
        countQuery = countQuery.ilike('date', `${selectedYear}-%`);
      }
      
      if (selectedCategory) {
        countQuery = countQuery.eq('expense_type', selectedCategory);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      
      // Main query for data
      let query = supabase
        .from('transactions')
        .select('*, profiles(name)')
        .order('date', { ascending: false });

      // Apply the same filters to main query
      if (filterType) {
        query = query.eq('type', filterType);
      }
      
      if (selectedMonth) {
        query = query.ilike('date', `%-${selectedMonth}-%`);
      }
      
      if (selectedYear) {
        query = query.ilike('date', `${selectedYear}-%`);
      }
      
      if (selectedCategory) {
        query = query.eq('expense_type', selectedCategory);
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      if (limit) {
        query = query.limit(limit);
      } else {
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setTransactions(data as Transaction[]);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted successfully');
      
      // Refresh counts and pagination
      fetchTransactions();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error(error.message || 'Failed to delete transaction');
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate array of page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are less than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page, last page, and some pages around current page
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = 4;
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('ellipsis');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // Add last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">No transactions found</p>
            <Button onClick={() => navigate('/transactions/new')}>Add Transaction</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={transaction.type} />
                  </TableCell>
                  <TableCell>
                    <CurrencyDisplay 
                      amount={transaction.amount} 
                      type={transaction.type}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transaction.comment || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(`/transactions/${transaction.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => confirmDelete(transaction.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination - only show if not limited and has multiple pages */}
      {!limit && totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            {/* Previous button */}
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {/* Page numbers */}
            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis' ? (
                  <div className="flex h-9 w-9 items-center justify-center">...</div>
                ) : (
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => handlePageChange(page as number)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            {/* Next button */}
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction record.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)} 
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransactionList;
