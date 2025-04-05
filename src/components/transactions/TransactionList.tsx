import React from 'react';
import { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Edit, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import TypeBadge from '@/components/TypeBadge';
import StatusBadge from '@/components/StatusBadge';
import TablePagination from '@/components/transactions/table/TablePagination';

import { useTransactionListData } from '@/hooks/useTransactionListData';
import { Transaction, TransactionType, TransactionStatus, CurrencyType, ExpenseType } from '@/types/cashflow';

interface TransactionListProps {
  showSubCategory?: boolean;
  showCreatedBy?: boolean;
  selectedMonth?: string | null;
  selectedYear?: string | null;
  selectedCategory?: string | null;
  filterType?: string | null;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  showSubCategory = false,
  showCreatedBy = false,
  selectedMonth = null,
  selectedYear = null,
  selectedCategory = null,
  filterType = null
}) => {
  const navigate = useNavigate();
  const { transactions, isLoading, error, deleteTransaction } = useTransactionListData({
    showSubCategory,
    showCreatedBy,
    selectedMonth,
    selectedYear,
    selectedCategory,
    filterType
  });
  const [data, setData] = useState<Transaction[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    if (transactions) {
      setData(transactions);
    }
  }, [transactions]);

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <TypeBadge type={row.original.type} />;
      },
      filterFn: 'equals',
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <CurrencyDisplay 
            amount={row.original.amount} 
            currency={row.original.currency}
            type={row.original.type}
          />
        );
      },
    },
    {
      accessorKey: 'currency',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Currency
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'expense_type',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Expense Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      filterFn: 'equals',
    },
    {
      accessorKey: 'comment',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Comment
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />;
      },
      filterFn: 'equals',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const transaction = row.original;

        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          navigate(`/transactions/${transaction.id}`);
        };

        const handleDelete = async (e: React.MouseEvent) => {
          e.stopPropagation();
          try {
            await deleteTransaction(transaction.id);
            toast.success('Transaction deleted successfully');
          } catch (error: any) {
            toast.error(error.message || 'Failed to delete transaction');
          }
        };

        return (
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8" title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 text-red-500" title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  useEffect(() => {
    table.setPageSize(10);
  }, [table]);

  if (isLoading) {
    return <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Loading transactions...</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Loading...</p>
      </CardContent>
    </Card>;
  }

  if (error) {
    return <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Error loading transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Error: {error.message}</p>
      </CardContent>
    </Card>;
  }

  return (
    <div className="container max-w-7xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Here are your transactions. Click on a row to view more details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-row={JSON.stringify(row.original)}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/transactions/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {table.getRowModel().rows?.length > 0 && (
            <TablePagination
              currentPage={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              totalCount={data.length}
              pageSize={table.getState().pagination.pageSize}
              onPageChange={(page) => table.setPageIndex(page - 1)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionList;
