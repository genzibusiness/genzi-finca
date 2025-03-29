
import React from 'react';
import { Transaction } from '@/types/cashflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import StatusBadge from '@/components/StatusBadge';
import TypeBadge from '@/components/TypeBadge';

interface TransactionDetailProps {
  transaction: Transaction;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transaction }) => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div>{transaction.comment || 'Transaction'}</div>
            <div>
              <CurrencyDisplay 
                amount={transaction.amount} 
                currency={transaction.currency}
                type={transaction.type} 
                className="text-xl"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
              <div className="mt-1">
                <TypeBadge type={transaction.type} />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="mt-1">
                <StatusBadge status={transaction.status} />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
              <p className="mt-1">
                {new Date(transaction.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            {transaction.expense_type && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Expense Type</h3>
                <p className="mt-1">{transaction.expense_type}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Currency</h3>
              <p className="mt-1">{transaction.currency}</p>
            </div>
            
            {transaction.comment && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Comment</h3>
                <p className="mt-1">{transaction.comment}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
              <p className="mt-1">
                {new Date(transaction.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDetail;
