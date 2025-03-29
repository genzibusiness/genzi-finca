
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TransactionType } from '@/types/cashflow';

interface TypeBadgeProps {
  type: TransactionType;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  return (
    <Badge 
      variant={type === 'income' ? 'default' : 'destructive'}
      className={`${type === 'income' ? 'bg-emerald-600' : ''}`}
    >
      {type === 'income' ? 'Income' : 'Expense'}
    </Badge>
  );
};

export default TypeBadge;
