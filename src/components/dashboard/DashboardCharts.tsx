
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MonthlyCashFlowChart from './charts/MonthlyCashFlowChart';
import TopExpensesChart from './charts/TopExpensesChart';
import StatusBasedChart from './charts/StatusBasedChart';
import { TransactionType } from '@/types/cashflow';

interface DashboardChartsProps {
  selectedMonth: string;
  selectedYear: string;
  selectedCategory: string;
  selectedType: TransactionType;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  selectedMonth,
  selectedYear,
  selectedCategory,
  selectedType
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Monthly Cashflow</CardTitle>
          <CardDescription>Income and expenses for the current year</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyCashFlowChart />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Expenses</CardTitle>
          <CardDescription>Biggest expense categories</CardDescription>
        </CardHeader>
        <CardContent>
          <TopExpensesChart />
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Transactions by Status</CardTitle>
          <CardDescription>Income and expense by transaction status</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBasedChart 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedCategory={selectedCategory}
            selectedType={selectedType}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
