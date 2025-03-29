
import React from 'react';
import { TransactionType } from '@/types/cashflow';

interface CurrencyDisplayProps {
  amount: number;
  type?: TransactionType;
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  type,
  className = ""
}) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const getColorClass = () => {
    if (type === 'income') return 'text-emerald-600';
    if (type === 'expense') return 'text-destructive';
    
    // No type provided, use amount to determine color (positive=green, negative=red)
    if (amount > 0) return 'text-emerald-600';
    if (amount < 0) return 'text-destructive';
    
    return ''; // Zero amount
  };

  return (
    <span className={`font-medium ${getColorClass()} ${className}`}>
      {type === 'expense' && '-'}
      {formattedAmount}
    </span>
  );
};

export default CurrencyDisplay;
