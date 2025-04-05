
import React, { useEffect, useState } from 'react';
import { TransactionType, CurrencyRate } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, getAmountInPreferredCurrency } from '@/utils/currencyUtils';
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
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrencySymbols();
    fetchCurrencyRates();
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

  const fetchCurrencyRates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('currency_rates')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setCurrencyRates(data as CurrencyRate[]);
      }
    } catch (error) {
      console.error('Error fetching currency rates:', error);
    } finally {
      setLoading(false);
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
  
  // Preferred currency display
  const preferredCurrency = preferences?.preferred_currency || 'INR';
  
  // Object to pass to conversion function with additional currency fields
  const transactionData = {
    amount,
    currency,
    sgd_amount: sgdAmount,
    inr_amount: inrAmount,
    usd_amount: usdAmount,
    original_amount: originalAmount,
    original_currency: originalCurrency
  };
  
  // Get converted amount in preferred currency
  const convertedAmount = getAmountInPreferredCurrency(
    transactionData,
    preferredCurrency,
    currencyRates
  );
  
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
          {formatCurrency(convertedAmount, preferredCurrency)}
          
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
