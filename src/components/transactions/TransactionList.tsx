
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
import { Transaction, TransactionType, ExpenseType } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import TypeBadge from '@/components/TypeBadge';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface TransactionListProps {
  showSubCategory?: boolean;
  showCreatedBy?: boolean;
  selectedMonth?: string | null;
  selectedYear?: string | null;
  selectedCategory?: string | null;
  filterType?: TransactionType | null;
}

type SortColumn = 'date' | 'type' | 'amount' | 'status' | 'comment' | 'expense_type';
type SortDirection = 'asc' | 'desc';

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
  
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<{[key: string]: string}>({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  useEffect(() => {
    fetchTransactions();
    
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions' 
      }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMonth, selectedYear, selectedCategory, filterType, sortColumn, sortDirection, currentPage, pageSize, filters]);
  
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let countQuery = supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });
      
      let query = supabase
        .from('transactions')
        .select('*')
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      
      if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        
        query = query.gte('date', startDate).lte('date', endDate);
        countQuery = countQuery.gte('date', startDate).lte('date', endDate);
      }
      
      if (selectedMonth) {
        const year = selectedYear || new Date().getFullYear();
        const startDate = `${year}-${selectedMonth}-01`;
        
        const nextMonth = parseInt(selectedMonth) === 12 ? 1 : parseInt(selectedMonth) + 1;
        const nextYear = parseInt(selectedMonth) === 12 ? parseInt(year.toString()) + 1 : year;
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        query = query.gte('date', startDate).lt('date', endDate);
        countQuery = countQuery.gte('date', startDate).lt('date', endDate);
      }
      
      if (filterType) {
        query = query.eq('type', filterType);
        countQuery = countQuery.eq('type', filterType);
      }
      
      if (selectedCategory) {
        // Fix: Check if selectedCategory is a valid ExpenseType before using it
        const validExpenseTypes: ExpenseType[] = ["Salary", "Marketing", "Services", "Software", "Other"];
        if (validExpenseTypes.includes(selectedCategory as ExpenseType)) {
          query = query.eq('expense_type', selectedCategory as ExpenseType);
          countQuery = countQuery.eq('expense_type', selectedCategory as ExpenseType);
        }
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          if (key === 'date') {
            query = query.like(key, `%${value}%`);
            countQuery = countQuery.like(key, `%${value}%`);
          } else if (key === 'amount') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              query = query.eq(key, numValue);
              countQuery = countQuery.eq(key, numValue);
            }
          } else {
            query = query.ilike(key, `%${value}%`);
            countQuery = countQuery.ilike(key, `%${value}%`);
          }
        }
      });
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / pageSize));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setError(error.message || 'Failed to load transactions');
      toast.error('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  
  const handleFilter = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1);
  };
  
  const handleRowClick = (id: string) => {
    navigate(`/transactions/${id}`);
  };
  
  const handlePageChange = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };
  
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages > 1) {
      if (totalPages <= maxVisiblePages) {
        for (let i = 2; i <= totalPages; i++) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                isActive={currentPage === i}
                onClick={() => handlePageChange(i)}
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      } else {
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);
        
        if (currentPage <= 2) {
          endPage = 3;
        } else if (currentPage >= totalPages - 1) {
          startPage = totalPages - 2;
        }
        
        if (startPage > 2) {
          items.push(
            <PaginationItem key="ellipsis-start">
              {/* Fix: Use PaginationEllipsis instead of disabled PaginationLink */}
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
        
        for (let i = startPage; i <= endPage; i++) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                isActive={currentPage === i}
                onClick={() => handlePageChange(i)}
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
        
        if (endPage < totalPages - 1) {
          items.push(
            <PaginationItem key="ellipsis-end">
              {/* Fix: Use PaginationEllipsis instead of disabled PaginationLink */}
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
        
        if (totalPages > 1) {
          items.push(
            <PaginationItem key="last">
              <PaginationLink
                isActive={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          );
        }
      }
    }
    
    return items;
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
        <div className="space-y-4">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        Date
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSort('date')}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          <span className="sr-only">Sort by date</span>
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Filter date</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2">
                          <Input
                            placeholder="Filter by date..."
                            value={filters.date || ''}
                            onChange={(e) => handleFilter('date', e.target.value)}
                            className="mb-2"
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        Type
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSort('type')}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          <span className="sr-only">Sort by type</span>
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Filter type</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2">
                          <DropdownMenuItem onClick={() => handleFilter('type', '')}>All</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFilter('type', 'income')}>Income</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFilter('type', 'expense')}>Expense</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  
                  {showSubCategory && (
                    <TableHead>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          Category
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSort('expense_type')}
                          >
                            <ArrowUpDown className="h-4 w-4" />
                            <span className="sr-only">Sort by category</span>
                          </Button>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ChevronDown className="h-4 w-4" />
                              <span className="sr-only">Filter category</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56 p-2">
                            <Input
                              placeholder="Filter by category..."
                              value={filters.expense_type || ''}
                              onChange={(e) => handleFilter('expense_type', e.target.value)}
                              className="mb-2"
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableHead>
                  )}
                  
                  <TableHead>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        Amount
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSort('amount')}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          <span className="sr-only">Sort by amount</span>
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Filter amount</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2">
                          <Input
                            placeholder="Filter by amount..."
                            value={filters.amount || ''}
                            onChange={(e) => handleFilter('amount', e.target.value)}
                            className="mb-2"
                            type="number"
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  
                  <TableHead>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        Status
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSort('status')}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          <span className="sr-only">Sort by status</span>
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Filter status</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2">
                          <DropdownMenuItem onClick={() => handleFilter('status', '')}>All</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFilter('status', 'paid')}>Paid</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFilter('status', 'yet_to_be_paid')}>Yet to be paid</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFilter('status', 'received')}>Received</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFilter('status', 'yet_to_be_received')}>Yet to be received</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  
                  <TableHead>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        Comment
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSort('comment')}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          <span className="sr-only">Sort by comment</span>
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Filter comment</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2">
                          <Input
                            placeholder="Filter by comment..."
                            value={filters.comment || ''}
                            onChange={(e) => handleFilter('comment', e.target.value)}
                            className="mb-2"
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {getPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TransactionList;
