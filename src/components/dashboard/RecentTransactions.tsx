
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useCashflow } from '@/context/CashflowContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import StatusBadge from '@/components/StatusBadge';
import TypeBadge from '@/components/TypeBadge';
import { useNavigate } from 'react-router-dom';

const RecentTransactions = () => {
  const { transactions, getUserById } = useCashflow();
  const navigate = useNavigate();
  
  // Get the 5 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest 5 transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow 
                key={transaction.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/transactions/${transaction.id}`)}
              >
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell className="font-medium">{transaction.comment || 'Transaction'}</TableCell>
                <TableCell>
                  <TypeBadge type={transaction.type} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={transaction.status} />
                </TableCell>
                <TableCell className="text-right">
                  <CurrencyDisplay amount={transaction.amount} type={transaction.type} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {recentTransactions.length === 0 && (
          <div className="py-6 text-center text-muted-foreground">
            No recent transactions found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
