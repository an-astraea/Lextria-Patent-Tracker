
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  filters?: {
    name: string;
    options: Array<{ value: string | null; label: string }>;
    onFilter: (value: string | null) => void;
    activeFilter: string | null;
  }[];
  searchQuery?: string;
  onClearSearch?: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onSearch, 
  placeholder = "Search...",
  filters = [],
  searchQuery = '',
  onClearSearch
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearch = () => {
    onSearch(localSearchQuery);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    if (onClearSearch) {
      onClearSearch();
    } else {
      onSearch('');
    }
  };

  // Update local state when the prop changes
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                className="pl-10 pr-10"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              {localSearchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p>Search by any patent detail: tracking ID, internal tracking ID, patent title, applicant, client ID, application number, inventor details, or any employee assigned to the patent</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Button variant="secondary" onClick={handleSearch}>
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
      
      {filters.map((filter, index) => (
        <DropdownMenu key={index}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              {filter.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {filter.options.map((option, optIndex) => (
              <DropdownMenuItem 
                key={optIndex} 
                onClick={() => filter.onFilter(option.value)}
                className={filter.activeFilter === option.value ? "bg-accent" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
};

export default SearchFilters;
