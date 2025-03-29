
import React from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Download, Upload } from 'lucide-react';
import { useCashflow } from '@/context/CashflowContext';
import { toast } from 'sonner';

const Settings = () => {
  const { transactions, categories, subCategories, users } = useCashflow();
  
  const handleExportData = () => {
    const data = {
      transactions,
      categories,
      subCategories,
      users,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashflow-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };
  
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (!data.transactions || !data.categories || !data.subCategories || !data.users) {
            throw new Error('Invalid data format');
          }
          
          localStorage.setItem('cashflow-data', JSON.stringify({
            transactions: data.transactions,
            categories: data.categories,
            subCategories: data.subCategories,
            users: data.users
          }));
          
          toast.success('Data imported successfully. Please refresh the page.');
        } catch (error) {
          toast.error('Failed to import data. Invalid format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.removeItem('cashflow-data');
      toast.success('Data reset successfully. Please refresh the page.');
    }
  };
  
  return (
    <AppLayout>
      <div className="container max-w-3xl py-6">
        <PageHeader 
          title="Settings" 
          description="Manage your cashflow application settings"
        />
        
        <div className="space-y-6">
          {/* Data Management section remains on top */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or import your cashflow data for backup or migration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download all your cashflow data as a JSON file
                  </p>
                </div>
                <Button onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Import Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and replace your current data with a backup file
                  </p>
                </div>
                <Button onClick={handleImportData} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="w-full flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-destructive">Reset Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Delete all your cashflow data and start fresh
                  </p>
                </div>
                <Button onClick={handleResetData} variant="destructive">
                  Reset All Data
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Moved About Finca to the top */}
              <div>
                <h3 className="font-medium">About Finca</h3>
                <p className="text-sm text-muted-foreground">
                  Finca is a comprehensive financial management application designed specifically for small and medium businesses. 
                  It enables businesses to efficiently track income and expenses, monitor cashflow, generate financial reports, 
                  and gain valuable insights into their financial health. With Finca, businesses can make data-driven decisions, 
                  identify spending patterns, forecast future financial needs, and maintain better control over their finances.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Key Features</h3>
                <ul className="text-sm text-muted-foreground list-disc ml-5 mt-2">
                  <li>Comprehensive income and expense tracking</li>
                  <li>Real-time cashflow monitoring</li>
                  <li>Financial reporting and data export</li>
                  <li>AI-powered financial analysis and predictions</li>
                  <li>Multi-currency support</li>
                  <li>Expense categorization</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Data Storage</h3>
                <p className="text-sm text-muted-foreground">
                  All data is currently stored in tables thru Supabase connectivity.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Version</h3>
                <p className="text-sm text-muted-foreground">1.0.0</p>
              </div>
              
              <div>
                <h3 className="font-medium">Created By</h3>
                <p className="text-sm text-muted-foreground">Genzi Finca for Small Startups</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
