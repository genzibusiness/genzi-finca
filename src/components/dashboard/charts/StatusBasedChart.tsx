
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStatusBasedData } from '@/hooks/useStatusBasedData';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { Skeleton } from '@/components/ui/skeleton';

// Define custom colors for different statuses
const STATUS_COLORS = {
  income: {
    Paid: '#4ade80', // green-400
    Pending: '#facc15', // yellow-400
    Cancelled: '#f87171', // red-400
    Planned: '#60a5fa', // blue-400
  },
  expense: {
    Paid: '#f87171', // red-400
    Pending: '#facc15', // yellow-400
    Cancelled: '#4ade80', // green-400
    Planned: '#60a5fa', // blue-400
  }
};

// Custom tooltip content
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow-md border">
        <p className="font-medium">{data.status}</p>
        <p className="text-sm">
          <CurrencyDisplay amount={data.value} currency={data.currency} />
        </p>
      </div>
    );
  }
  return null;
};

const StatusBasedChart = () => {
  const { statusData, isLoading, error } = useStatusBasedData();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-destructive">Failed to load data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {statusData.income.length > 0 && (
              <Pie
                data={statusData.income}
                cx="30%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="status"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.income.map((entry, index) => (
                  <Cell 
                    key={`income-cell-${index}`} 
                    fill={STATUS_COLORS.income[entry.status] || '#CBD5E1'} 
                  />
                ))}
              </Pie>
            )}
            
            {statusData.expense.length > 0 && (
              <Pie
                data={statusData.expense}
                cx="70%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="status"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.expense.map((entry, index) => (
                  <Cell 
                    key={`expense-cell-${index}`} 
                    fill={STATUS_COLORS.expense[entry.status] || '#CBD5E1'} 
                  />
                ))}
              </Pie>
            )}
            
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value) => (
                <span className="text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-around text-sm text-center mt-4">
          <div>
            <p className="font-medium">Income by Status</p>
          </div>
          <div>
            <p className="font-medium">Expense by Status</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusBasedChart;
