
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useExpenseCategoriesData } from '@/hooks/useExpenseCategoriesData';

interface TopExpensesChartProps {
  selectedMonth: string | null;
  selectedYear: string | null;
  selectedCategory: string | null;
  selectedType: string | null;
}

const TopExpensesChart: React.FC<TopExpensesChartProps> = ({ 
  selectedMonth, 
  selectedYear, 
  selectedCategory, 
  selectedType 
}) => {
  const { categoryData, loading, defaultCurrency, defaultSymbol } = useExpenseCategoriesData(
    selectedMonth,
    selectedYear,
    selectedCategory,
    selectedType
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Expense Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Expense Categories</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {categoryData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No expense categories data available with current filters</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${defaultSymbol}${value.toLocaleString()}`, 'Amount']}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="amount" 
                name={`Amount (${defaultCurrency})`} 
                fillOpacity={0.8}
                fill="#059669"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TopExpensesChart;
