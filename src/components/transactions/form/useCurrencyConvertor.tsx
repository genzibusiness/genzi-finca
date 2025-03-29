
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
  
  const applyConversionRate = (selectedCurrency: string) => {
    if (selectedCurrency === 'SGD' && defaultCurrency && defaultCurrency !== 'SGD') {
      const conversionRate = currencyRates.find(
        rate => rate.from_currency === 'SGD' && rate.to_currency === defaultCurrency
      );
      
      if (conversionRate) {
        const currentAmount = form.getValues('amount');
        const convertedAmount = currentAmount * conversionRate.rate;
        console.log(`Converting ${currentAmount} SGD to ${convertedAmount} ${defaultCurrency} (rate: ${conversionRate.rate})`);
        
        // Ask the user if they want to apply the conversion
        const confirmConversion = window.confirm(
          `Do you want to convert ${currentAmount} SGD to ${convertedAmount.toFixed(2)} ${defaultCurrency}?`
        );
        
        if (confirmConversion) {
          form.setValue('amount', Number(convertedAmount.toFixed(2)));
          form.setValue('currency', defaultCurrency);
          toast.success(`Converted amount from SGD to ${defaultCurrency}`);
        }
      } else {
        console.log(`No conversion rate found for SGD to ${defaultCurrency}`);
      }
    }
  };
  
  return { applyConversionRate };
};

export default useCurrencyConvertor;
