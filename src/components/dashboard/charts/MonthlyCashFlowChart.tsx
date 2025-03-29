
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, ResponsiveContainer, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useMonthlyCashFlowData } from '@/hooks/useMonthlyCashFlowData';

interface MonthlyCashFlowChartProps {
  selectedMonth: string | null;
  selectedYear: string | null;
  selectedCategory: string | null;
  selectedType: string | null;
}

const MonthlyCashFlowChart: React.FC<MonthlyCashFlowChartProps> = ({ 
  selectedMonth, 
  selectedYear, 
  selectedCategory, 
  selectedType 
}) => {
  const { monthlyData, loading, defaultCurrency, defaultSymbol } = useMonthlyCashFlowData(
    selectedMonth,
    selectedYear,
    selectedCategory,
    selectedType
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow</CardTitle>
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
        <CardTitle>Monthly Cash Flow</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {monthlyData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No monthly data available with current filters</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${defaultSymbol}${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                name={`Income (${defaultCurrency})`} 
                stroke="#059669" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name={`Expense (${defaultCurrency})`} 
                stroke="#e11d48" 
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                name={`Net (${defaultCurrency})`} 
                stroke="#0ea5e9" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyCashFlowChart;
