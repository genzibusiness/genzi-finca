
import React, { useState, useEffect } from 'react';
import { useCashflow } from '@/context/CashflowContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseType, TransactionType } from '@/types/cashflow';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardFilters = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
    categories,
    transactions,
  } = useCashflow();

  const [years, setYears] = useState<string[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const isMobile = useIsMobile();

  // Generate all months regardless of data
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  // Extract unique years from transactions
  useEffect(() => {
    // Ensure we have at least the current year in the list
    const currentYear = new Date().getFullYear().toString();
    
    // Get unique years from transactions
    const transactionYears = Array.from(
      new Set(transactions.map((t) => t.date.split('-')[0]))
    );
    
    // Combine current year with transaction years and remove duplicates
    const uniqueYears = Array.from(
      new Set([currentYear, ...transactionYears])
    ).sort((a, b) => b.localeCompare(a)); // Sort descending
    
    setYears(uniqueYears);

    // Fetch expense categories from the database
    fetchExpenseCategories();
  }, [transactions]);

  const fetchExpenseCategories = async () => {
    try {
      // Fetch unique categories from transactions
      const { data: categoryData } = await supabase
        .from('transactions')
        .select('expense_type')
        .not('expense_type', 'is', null);
      
      if (categoryData) {
        const uniqueCategories = Array.from(
          new Set(categoryData.map(item => item.expense_type))
        ).filter(Boolean) as string[];
        
        setExpenseCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching expense categories:', error);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    setSelectedCategory(null);
    setSelectedType(null);
  };

  const hasActiveFilters = selectedMonth || selectedYear || selectedCategory || selectedType;

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 sm:gap-3 flex-1 w-full">
          <Select
            value={selectedYear || 'all-years'}
            onValueChange={(value) => setSelectedYear(value !== 'all-years' ? value : null)}
          >
            <SelectTrigger className="w-full sm:w-[120px] h-8 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="text-xs sm:text-sm">
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
            <SelectTrigger className="w-full sm:w-[140px] h-8 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="text-xs sm:text-sm">
              <SelectItem value="all-months">All Months</SelectItem>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {isMobile ? monthNames[parseInt(month) - 1].substring(0, 3) : monthNames[parseInt(month) - 1]}
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
            <SelectTrigger className="w-full sm:w-[130px] h-8 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="text-xs sm:text-sm">
              <SelectItem value="all-types">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          {/* Only show categories filter when expense type is selected */}
          {(selectedType === 'expense') && (
            <Select
              value={selectedCategory || 'all-categories'}
              onValueChange={(value) => setSelectedCategory(value !== 'all-categories' ? value : null)}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="text-xs sm:text-sm max-h-52 overflow-y-auto">
                <SelectItem value="all-categories">All Categories</SelectItem>
                {expenseCategories.map((category) => (
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
            className="text-muted-foreground text-xs sm:text-sm py-1 h-8 sm:h-10"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardFilters;
