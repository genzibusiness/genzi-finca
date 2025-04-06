
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CurrencyRate {
  from_currency: string;
  to_currency: string;
  rate: number;
}

interface UseCurrencyConvertorProps {
  currencyRates: CurrencyRate[];
  defaultCurrency: string;
  form: any;
}

export const useCurrencyConvertor = ({ 
  currencyRates, 
  defaultCurrency,
  form
}: UseCurrencyConvertorProps) => {
  
  // Function to calculate currency conversion without prompting the user
  const calculateCurrencyAmounts = (amount: number, currency: string): {
    sgd_amount: number | null;
    inr_amount: number | null;
    usd_amount: number | null;
  } => {
    // Default all to null
    let sgdAmount: number | null = null;
    let inrAmount: number | null = null;
    let usdAmount: number | null = null;
    
    // Set the amount for the original currency
    if (currency === 'SGD') sgdAmount = amount;
    if (currency === 'INR') inrAmount = amount;
    if (currency === 'USD') usdAmount = amount;
    
    // Find all direct conversion rates first
    const sgdToInr = currencyRates.find(rate => rate.from_currency === 'SGD' && rate.to_currency === 'INR')?.rate;
    const sgdToUsd = currencyRates.find(rate => rate.from_currency === 'SGD' && rate.to_currency === 'USD')?.rate;
    const inrToSgd = currencyRates.find(rate => rate.from_currency === 'INR' && rate.to_currency === 'SGD')?.rate;
    const inrToUsd = currencyRates.find(rate => rate.from_currency === 'INR' && rate.to_currency === 'USD')?.rate;
    const usdToSgd = currencyRates.find(rate => rate.from_currency === 'USD' && rate.to_currency === 'SGD')?.rate;
    const usdToInr = currencyRates.find(rate => rate.from_currency === 'USD' && rate.to_currency === 'INR')?.rate;
    
    // Calculate based on original currency
    if (currency === 'SGD') {
      // SGD to others
      if (sgdToInr) inrAmount = amount * sgdToInr;
      if (sgdToUsd) usdAmount = amount * sgdToUsd;
    } 
    else if (currency === 'INR') {
      // INR to others
      if (inrToSgd) sgdAmount = amount * inrToSgd;
      if (inrToUsd) usdAmount = amount * inrToUsd;
      // If direct conversion not available, use SGD as intermediary
      else if (inrToSgd && sgdToUsd) usdAmount = (amount * inrToSgd) * sgdToUsd;
    } 
    else if (currency === 'USD') {
      // USD to others
      if (usdToSgd) sgdAmount = amount * usdToSgd;
      if (usdToInr) inrAmount = amount * usdToInr;
      // If direct conversion not available, use SGD as intermediary
      else if (usdToSgd && sgdToInr) inrAmount = (amount * usdToSgd) * sgdToInr;
    } 
    else {
      // For other currencies, try to convert to SGD first, then others
      const toSgd = currencyRates.find(rate => rate.from_currency === currency && rate.to_currency === 'SGD');
      if (toSgd) {
        sgdAmount = amount * toSgd.rate;
        
        // Then convert SGD to others
        if (sgdAmount !== null) {
          if (sgdToInr) inrAmount = sgdAmount * sgdToInr;
          if (sgdToUsd) usdAmount = sgdAmount * sgdToUsd;
        }
      } else {
        // Try other paths or skip if no conversion found
        console.warn(`No conversion path found for ${currency} to standard currencies`);
      }
    }
    
    // Round amounts to 2 decimal places to avoid floating point issues
    if (sgdAmount !== null) sgdAmount = Math.round(sgdAmount * 100) / 100;
    if (inrAmount !== null) inrAmount = Math.round(inrAmount * 100) / 100;
    if (usdAmount !== null) usdAmount = Math.round(usdAmount * 100) / 100;
    
    return {
      sgd_amount: sgdAmount,
      inr_amount: inrAmount,
      usd_amount: usdAmount
    };
  };
  
  return { calculateCurrencyAmounts };
};

export default useCurrencyConvertor;
