import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import TransactionList from '@/components/transactions/TransactionList';
import { useNavigate } from 'react-router-dom';
import { Plus, X, FileDown, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionType, ExpenseType } from '@/types/cashflow';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { exportToExcel, exportToCsv } from '@/utils/exportUtils';
import { toast } from 'sonner';

const Transactions = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
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
  
  const handleExportData = async (type: 'excel' | 'csv') => {
    try {
      toast.loading(`Preparing ${type.toUpperCase()} export...`);
      
      // Build the query with all filters
      let query = supabase.from('transactions').select('*');
      
      if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }
      
      if (selectedMonth) {
        const year = selectedYear || new Date().getFullYear();
        const startDate = `${year}-${selectedMonth}-01`;
        
        const nextMonth = parseInt(selectedMonth) === 12 ? 1 : parseInt(selectedMonth) + 1;
        const nextYear = parseInt(selectedMonth) === 12 ? parseInt(year.toString()) + 1 : year;
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        query = query.gte('date', startDate).lt('date', endDate);
      }
      
      if (selectedType) {
        query = query.eq('type', selectedType);
      }
      
      if (selectedCategory) {
        // Fix: Only set expense_type filter if selectedCategory is a valid ExpenseType
        const validExpenseTypes: ExpenseType[] = ["Salary", "Marketing", "Services", "Software", "Other"];
        if (validExpenseTypes.includes(selectedCategory as ExpenseType)) {
          query = query.eq('expense_type', selectedCategory as ExpenseType);
        }
      }
      
      // Fetch data
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.dismiss();
        toast.error('No data available for export');
        return;
      }
      
      // Process data for export
      const exportData = data.map(item => ({
        Date: item.date,
        Type: item.type,
        Category: item.expense_type || '-',
        Amount: item.amount,
        Currency: item.currency,
        Status: item.status,
        Comment: item.comment || '-'
      }));
      
      // Export based on type
      if (type === 'excel') {
        exportToExcel(exportData, `finca-transactions-${new Date().toISOString().slice(0, 10)}`);
      } else {
        exportToCsv(exportData, `finca-transactions-${new Date().toISOString().slice(0, 10)}`);
      }
      
      toast.dismiss();
      toast.success(`${type.toUpperCase()} file exported successfully`);
    } catch (error) {
      toast.dismiss();
      console.error(`Error exporting ${type}:`, error);
      toast.error(`Failed to export ${type}`);
    }
  };
  
  const handleEmailReport = () => {
    navigate('/email-report');
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
        
        <div className="flex justify-end mb-6 gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportData('excel')}>
                <FileText className="h-4 w-4 mr-2" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData('csv')}>
                <FileText className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" onClick={handleEmailReport}>
            <Send className="h-4 w-4 mr-2" />
            Email Report
          </Button>
        </div>
        
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
