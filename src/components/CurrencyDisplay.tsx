
import React from 'react';
import { TransactionType } from '@/types/cashflow';

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  type?: TransactionType;
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = 'INR',
  type,
  className = '',
}) => {
  // Define currency symbols
  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'INR':
        return '₹';
      case 'SGD':
        return 'S$';
      default:
        return '₹'; // Default to INR symbol
    }
  };

  // Format the amount with commas and decimal places
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Get the color class based on transaction type
  const getColorClass = () => {
    if (!type) return '';
    return type === 'income' ? 'text-emerald-600' : 'text-destructive';
  };

  const symbol = getCurrencySymbol(currency);
  const formattedAmount = formatAmount(amount);
  const colorClass = getColorClass();

  return (
    <span className={`font-medium ${colorClass} ${className}`}>
      {symbol}{formattedAmount}
    </span>
  );
};

export default CurrencyDisplay;
