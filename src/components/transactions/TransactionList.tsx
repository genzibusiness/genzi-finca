
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
import { format, isValid, parse } from 'date-fns';
import { Transaction, TransactionType, ExpenseType, TransactionStatus } from '@/types/cashflow';
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
  
  const validTransactionTypes: TransactionType[] = ["income", "expense"];
  const validTransactionStatuses: TransactionStatus[] = ["paid", "received", "yet_to_be_paid", "yet_to_be_received"];
  
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
        const validExpenseTypes: ExpenseType[] = ["Salary", "Marketing", "Services", "Software", "Other"];
        if (validExpenseTypes.includes(selectedCategory as ExpenseType)) {
          query = query.eq('expense_type', selectedCategory as ExpenseType);
          countQuery = countQuery.eq('expense_type', selectedCategory as ExpenseType);
        }
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          if (key === 'date') {
            const dateValue = value.trim();
            try {
              const dateMatch = dateValue.match(/^\d{4}-\d{2}-\d{2}$/);
              if (dateMatch) {
                query = query.eq(key, dateValue);
                countQuery = countQuery.eq(key, dateValue);
              } else {
                if (dateValue.match(/^\d{4}-\d{2}$/)) {
                  const yearMonth = dateValue.split('-');
                  const year = yearMonth[0];
                  const month = yearMonth[1];
                  const startDate = `${year}-${month}-01`;
                  
                  const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
                  const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
                  const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
                  
                  query = query.gte(key, startDate).lt(key, endDate);
                  countQuery = countQuery.gte(key, startDate).lt(key, endDate);
                } else if (dateValue.match(/^\d{4}$/)) {
                  const year = dateValue;
                  const startDate = `${year}-01-01`;
                  const endDate = `${year}-12-31`;
                  
                  query = query.gte(key, startDate).lte(key, endDate);
                  countQuery = countQuery.gte(key, startDate).lte(key, endDate);
                } else {
                  const dateFormats = [
                    'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 
                    'MMM d, yyyy', 'MMMM d, yyyy', 'MMM yyyy', 'MMMM yyyy'
                  ];
                  
                  let parsedDate = null;
                  
                  for (const format of dateFormats) {
                    const attemptParse = parse(dateValue, format, new Date());
                    if (isValid(attemptParse)) {
                      parsedDate = format(attemptParse, 'yyyy-MM-dd');
                      break;
                    }
                  }
                  
                  if (parsedDate) {
                    query = query.eq(key, parsedDate);
                    countQuery = countQuery.eq(key, parsedDate);
                  } else {
                    query = query.filter(`${key}::text`, 'ilike', `%${dateValue}%`);
                    countQuery = countQuery.filter(`${key}::text`, 'ilike', `%${dateValue}%`);
                  }
                }
              }
            } catch (error) {
              console.error("Date filter error:", error);
              query = query.filter(`${key}::text`, 'ilike', `%${dateValue}%`);
              countQuery = countQuery.filter(`${key}::text`, 'ilike', `%${dateValue}%`);
            }
          } else if (key === 'amount') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              query = query.eq(key, numValue);
              countQuery = countQuery.eq(key, numValue);
            } else if (value.includes('>')) {
              const thresh = parseFloat(value.replace('>', '').trim());
              if (!isNaN(thresh)) {
                query = query.gt(key, thresh);
                countQuery = countQuery.gt(key, thresh);
              }
            } else if (value.includes('<')) {
              const thresh = parseFloat(value.replace('<', '').trim());
              if (!isNaN(thresh)) {
                query = query.lt(key, thresh);
                countQuery = countQuery.lt(key, thresh);
              }
            } else {
              query = query.filter(`${key}::text`, 'ilike', `%${value}%`);
              countQuery = countQuery.filter(`${key}::text`, 'ilike', `%${value}%`);
            }
          } else if (key === 'type') {
            if (validTransactionTypes.includes(value as TransactionType)) {
              query = query.eq(key, value as TransactionType);
              countQuery = countQuery.eq(key, value as TransactionType);
            } else {
              // Fix: Use ilike instead of String object
              query = query.ilike(key, `%${value}%`);
              countQuery = countQuery.ilike(key, `%${value}%`);
            }
          } else if (key === 'status') {
            if (validTransactionStatuses.includes(value as TransactionStatus)) {
              query = query.eq(key, value as TransactionStatus);
              countQuery = countQuery.eq(key, value as TransactionStatus);
            } else {
              // Fix: Use ilike instead of String object
              query = query.ilike(key, `%${value}%`);
              countQuery = countQuery.ilike(key, `%${value}%`);
            }
          } else {
            // Fix: Use ilike for all other columns
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
  
  const clearFilter = (column: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
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
    
    if (totalPages <= 1) {
      return [];
    }
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }
    
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
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
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  const hasActiveFilter = (column: string) => {
    return filters[column] && filters[column].trim() !== '';
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
                          <Button 
                            variant={hasActiveFilter('date') ? "secondary" : "ghost"} 
                            size="sm" 
                            className="h-8 w-8 p-0 relative"
                          >
                            <ChevronDown className="h-4 w-4" />
                            {hasActiveFilter('date') && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
                            )}
                            <span className="sr-only">Filter date</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-80 p-2">
                          <div className="mb-2 text-sm text-muted-foreground">
                            Enter date (YYYY-MM-DD), year (YYYY), or month (YYYY-MM)
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Filter by date..."
                              value={filters.date || ''}
                              onChange={(e) => handleFilter('date', e.target.value)}
                              className="flex-1"
                            />
                            {hasActiveFilter('date') && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => clearFilter('date')}
                              >
                                Clear
                              </Button>
                            )}
                          </div>
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
                            <Button 
                              variant={hasActiveFilter('expense_type') ? "secondary" : "ghost"} 
                              size="sm" 
                              className="h-8 w-8 p-0 relative"
                            >
                              <ChevronDown className="h-4 w-4" />
                              {hasActiveFilter('expense_type') && (
                                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
                              )}
                              <span className="sr-only">Filter category</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56 p-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Filter by category..."
                                value={filters.expense_type || ''}
                                onChange={(e) => handleFilter('expense_type', e.target.value)}
                                className="flex-1"
                              />
                              {hasActiveFilter('expense_type') && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => clearFilter('expense_type')}
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableHead>
                  )}
                  
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
                          <Button 
                            variant={hasActiveFilter('type') ? "secondary" : "ghost"} 
                            size="sm" 
                            className="h-8 w-8 p-0 relative"
                          >
                            <ChevronDown className="h-4 w-4" />
                            {hasActiveFilter('type') && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
                            )}
                            <span className="sr-only">Filter type</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2">
                          <DropdownMenuItem onClick={() => clearFilter('type')}>All</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFilter('type', 'income')}>Income</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFilter('type', 'expense')}>Expense</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  
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
                          <Button 
                            variant={hasActiveFilter('amount') ? "secondary" : "ghost"} 
                            size="sm" 
                            className="h-8 w-8 p-0 relative"
                          >
                            <ChevronDown className="h-4 w-4" />
                            {hasActiveFilter('amount') && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
                            )}
                            <span className="sr-only">Filter amount</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2">
                          <div className="mb-2 text-sm text-muted-foreground">
                            Enter exact value, or use &gt; or &lt; for ranges
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Filter by amount..."
                              value={filters.amount || ''}
                              onChange={(e) => handleFilter('amount', e.target.value)}
                              className="flex-1"
                            />
                            {hasActiveFilter('amount') && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => clearFilter('amount')}
                              >
                                Clear
                              </Button>
                            )}
                          </div>
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
                          <Button 
                            variant={hasActiveFilter('status') ? "secondary" : "ghost"} 
                            size="sm" 
                            className="h-8 w-8 p-0 relative"
                          >
                            <ChevronDown className="h-4 w-4" />
                            {hasActiveFilter('status') && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
                            )}
                            <span className="sr-only">Filter status</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2">
                          <DropdownMenuItem onClick={() => clearFilter('status')}>All</DropdownMenuItem>
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
                          <Button 
                            variant={hasActiveFilter('comment') ? "secondary" : "ghost"} 
                            size="sm" 
                            className="h-8 w-8 p-0 relative"
                          >
                            <ChevronDown className="h-4 w-4" />
                            {hasActiveFilter('comment') && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
                            )}
                            <span className="sr-only">Filter comment</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Filter by comment..."
                              value={filters.comment || ''}
                              onChange={(e) => handleFilter('comment', e.target.value)}
                              className="flex-1"
                            />
                            {hasActiveFilter('comment') && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => clearFilter('comment')}
                              >
                                Clear
                              </Button>
                            )}
                          </div>
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
            <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
              <div className="text-sm text-muted-foreground order-2 md:order-1">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
              </div>
              
              <Pagination className="order-1 md:order-2">
                <PaginationContent className="flex-wrap">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {getPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      aria-disabled={currentPage === totalPages}
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
