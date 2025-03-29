
import React, { useState, useEffect } from 'react';
import { TransactionType, CurrencyType } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';

interface CurrencyDisplayProps {
  amount: number;
  type?: TransactionType;
  currency?: CurrencyType;
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  type,
  currency = 'INR', // Default to INR instead of USD
  className = ""
}) => {
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹'); // Default to ₹

  useEffect(() => {
    const fetchCurrencySymbol = async () => {
      try {
        const { data, error } = await supabase
          .from('currencies')
          .select('symbol')
          .eq('code', currency)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setCurrencySymbol(data.symbol);
        }
      } catch (error) {
        console.error('Error fetching currency symbol:', error);
      }
    };
    
    fetchCurrencySymbol();
  }, [currency]);

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
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
      {currencySymbol}{formattedAmount}
    </span>
  );
};

export default CurrencyDisplay;
