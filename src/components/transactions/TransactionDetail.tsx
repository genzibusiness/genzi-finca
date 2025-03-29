
import React from 'react';
import { useCashflow } from '@/context/CashflowContext';
import { Transaction } from '@/types/cashflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import StatusBadge from '@/components/StatusBadge';
import TypeBadge from '@/components/TypeBadge';

interface TransactionDetailProps {
  transaction: Transaction;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transaction }) => {
  const { getCategoryById, getSubCategoryById, getUserById } = useCashflow();
  
  const category = getCategoryById(transaction.categoryId);
  const subCategory = getSubCategoryById(transaction.subCategoryId);
  const user = getUserById(transaction.createdBy);
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div>{transaction.description}</div>
            <div>
              <CurrencyDisplay 
                amount={transaction.amount} 
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
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
              <p className="mt-1">{category?.name || 'Unknown'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Sub-Category</h3>
              <p className="mt-1">{subCategory?.name || 'Unknown'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
              <p className="mt-1">{user?.name || 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDetail;
