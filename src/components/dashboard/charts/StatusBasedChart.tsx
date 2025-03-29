
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatusBasedData } from '@/hooks/useStatusBasedData';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { getSubtitleText } from '@/utils/dashboardUtils';

interface StatusBasedChartProps {
  selectedMonth: string | null;
  selectedYear: string | null;
  selectedCategory: string | null;
  selectedType: string | null;
}

const StatusBasedChart = ({ 
  selectedMonth, 
  selectedYear,
  selectedCategory,
  selectedType
}: StatusBasedChartProps) => {
  const { statusData, loading, defaultCurrency, defaultSymbol } = useStatusBasedData(
    selectedMonth,
    selectedYear,
    selectedCategory,
    selectedType
  );

  const subtitle = getSubtitleText(selectedYear, selectedMonth, selectedCategory, selectedType);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-1/2" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/3" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income & Expenses by Status</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {statusData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available for the selected period
          </div>
        ) : (
          <ChartContainer 
            config={{ 
              income: { color: '#10b981' }, 
              expense: { color: '#ef4444' } 
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={statusData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  content={(props) => (
                    <ChartTooltipContent 
                      {...props} 
                      formatter={(value, name) => (
                        <CurrencyDisplay 
                          amount={value as number} 
                          currency={defaultCurrency}
                          symbol={defaultSymbol}
                        />
                      )}
                    />
                  )}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusBasedChart;
