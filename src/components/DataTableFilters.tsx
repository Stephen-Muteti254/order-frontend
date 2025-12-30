import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterParams } from '@/types';

interface DataTableFiltersProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  placeholder?: string;
  showDateFilters?: boolean;
  children?: React.ReactNode;
}

export default function DataTableFilters({
  filters,
  onFilterChange,
  placeholder = 'Search...',
  showDateFilters = false,
  children,
}: DataTableFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ ...filters, search: value, page: 1 });
    }, 300);
  };

  const handleDateChange = useCallback((start?: Date, end?: Date) => {
    setStartDate(start);
    setEndDate(end);
    onFilterChange({
      ...filters,
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
      page: 1,
    });
  }, [filters, onFilterChange]);

  const clearFilters = () => {
    setLocalSearch('');
    setStartDate(undefined);
    setEndDate(undefined);
    onFilterChange({ page: 1, pageSize: filters.pageSize });
  };

  const hasActiveFilters = localSearch || startDate || endDate;

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Date Filters */}
      {showDateFilters && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-4 w-4" />
              Date Range
              {(startDate || endDate) && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => handleDateChange(date, endDate)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => handleDateChange(startDate, date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Additional filters */}
      {children}

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
