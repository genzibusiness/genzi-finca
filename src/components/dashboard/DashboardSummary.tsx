
import React from 'react';
import { ArrowDown, ArrowUp, PiggyBank } from 'lucide-react';
import { useCashflow } from '@/context/CashflowContext';
import { useSummaryData } from '@/hooks/useSummaryData';
import SummaryCard from './SummaryCard';
import { getSubtitleText } from '@/utils/dashboardUtils';

const DashboardSummary = () => {
  const { 
    selectedMonth, 
    selectedYear, 
    selectedCategory, 
    selectedType 
  } = useCashflow();

  const { summary, loading, defaultCurrency } = useSummaryData(
    selectedMonth,
    selectedYear,
    selectedCategory,
    selectedType
  );
  
  // Generate subtitle text based on current filters
  const subtitleText = getSubtitleText(
    selectedYear,
    selectedMonth,
    selectedCategory,
    selectedType
  );
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <SummaryCard
        title="Total Income"
        amount={summary.totalIncome}
        subtitle={`${subtitleText} Income`}
        loading={loading}
        icon={ArrowUp}
        iconColor="text-emerald-500"
        currency={defaultCurrency}
        type="income"
      />
      
      <SummaryCard
        title="Total Expenses"
        amount={summary.totalExpenses}
        subtitle={`${subtitleText} Expenses`}
        loading={loading}
        icon={ArrowDown}
        iconColor="text-destructive"
        currency={defaultCurrency}
        type="expense"
      />
      
      <SummaryCard
        title="Net Cashflow"
        amount={summary.netCashflow}
        subtitle={`${subtitleText} Net`}
        loading={loading}
        icon={PiggyBank}
        currency={defaultCurrency}
      />
    </div>
  );
};

export default DashboardSummary;
