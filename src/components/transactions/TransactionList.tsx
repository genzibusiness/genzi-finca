
import React from 'react';
import { useCashflow } from '@/context/CashflowContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import StatusBadge from '@/components/StatusBadge';
import TypeBadge from '@/components/TypeBadge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface TransactionListProps {
  showCategory?: boolean;
  showSubCategory?: boolean;
  showCreatedBy?: boolean;
  filterType?: 'income' | 'expense';
}

const TransactionList: React.FC<TransactionListProps> = ({
  showCategory = true,
  showSubCategory = false,
  showCreatedBy = false,
  filterType,
}) => {
  const { 
    filteredTransactions, 
    getCategoryById, 
    getSubCategoryById,
    getUserById,
  } = useCashflow();
  const navigate = useNavigate();
  
  const transactions = filterType 
    ? filteredTransactions.filter(t => t.type === filterType)
    : filteredTransactions;
  
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              {showCategory && <TableHead>Category</TableHead>}
              {showSubCategory && <TableHead>Sub-Category</TableHead>}
              <TableHead>Status</TableHead>
              {!filterType && <TableHead>Type</TableHead>}
              {showCreatedBy && <TableHead>Created By</TableHead>}
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow 
                key={transaction.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/transactions/${transaction.id}`)}
              >
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                {showCategory && (
                  <TableCell>
                    {getCategoryById(transaction.categoryId)?.name || 'Unknown'}
                  </TableCell>
                )}
                {showSubCategory && (
                  <TableCell>
                    {getSubCategoryById(transaction.subCategoryId)?.name || 'Unknown'}
                  </TableCell>
                )}
                <TableCell>
                  <StatusBadge status={transaction.status} />
                </TableCell>
                {!filterType && (
                  <TableCell>
                    <TypeBadge type={transaction.type} />
                  </TableCell>
                )}
                {showCreatedBy && (
                  <TableCell>
                    {getUserById(transaction.createdBy)?.name || 'Unknown'}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <CurrencyDisplay amount={transaction.amount} type={transaction.type} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {transactions.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No transactions found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
