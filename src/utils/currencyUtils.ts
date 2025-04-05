
import { CurrencyRate } from '@/types/cashflow';

// Convert amount from one currency to another
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: CurrencyRate[]
): number | null => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Find the direct conversion rate
  const directRate = rates.find(
    rate => rate.from_currency === fromCurrency && rate.to_currency === toCurrency
  );

  if (directRate) {
    return amount * directRate.rate;
  }

  // Find the inverse conversion rate
  const inverseRate = rates.find(
    rate => rate.from_currency === toCurrency && rate.to_currency === fromCurrency
  );

  if (inverseRate) {
    return amount / inverseRate.rate;
  }

  // If we need to go through SGD as an intermediate currency
  const fromToSGD = rates.find(
    rate => rate.from_currency === fromCurrency && rate.to_currency === 'SGD'
  );

  const sgdToTarget = rates.find(
    rate => rate.from_currency === 'SGD' && rate.to_currency === toCurrency
  );

  if (fromToSGD && sgdToTarget) {
    const amountInSGD = amount * fromToSGD.rate;
    return amountInSGD * sgdToTarget.rate;
  }

  // If we still couldn't find a conversion path
  console.error(`No conversion rate found for ${fromCurrency} to ${toCurrency}`);
  return null;
};

// Format currency display based on currency code
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string,
  options: Intl.NumberFormatOptions = {}
): string => {
  if (amount === null || amount === undefined) {
    return '-';
  }

  // Define currency-specific formatting options
  const currencyOptions: Record<string, Intl.NumberFormatOptions> = {
    INR: {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    },
    SGD: {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    },
    USD: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    }
  };

  // Use currency-specific options or default to a simple format
  const formattingOptions = currencyOptions[currency] || {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  };

  return new Intl.NumberFormat('en-US', formattingOptions).format(amount);
};

// Get amount in preferred currency (handling conversion if needed)
export const getAmountInPreferredCurrency = (
  transaction: {
    amount: number;
    currency: string;
    sgd_amount?: number | null;
    inr_amount?: number | null;
    usd_amount?: number | null;
    original_amount?: number | null;
    original_currency?: string | null;
  },
  preferredCurrency: string,
  rates: CurrencyRate[]
): number | null => {
  // If transaction is already in preferred currency, return the amount
  if (transaction.currency === preferredCurrency) {
    return transaction.amount;
  }

  // If preferred currency is one of the stored amounts, use it directly
  if (preferredCurrency === 'SGD' && transaction.sgd_amount !== null && transaction.sgd_amount !== undefined) {
    return transaction.sgd_amount;
  }
  
  if (preferredCurrency === 'INR' && transaction.inr_amount !== null && transaction.inr_amount !== undefined) {
    return transaction.inr_amount;
  }
  
  if (preferredCurrency === 'USD' && transaction.usd_amount !== null && transaction.usd_amount !== undefined) {
    return transaction.usd_amount;
  }

  // Try to convert from transaction currency to preferred currency
  return convertCurrency(transaction.amount, transaction.currency, preferredCurrency, rates);
};
