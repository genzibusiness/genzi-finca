
import React from 'react';
import { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { ArrowUpDown, Edit, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import TypeBadge from '@/components/TypeBadge';
import StatusBadge from '@/components/StatusBadge';

// Import the corrected hook
import { useTransactionListData } from '@/hooks/useTransactionListData';
import { TransactionType, TransactionStatus } from '@/types/cashflow';

interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  currency: string;
  expense_type: string | null;
  comment: string | null;
  status: TransactionStatus;
}

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

  useEffect(() => {
    if (transactions) {
      // Ensure the data is properly typed when setting state
      const typedTransactions = transactions.map(transaction => ({
        ...transaction,
        // Cast the string values to their respective union types
        type: transaction.type as TransactionType,
        status: transaction.status as TransactionStatus
      }));
      setData(typedTransactions);
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
      header: 'Type',
      cell: ({ row }) => {
        return <TypeBadge type={row.original.type} />;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
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
      header: 'Currency',
    },
    {
      accessorKey: 'expense_type',
      header: 'Expense Type',
    },
    {
      accessorKey: 'comment',
      header: 'Comment',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const transaction = row.original;

        const handleEdit = () => {
          navigate(`/transactions/${transaction.id}`);
        };

        const handleDelete = async () => {
          try {
            await deleteTransaction(transaction.id);
            toast.success('Transaction deleted successfully');
          } catch (error: any) {
            toast.error(error.message || 'Failed to delete transaction');
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionList;
