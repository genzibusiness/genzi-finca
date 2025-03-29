
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, LineChart, ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Line } from 'recharts';
import { useCashflow } from '@/context/CashflowContext';

const DashboardCharts = () => {
  const { selectedMonth, selectedYear, selectedCategory, selectedType } = useCashflow();
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [defaultSymbol, setDefaultSymbol] = useState('₹');

  useEffect(() => {
    fetchDefaultCurrency();
    processChartData();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions' 
      }, () => {
        processChartData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMonth, selectedYear, selectedCategory, selectedType]);

  const fetchDefaultCurrency = async () => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('code, symbol')
        .eq('is_default', true)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code when no rows are returned
        throw error;
      }
      
      if (data) {
        setDefaultCurrency(data.code);
        setDefaultSymbol(data.symbol);
      }
    } catch (error) {
      console.error('Error fetching default currency:', error);
    }
  };

  const processChartData = async () => {
    try {
      setLoading(true);
      
      // Build query with filters
      let query = supabase.from('transactions').select('*');
      
      if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }
      
      if (selectedMonth) {
        const year = selectedYear || new Date().getFullYear();
        const startDate = `${year}-${selectedMonth}-01`;
        
        // Calculate end date based on month
        const nextMonth = parseInt(selectedMonth) === 12 ? 1 : parseInt(selectedMonth) + 1;
        const nextYear = parseInt(selectedMonth) === 12 ? parseInt(year.toString()) + 1 : year;
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        query = query.gte('date', startDate).lt('date', endDate);
      }
      
      if (selectedType) {
        query = query.eq('type', selectedType);
      }
      
      if (selectedCategory) {
        query = query.eq('expense_type', selectedCategory);
      }
      
      const { data: transactions, error } = await query;
      
      if (error) throw error;
      
      // Process category data for expenses
      const categoryMap = new Map();
      
      (transactions || [])
        .filter(transaction => transaction.type === 'expense')
        .forEach(transaction => {
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
      
      (transactions || []).forEach(transaction => {
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
      console.error('Error processing chart data:', error);
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
    </div>
  );
};

export default DashboardCharts;
