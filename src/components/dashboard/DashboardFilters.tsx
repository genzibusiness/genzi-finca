
import React from 'react';
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

  // Extract unique years and months from transactions
  const uniqueYears = Array.from(
    new Set(transactions.map((t) => t.date.split('-')[0]))
  ).sort((a, b) => b.localeCompare(a)); // Sort descending

  const uniqueMonths = Array.from(
    new Set(transactions.map((t) => t.date.split('-')[1]))
  ).sort();

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
    <div className="mb-6">
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
              {uniqueYears.map((year) => (
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
              {uniqueMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {monthNames[parseInt(month) - 1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedType || 'all-types'}
            onValueChange={(value) => setSelectedType(value !== 'all-types' ? value as any : null)}
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
    </div>
  );
};

export default DashboardFilters;
