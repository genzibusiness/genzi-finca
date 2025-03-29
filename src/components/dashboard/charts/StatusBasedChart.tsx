
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStatusBasedData } from '@/hooks/useStatusBasedData';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { Skeleton } from '@/components/ui/skeleton';

// Define custom colors for different statuses with improved colors
const STATUS_COLORS = {
  income: {
    Paid: '#10b981', // emerald-500
    Pending: '#f59e0b', // amber-500
    Cancelled: '#ef4444', // red-500
    Planned: '#3b82f6', // blue-500
    Received: '#059669', // emerald-600
    yet_to_be_received: '#0d9488', // teal-600
  },
  expense: {
    Paid: '#ef4444', // red-500
    Pending: '#f59e0b', // amber-500
    Cancelled: '#10b981', // emerald-500
    Planned: '#3b82f6', // blue-500
    yet_to_be_paid: '#f97316', // orange-500
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
        {/* Add headers at the top */}
        <div className="flex justify-around text-sm font-medium mb-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-green-600">Income by Status</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-red-500">Expense by Status</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="80%">
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
      </CardContent>
    </Card>
  );
};

export default StatusBasedChart;
