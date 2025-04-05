
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Loader2 } from 'lucide-react';

const UserSettings = () => {
  const navigate = useNavigate();
  const { preferences, loading, error, updatePreferredCurrency } = useUserPreferences();
  const [selectedCurrency, setSelectedCurrency] = useState<'SGD' | 'INR'>(
    preferences?.preferred_currency || 'INR'
  );
  const [saving, setSaving] = useState(false);

  // Update state when preferences load
  React.useEffect(() => {
    if (preferences?.preferred_currency) {
      setSelectedCurrency(preferences.preferred_currency);
    }
  }, [preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updatePreferredCurrency(selectedCurrency);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="container px-4 sm:px-6 max-w-4xl py-4 sm:py-6">
        <PageHeader
          title="User Settings"
          description="Configure your application preferences"
          action={{
            label: "Back to Dashboard",
            onClick: () => navigate('/dashboard')
          }}
        />

        {loading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Settings</CardTitle>
              <CardDescription>
                Could not load your user settings. Please try again later.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to view your financial data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preferred Currency</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the currency you want to use for viewing your transactions and reports.
                  </p>
                  <RadioGroup
                    value={selectedCurrency}
                    onValueChange={(value) => setSelectedCurrency(value as 'SGD' | 'INR')}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="INR" id="inr" />
                      <Label htmlFor="inr" className="cursor-pointer flex-1">
                        <div className="font-medium">Indian Rupee (₹)</div>
                        <p className="text-sm text-muted-foreground">View all amounts in INR</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="SGD" id="sgd" />
                      <Label htmlFor="sgd" className="cursor-pointer flex-1">
                        <div className="font-medium">Singapore Dollar (S$)</div>
                        <p className="text-sm text-muted-foreground">View all amounts in SGD</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving || preferences?.preferred_currency === selectedCurrency}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </AppLayout>
  );
};

export default UserSettings;
