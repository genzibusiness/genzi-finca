
import React from 'react';
import { format } from 'date-fns';
import { Transaction } from '@/types/cashflow';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import TypeBadge from '@/components/TypeBadge';
import StatusBadge from '@/components/StatusBadge';
import SortableColumnHeader from './SortableColumnHeader';

interface TransactionTableProps {
  transactions: Transaction[];
  showSubCategory: boolean;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  filters: {[key: string]: string};
  onSort: (column: string) => void;
  onFilter: (column: string, value: string) => void;
  onClearFilter: (column: string) => void;
  onRowClick: (id: string) => void;
  validTransactionTypes: string[];
  validTransactionStatuses: string[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  showSubCategory,
  sortColumn,
  sortDirection,
  filters,
  onSort,
  onFilter,
  onClearFilter,
  onRowClick,
  validTransactionTypes,
  validTransactionStatuses,
}) => {
  const hasActiveFilter = (column: string) => {
    return filters[column] && filters[column].trim() !== '';
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableColumnHeader
              title="Date"
              column="date"
              currentSortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              filterValue={filters.date || ''}
              hasActiveFilter={hasActiveFilter('date')}
              onFilter={onFilter}
              onClearFilter={onClearFilter}
              filterHint="Enter date (YYYY-MM-DD), year (YYYY), or month (YYYY-MM)"
              filterWidth="w-80"
            />
            
            {showSubCategory && (
              <SortableColumnHeader
                title="Category"
                column="expense_type"
                currentSortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={onSort}
                filterValue={filters.expense_type || ''}
                hasActiveFilter={hasActiveFilter('expense_type')}
                onFilter={onFilter}
                onClearFilter={onClearFilter}
              />
            )}
            
            <SortableColumnHeader
              title="Type"
              column="type"
              currentSortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              filterValue={filters.type || ''}
              hasActiveFilter={hasActiveFilter('type')}
              onFilter={onFilter}
              onClearFilter={onClearFilter}
              filterOptions={validTransactionTypes.map(type => ({
                value: type,
                label: type.charAt(0).toUpperCase() + type.slice(1)
              }))}
            />
            
            <SortableColumnHeader
              title="Amount"
              column="amount"
              currentSortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              filterValue={filters.amount || ''}
              hasActiveFilter={hasActiveFilter('amount')}
              onFilter={onFilter}
              onClearFilter={onClearFilter}
              filterHint="Enter exact value, or use > or < for ranges"
            />
            
            <SortableColumnHeader
              title="Status"
              column="status"
              currentSortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              filterValue={filters.status || ''}
              hasActiveFilter={hasActiveFilter('status')}
              onFilter={onFilter}
              onClearFilter={onClearFilter}
              filterOptions={validTransactionStatuses.map(status => ({
                value: status,
                label: status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
              }))}
            />
            
            <SortableColumnHeader
              title="Comment"
              column="comment"
              currentSortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              filterValue={filters.comment || ''}
              hasActiveFilter={hasActiveFilter('comment')}
              onFilter={onFilter}
              onClearFilter={onClearFilter}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow 
              key={transaction.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(transaction.id)}
            >
              <TableCell>
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </TableCell>
              
              {showSubCategory && (
                <TableCell>
                  {transaction.expense_type || '-'}
                </TableCell>
              )}
              
              <TableCell>
                <TypeBadge type={transaction.type} />
              </TableCell>
              
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
  );
};

export default TransactionTable;
