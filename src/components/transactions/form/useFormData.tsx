
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FormDataFields {
  expenseTypes: { id: string; name: string }[];
  statuses: { id: string; name: string; type: string; name_normalized: string }[];
  currencies: { id: string; code: string; name: string; symbol: string }[];
  paymentTypes: { id: string; name: string }[];
  users: { id: string; name: string }[];
  currencyRates: { from_currency: string; to_currency: string; rate: number }[];
  defaultCurrency: string;
}

export const useFormData = () => {
  const [formData, setFormData] = useState<FormDataFields>({
    expenseTypes: [],
    statuses: [],
    currencies: [],
    paymentTypes: [],
    users: [],
    currencyRates: [],
    defaultCurrency: 'INR'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching form data');
        
        // Fetch expense types
        const { data: expenseTypesData, error: expenseTypesError } = await supabase
          .from('expense_types')
          .select('id, name')
          .eq('active', true);
        
        if (expenseTypesError) {
          console.error('Error fetching expense types:', expenseTypesError);
          throw expenseTypesError;
        }
        
        // Fetch transaction statuses
        const { data: statusesData, error: statusesError } = await supabase
          .from('transaction_statuses')
          .select('id, name, type')
          .eq('active', true);
        
        if (statusesError) {
          console.error('Error fetching statuses:', statusesError);
          throw statusesError;
        }
        
        // Fetch currencies
        const { data: currenciesData, error: currenciesError } = await supabase
          .from('currencies')
          .select('id, code, name, symbol')
          .eq('active', true);
        
        if (currenciesError) {
          console.error('Error fetching currencies:', currenciesError);
          throw currenciesError;
        }
        
        // Fetch payment types
        const { data: paymentTypesData, error: paymentTypesError } = await supabase
          .from('payment_types')
          .select('id, name')
          .eq('active', true);
        
        if (paymentTypesError) {
          console.error('Error fetching payment types:', paymentTypesError);
          throw paymentTypesError;
        }
        
        // Fetch users from profiles table
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, name');
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
          throw usersError;
        }
        
        // Fetch currency rates
        const { data: ratesData, error: ratesError } = await supabase
          .from('currency_rates')
          .select('from_currency, to_currency, rate');
        
        if (ratesError) {
          console.error('Error fetching currency rates:', ratesError);
          throw ratesError;
        }
        
        // Fetch default currency
        const { data: defaultCurrencyData, error: defaultCurrencyError } = await supabase
          .from('currencies')
          .select('code')
          .eq('is_default', true)
          .single();
        
        if (defaultCurrencyError && defaultCurrencyError.code !== 'PGRST116') {
          console.error('Error fetching default currency:', defaultCurrencyError);
          throw defaultCurrencyError;
        }
        
        // Process and transform status names
        const normalizedStatuses = statusesData.map(status => ({
          ...status,
          name_normalized: status.name.toLowerCase().replace(/\s+/g, '_')
        }));
        
        // Set the form data
        setFormData({
          expenseTypes: expenseTypesData || [],
          statuses: normalizedStatuses || [],
          currencies: currenciesData || [],
          paymentTypes: paymentTypesData || [],
          users: usersData || [],
          currencyRates: ratesData || [],
          defaultCurrency: defaultCurrencyData?.code || 'INR'
        });
        
        console.log('Form data fetched successfully');
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load form data'));
        toast.error('Failed to load form data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return { ...formData, isLoading, error };
};

export default useFormData;
