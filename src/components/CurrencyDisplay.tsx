
import React, { useEffect, useState } from 'react';
import { TransactionType } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/currencyUtils';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  type?: TransactionType;
  className?: string;
  showOriginal?: boolean;
  sgdAmount?: number | null;
  inrAmount?: number | null;
  usdAmount?: number | null;
  originalAmount?: number | null;
  originalCurrency?: string | null;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = 'INR',
  type,
  className = '',
  showOriginal = false,
  sgdAmount,
  inrAmount,
  usdAmount,
  originalAmount,
  originalCurrency,
}) => {
  const { preferences } = useUserPreferences();
  const [currencySymbols, setCurrencySymbols] = useState<Record<string, string>>({
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    SGD: 'S$'
  });
  const [loading, setLoading] = useState(false);

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
        }, {} as Record<string, string>);
        
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

  // Get the color class based on transaction type
  const getColorClass = () => {
    if (!type) return '';
    return type === 'income' ? 'text-emerald-600' : 'text-destructive';
  };

  const colorClass = getColorClass();
  
  // Get preferred currency and amount
  const preferredCurrency = preferences?.preferred_currency || 'INR';
  
  // Get the appropriate pre-calculated amount based on the preferred currency
  const getPreferredAmount = (): number | null => {
    if (preferredCurrency === currency) {
      return amount;
    }
    
    // Use pre-calculated amounts if available
    if (preferredCurrency === 'SGD' && sgdAmount !== null && sgdAmount !== undefined) {
      return sgdAmount;
    }
    
    if (preferredCurrency === 'INR' && inrAmount !== null && inrAmount !== undefined) {
      return inrAmount;
    }
    
    if (preferredCurrency === 'USD' && usdAmount !== null && usdAmount !== undefined) {
      return usdAmount;
    }
    
    // Fallback to original amount if no pre-calculated amount is available
    return amount;
  };
  
  const displayAmount = getPreferredAmount();
  
  // Display original amount if requested and it exists
  const shouldShowOriginal = showOriginal && 
    originalAmount !== null && 
    originalAmount !== undefined && 
    originalCurrency !== null && 
    originalCurrency !== undefined &&
    originalCurrency !== preferredCurrency;

  return (
    <span className={`font-medium ${colorClass} ${className}`}>
      {loading ? (
        <span className="animate-pulse">Loading...</span>
      ) : (
        <>
          {formatCurrency(displayAmount, preferredCurrency)}
          
          {shouldShowOriginal && (
            <span className="text-muted-foreground text-xs ml-1">
              (orig: {getSymbol(originalCurrency || '')}{originalAmount?.toFixed(2)})
            </span>
          )}
        </>
      )}
    </span>
  );
};

export default CurrencyDisplay;
