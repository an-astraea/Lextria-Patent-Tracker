
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchFiltersProps {
  onSearch: (query: string, field?: string) => void;
  placeholder?: string;
  filters?: {
    name: string;
    options: Array<{ value: string | null; label: string }>;
    onFilter: (value: string | null) => void;
    activeFilter: string | null;
  }[];
  searchFields?: Array<{ value: string; label: string }>;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onSearch, 
  placeholder = "Search...",
  filters = [],
  searchFields = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedField, setSelectedField] = useState<string | undefined>(undefined);

  const handleSearch = () => {
    onSearch(searchQuery, selectedField);
  };

  const getPlaceholder = () => {
    if (selectedField && searchFields.length > 0) {
      const field = searchFields.find(f => f.value === selectedField);
      return field ? `Search by ${field.label}...` : placeholder;
    }
    return placeholder;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-grow flex">
        {searchFields.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="rounded-r-none border-r-0"
              >
                {selectedField 
                  ? searchFields.find(f => f.value === selectedField)?.label || 'All' 
                  : 'All'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setSelectedField(undefined)}>
                All Fields
              </DropdownMenuItem>
              {searchFields.map((field, index) => (
                <DropdownMenuItem 
                  key={index} 
                  onClick={() => setSelectedField(field.value)}
                >
                  {field.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={getPlaceholder()}
            className={searchFields.length > 0 ? "pl-10 rounded-l-none" : "pl-10"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
      </div>
      
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
