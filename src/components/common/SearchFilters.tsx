
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
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
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onSearch, 
  placeholder = "Search...",
  filters = [] 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p>Search by tracking ID, internal tracking ID, patent title, applicant, client ID, application number, or any employee assigned to the patent</p>
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
