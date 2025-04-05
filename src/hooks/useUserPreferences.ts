
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserPreference } from '@/types/cashflow';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
    } else {
      setPreferences(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the properly typed supabase client
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        // If the error is because no rows were returned, create default preferences
        if (error.code === 'PGRST116') {
          return createDefaultPreferences();
        }
        throw error;
      }

      setPreferences(data as UserPreference);
    } catch (err: any) {
      console.error('Error fetching user preferences:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      // Create default preferences with the correct types
      const defaultPreferences = {
        user_id: user.id,
        preferred_currency: 'INR' as const
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .insert([defaultPreferences])
        .select()
        .single();

      if (error) throw error;

      setPreferences(data as UserPreference);
    } catch (err: any) {
      console.error('Error creating default preferences:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferredCurrency = async (currency: 'SGD' | 'INR') => {
    if (!user || !preferences) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ preferred_currency: currency })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data as UserPreference);
      toast.success(`Preferred currency updated to ${currency}`);
    } catch (err: any) {
      console.error('Error updating preferred currency:', err);
      setError(err);
      toast.error('Failed to update preferred currency');
    } finally {
      setLoading(false);
    }
  };

  return {
    preferences,
    loading,
    error,
    updatePreferredCurrency,
    refreshPreferences: fetchUserPreferences
  };
}
