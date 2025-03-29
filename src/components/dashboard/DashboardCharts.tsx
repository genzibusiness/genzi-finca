import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, LineChart, ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Line } from 'recharts';

const DashboardCharts = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      // Fetch all transactions for processing
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Process category data
      const categoryMap = new Map();
      
      transactions.forEach(transaction => {
        const category = transaction.expense_type || 'Other';
        const existingAmount = categoryMap.get(category) || 0;
        categoryMap.set(category, existingAmount + Number(transaction.amount));
      });
      
      const processedCategoryData = Array.from(categoryMap.entries())
        .map(([name, amount]) => ({
          name,
          amount,
          fill: '#059669'
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Top 5 categories
      
      setCategoryData(processedCategoryData);
      
      // Process monthly data
      const monthMap = new Map();
      
      transactions.forEach(transaction => {
        const month = transaction.date.substring(0, 7); // YYYY-MM format
        if (!monthMap.has(month)) {
          monthMap.set(month, { income: 0, expense: 0 });
        }
        
        const monthData = monthMap.get(month);
        if (transaction.type === 'income') {
          monthData.income += Number(transaction.amount);
        } else {
          monthData.expense += Number(transaction.amount);
        }
        
        monthMap.set(month, monthData);
      });
      
      const processedMonthlyData = Array.from(monthMap.entries())
        .map(([month, data]) => ({
          name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          income: data.income,
          expense: data.expense,
          net: data.income - data.expense,
          // Keep the original month string for sorting
          sortKey: month
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
      
      setMonthlyData(processedMonthlyData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </CardContent>
      </Card>
    </div>;
  }

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
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="amount" 
                name="Amount" 
                fillOpacity={0.8}
                fill="#059669"
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
                formatter={(value) => [`₹${value.toLocaleString()}`, '']}
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
