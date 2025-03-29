
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCashflow } from '@/context/CashflowContext';
import { BarChart, LineChart, ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Line } from 'recharts';

const DashboardCharts = () => {
  const { summary } = useCashflow();
  
  // Prepare data for the category chart
  const categoryData = summary.byCategory
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5) // Top 5 categories
    .map((item) => ({
      name: item.categoryName,
      amount: item.amount,
      type: item.type,
    }));

  // Prepare data for the monthly chart
  const monthlyData = summary.byMonth.map((item) => ({
    name: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    income: item.income,
    expense: item.expense,
    net: item.income - item.expense,
  }));

  return (
    <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="amount" 
                name="Amount" 
                fill={(data, index) => {
                  const item = categoryData[index];
                  return item.type === 'income' ? '#059669' : '#e11d48';
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Income" 
                stroke="#059669" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name="Expense" 
                stroke="#e11d48" 
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                name="Net" 
                stroke="#0ea5e9" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
