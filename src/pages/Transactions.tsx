
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionList from '@/components/transactions/TransactionList';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionType } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';

const Transactions = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  
  // Generate all months regardless of data
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  
  useEffect(() => {
    fetchFilterOptions();
  }, []);
  
  const fetchFilterOptions = async () => {
    try {
      // Fetch unique categories
      const { data: categoryData } = await supabase
        .from('transactions')
        .select('expense_type')
        .not('expense_type', 'is', null);
      
      if (categoryData) {
        const uniqueCategories = Array.from(new Set(categoryData.map(item => item.expense_type)))
          .filter(Boolean) as string[];
        setCategories(uniqueCategories);
      }
      
      // Fetch date ranges for year filter
      const { data: dateData } = await supabase
        .from('transactions')
        .select('date')
        .order('date', { ascending: true });
      
      if (dateData) {
        // Extract unique years
        const uniqueYears = Array.from(new Set(dateData.map(item => item.date.split('-')[0])))
          .sort((a, b) => b.localeCompare(a)); // Newest first
        setYears(uniqueYears);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };
  
  const clearAllFilters = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    setSelectedCategory(null);
    setSelectedType(null);
  };
  
  const hasActiveFilters = selectedMonth || selectedYear || selectedCategory || selectedType;
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return (
    <AppLayout>
      <div className="container max-w-7xl py-6">
        <PageHeader 
          title="Transactions" 
          description="View and manage all transactions"
          action={{
            label: "Add Transaction",
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: () => navigate('/transactions/new')
          }}
        />
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex flex-wrap gap-3 flex-1">
                <Select
                  value={selectedYear || 'all-years'}
                  onValueChange={(value) => setSelectedYear(value !== 'all-years' ? value : null)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-years">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedMonth || 'all-months'}
                  onValueChange={(value) => setSelectedMonth(value !== 'all-months' ? value : null)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-months">All Months</SelectItem>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {monthNames[parseInt(month) - 1]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedType || 'all-types'}
                  onValueChange={(value) => {
                    setSelectedType(value !== 'all-types' ? value as TransactionType : null);
                    // Reset category filter if switching away from expense type
                    if (value !== 'expense' && selectedCategory) {
                      setSelectedCategory(null);
                    }
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>

                {/* Only show categories filter when expense type is selected */}
                {selectedType === 'expense' && (
                  <Select
                    value={selectedCategory || 'all-categories'}
                    onValueChange={(value) => setSelectedCategory(value !== 'all-categories' ? value : null)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <TransactionList 
          showSubCategory 
          showCreatedBy 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedCategory={selectedCategory}
          filterType={selectedType}
        />
      </div>
    </AppLayout>
  );
};

export default Transactions;
