
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, TransactionType } from '@/types/cashflow';
import { useTransactionListData } from '@/hooks/useTransactionListData';
import TransactionTable from './table/TransactionTable';
import TablePagination from './table/TablePagination';
import LoadingState from './table/LoadingState';
import ErrorState from './table/ErrorState';
import EmptyState from './table/EmptyState';

interface TransactionListProps {
  showSubCategory?: boolean;
  showCreatedBy?: boolean;
  selectedMonth?: string | null;
  selectedYear?: string | null;
  selectedCategory?: string | null;
  filterType?: TransactionType | null;
}

const TransactionList: React.FC<TransactionListProps> = ({
  showSubCategory = false,
  showCreatedBy = false,
  selectedMonth = null,
  selectedYear = null,
  selectedCategory = null,
  filterType = null,
}) => {
  const navigate = useNavigate();
  
  const {
    transactions,
    isLoading,
    error,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    sortColumn,
    sortDirection,
    filters,
    setCurrentPage,
    handleSort,
    handleFilter,
    clearFilter,
    fetchTransactions,
    validTransactionTypes,
    validTransactionStatuses
  } = useTransactionListData({
    selectedMonth,
    selectedYear,
    selectedCategory,
    filterType
  });
  
  const handleRowClick = (id: string) => {
    navigate(`/transactions/${id}`);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState error={error} onRetry={fetchTransactions} />;
  }
  
  if (transactions.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div className="space-y-4">
      <TransactionTable 
        transactions={transactions}
        showSubCategory={showSubCategory}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        filters={filters}
        onSort={handleSort}
        onFilter={handleFilter}
        onClearFilter={clearFilter}
        onRowClick={handleRowClick}
        validTransactionTypes={validTransactionTypes}
        validTransactionStatuses={validTransactionStatuses}
      />
      
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default TransactionList;
