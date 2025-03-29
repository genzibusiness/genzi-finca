
import React, { useEffect, useState } from 'react';
import { TransactionType } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';

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
  const [currencySymbols, setCurrencySymbols] = useState<Record<string, string>>({
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    SGD: 'S$'
  });

  useEffect(() => {
    fetchCurrencySymbols();
  }, []);

  const fetchCurrencySymbols = async () => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('code, symbol');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const symbols = data.reduce((acc, curr) => {
          acc[curr.code] = curr.symbol;
          return acc;
        }, {});
        
        setCurrencySymbols(prev => ({
          ...prev,
          ...symbols
        }));
      }
    } catch (error) {
      console.error('Error fetching currency symbols:', error);
    }
  };

  // Get currency symbol based on currency code
  const getSymbol = (code: string) => {
    return currencySymbols[code] || code;
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

  const symbol = getSymbol(currency);
  const formattedAmount = formatAmount(amount);
  const colorClass = getColorClass();

  return (
    <span className={`font-medium ${colorClass} ${className}`}>
      {symbol}{formattedAmount}
    </span>
  );
};

export default CurrencyDisplay;
