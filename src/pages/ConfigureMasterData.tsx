
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExpenseTypeConfig from '@/components/configure/ExpenseTypeConfig';
import CurrencyConfig from '@/components/configure/CurrencyConfig';
import TransactionTypeConfig from '@/components/configure/TransactionTypeConfig';
import TransactionStatusConfig from '@/components/configure/TransactionStatusConfig';
import CurrencyRateConfig from '@/components/configure/CurrencyRateConfig';

const ConfigureMasterData = () => {
  const [activeTab, setActiveTab] = useState('transaction-types');
  
  return (
    <AppLayout>
      <div className="container max-w-7xl py-6">
        <PageHeader 
          title="Configure" 
          description="Manage application configuration and master data"
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="transaction-types">Transaction Types</TabsTrigger>
            <TabsTrigger value="expense-types">Expense Types</TabsTrigger>
            <TabsTrigger value="currencies">Currencies</TabsTrigger>
            <TabsTrigger value="statuses">Statuses</TabsTrigger>
            <TabsTrigger value="rates">Currency Rates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transaction-types">
            <TransactionTypeConfig />
          </TabsContent>
          
          <TabsContent value="expense-types">
            <ExpenseTypeConfig />
          </TabsContent>
          
          <TabsContent value="currencies">
            <CurrencyConfig />
          </TabsContent>
          
          <TabsContent value="statuses">
            <TransactionStatusConfig />
          </TabsContent>
          
          <TabsContent value="rates">
            <CurrencyRateConfig />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ConfigureMasterData;
