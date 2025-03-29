
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import FilterDropdown from './FilterDropdown';

interface SortableColumnHeaderProps {
  title: string;
  column: string;
  currentSortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  filterValue: string;
  hasActiveFilter: boolean;
  onFilter: (column: string, value: string) => void;
  onClearFilter: (column: string) => void;
  filterPlaceholder?: string;
  filterWidth?: string;
  filterAlign?: "start" | "end" | "center";
  filterHint?: string;
  filterOptions?: Array<{value: string, label: string}>;
}

const SortableColumnHeader: React.FC<SortableColumnHeaderProps> = ({
  title,
  column,
  currentSortColumn,
  sortDirection,
  onSort,
  filterValue,
  hasActiveFilter,
  onFilter,
  onClearFilter,
  filterPlaceholder,
  filterWidth,
  filterAlign,
  filterHint,
  filterOptions,
}) => {
  return (
    <TableHead>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {title}
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onSort(column)}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="sr-only">Sort by {title.toLowerCase()}</span>
          </Button>
        </div>
        <FilterDropdown 
          column={column}
          value={filterValue || ''}
          hasActiveFilter={hasActiveFilter}
          onFilter={(value) => onFilter(column, value)}
          onClear={() => onClearFilter(column)}
          placeholder={filterPlaceholder || `Filter by ${title.toLowerCase()}...`}
          width={filterWidth}
          align={filterAlign}
          inputHint={filterHint}
          options={filterOptions}
        />
      </div>
    </TableHead>
  );
};

export default SortableColumnHeader;
