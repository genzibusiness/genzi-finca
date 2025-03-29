
import React from 'react';
import { useCashflow } from '@/context/CashflowContext';
import TopExpensesChart from './charts/TopExpensesChart';
import MonthlyCashFlowChart from './charts/MonthlyCashFlowChart';
import StatusBasedChart from './charts/StatusBasedChart';

const DashboardCharts = () => {
  const { selectedMonth, selectedYear, selectedCategory, selectedType } = useCashflow();

  return (
    <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-2">
      <TopExpensesChart 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
      />
      
      <MonthlyCashFlowChart 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
      />

      <StatusBasedChart 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
      />
    </div>
  );
};

export default DashboardCharts;
