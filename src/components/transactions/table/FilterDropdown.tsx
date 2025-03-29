
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface FilterDropdownProps {
  column: string;
  value: string;
  hasActiveFilter: boolean;
  onFilter: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  width?: string;
  align?: "start" | "end" | "center";
  inputHint?: string;
  options?: Array<{value: string, label: string}>;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  column,
  value,
  hasActiveFilter,
  onFilter,
  onClear,
  placeholder = "Filter...",
  width = "w-56",
  align = "start",
  inputHint,
  options,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={hasActiveFilter ? "secondary" : "ghost"} 
          size="sm" 
          className="h-8 w-8 p-0 relative"
        >
          <ChevronDown className="h-4 w-4" />
          {hasActiveFilter && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
          )}
          <span className="sr-only">Filter {column}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={`${width} p-2`}>
        {inputHint && (
          <div className="mb-2 text-sm text-muted-foreground">
            {inputHint}
          </div>
        )}
        
        {options ? (
          <>
            <DropdownMenuItem onClick={onClear}>All</DropdownMenuItem>
            {options.map((option) => (
              <DropdownMenuItem 
                key={option.value} 
                onClick={() => onFilter(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => onFilter(e.target.value)}
              className="flex-1"
            />
            {hasActiveFilter && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClear}
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
