// Replace the incorrect import
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, Edit, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Fix by importing the correct function
import { useTransactionListData } from '@/hooks/useTransactionListData';

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  currency: string;
  expense_type: string | null;
  comment: string | null;
  status: string;
}

const TransactionList = () => {
  const navigate = useNavigate();
  const { transactions, isLoading, error, deleteTransaction } = useTransactionListData();
  const [data, setData] = useState<Transaction[]>([]);

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
      header: 'Type',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
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
