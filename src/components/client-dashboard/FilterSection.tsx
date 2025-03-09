
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filter, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface FilterSectionProps {
  filters: {
    patentStatus: {
      completed: boolean;
      inProgress: boolean;
      notStarted: boolean;
      withdrawn: boolean;
      idfSent: boolean;
      idfReceived: boolean;
      idfSentNotReceived: boolean;
      csDataSent: boolean;
      csDataReceived: boolean;
      csDataSentNotReceived: boolean;
    };
    paymentStatus: {
      notSent: boolean;
      sent: boolean;
      received: boolean;
      invoiceSent: boolean;
    };
    draftingStatus: {
      psDrafting: boolean;
      csDrafting: boolean;
      ferDrafting: boolean;
      psDraftingReview: boolean;
      csDraftingReview: boolean;
      ferDraftingReview: boolean;
    };
    filingStatus: {
      psFiling: boolean;
      csFiling: boolean;
      ferFiling: boolean;
      psFilingReview: boolean;
      csFilingReview: boolean;
      ferFilingReview: boolean;
    };
    formStatus: Record<string, boolean>;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    searchQuery: string;
  };
  handleFilterChange: (filterGroup: string, filterName: string, value: boolean) => void;
  handleDateRangeChange: (field: string, value: string) => void;
  handleSearchChange: (value: string) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  handleFilterChange,
  handleDateRangeChange,
  handleSearchChange,
  resetFilters,
  activeFiltersCount
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full md:w-auto relative"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] md:w-[400px]" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Filter Patents</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-8 flex items-center text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {/* Search field */}
              <div>
                <h5 className="mb-2 text-sm font-medium">Search</h5>
                <Input 
                  placeholder="Search tracking ID, title, etc."
                  value={filters.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Patent Status Filters */}
              <div>
                <h5 className="mb-2 text-sm font-medium">Patent Status</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox 
                      id="completed"
                      checked={filters.patentStatus.completed}
                      onCheckedChange={(checked) => 
                        handleFilterChange('patentStatus', 'completed', checked as boolean)
                      }
                    />
                    <label htmlFor="completed" className="ml-2 text-sm">Completed</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="inProgress"
                      checked={filters.patentStatus.inProgress}
                      onCheckedChange={(checked) => 
                        handleFilterChange('patentStatus', 'inProgress', checked as boolean)
                      }
                    />
                    <label htmlFor="inProgress" className="ml-2 text-sm">In Progress</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="notStarted"
                      checked={filters.patentStatus.notStarted}
                      onCheckedChange={(checked) => 
                        handleFilterChange('patentStatus', 'notStarted', checked as boolean)
                      }
                    />
                    <label htmlFor="notStarted" className="ml-2 text-sm">Not Started</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="withdrawn"
                      checked={filters.patentStatus.withdrawn}
                      onCheckedChange={(checked) => 
                        handleFilterChange('patentStatus', 'withdrawn', checked as boolean)
                      }
                    />
                    <label htmlFor="withdrawn" className="ml-2 text-sm">Withdrawn</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="idfSent"
                      checked={filters.patentStatus.idfSent}
                      onCheckedChange={(checked) => 
                        handleFilterChange('patentStatus', 'idfSent', checked as boolean)
                      }
                    />
                    <label htmlFor="idfSent" className="ml-2 text-sm">IDF Sent</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="idfReceived"
                      checked={filters.patentStatus.idfReceived}
                      onCheckedChange={(checked) => 
                        handleFilterChange('patentStatus', 'idfReceived', checked as boolean)
                      }
                    />
                    <label htmlFor="idfReceived" className="ml-2 text-sm">IDF Received</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="idfSentNotReceived"
                      checked={filters.patentStatus.idfSentNotReceived}
                      onCheckedChange={(checked) => 
                        handleFilterChange('patentStatus', 'idfSentNotReceived', checked as boolean)
                      }
                    />
                    <label htmlFor="idfSentNotReceived" className="ml-2 text-sm">IDF Sent but Not Received</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="csDataSent"
                      checked={filters.patentStatus.csDataSent}
                      onCheckedChange={(checked) => 
                        handleFilterChange('patentStatus', 'csDataSent', checked as boolean)
                      }
                    />
                    <label htmlFor="csDataSent" className="ml-2 text-sm">CS Data Sent</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="csDataReceived"
                      checked={filters.patentStatus.csDataReceived}
                      onCheckedChange={(checked) => 
                        handleFilterChange('patentStatus', 'csDataReceived', checked as boolean)
                      }
                    />
                    <label htmlFor="csDataReceived" className="ml-2 text-sm">CS Data Received</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="csDataSentNotReceived"
                      checked={filters.patentStatus.csDataSentNotReceived}
                      onCheckedChange={(checked) => 
                        handleFilterChange('patentStatus', 'csDataSentNotReceived', checked as boolean)
                      }
                    />
                    <label htmlFor="csDataSentNotReceived" className="ml-2 text-sm">CS Data Sent but Not Received</label>
                  </div>
                </div>
              </div>

              {/* Payment Status Filters */}
              <div>
                <h5 className="mb-2 text-sm font-medium">Payment Status</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox 
                      id="notSent"
                      checked={filters.paymentStatus.notSent}
                      onCheckedChange={(checked) => 
                        handleFilterChange('paymentStatus', 'notSent', checked as boolean)
                      }
                    />
                    <label htmlFor="notSent" className="ml-2 text-sm">Not Sent</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="sent"
                      checked={filters.paymentStatus.sent}
                      onCheckedChange={(checked) => 
                        handleFilterChange('paymentStatus', 'sent', checked as boolean)
                      }
                    />
                    <label htmlFor="sent" className="ml-2 text-sm">Sent</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="received"
                      checked={filters.paymentStatus.received}
                      onCheckedChange={(checked) => 
                        handleFilterChange('paymentStatus', 'received', checked as boolean)
                      }
                    />
                    <label htmlFor="received" className="ml-2 text-sm">Received</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="invoiceSent"
                      checked={filters.paymentStatus.invoiceSent}
                      onCheckedChange={(checked) => 
                        handleFilterChange('paymentStatus', 'invoiceSent', checked as boolean)
                      }
                    />
                    <label htmlFor="invoiceSent" className="ml-2 text-sm">Invoice Sent</label>
                  </div>
                </div>
              </div>

              {/* Drafting Status Filters */}
              <div>
                <h5 className="mb-2 text-sm font-medium">Drafting Status</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox 
                      id="psDrafting"
                      checked={filters.draftingStatus.psDrafting}
                      onCheckedChange={(checked) => 
                        handleFilterChange('draftingStatus', 'psDrafting', checked as boolean)
                      }
                    />
                    <label htmlFor="psDrafting" className="ml-2 text-sm">PS Drafting</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="csDrafting"
                      checked={filters.draftingStatus.csDrafting}
                      onCheckedChange={(checked) => 
                        handleFilterChange('draftingStatus', 'csDrafting', checked as boolean)
                      }
                    />
                    <label htmlFor="csDrafting" className="ml-2 text-sm">CS Drafting</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="ferDrafting"
                      checked={filters.draftingStatus.ferDrafting}
                      onCheckedChange={(checked) => 
                        handleFilterChange('draftingStatus', 'ferDrafting', checked as boolean)
                      }
                    />
                    <label htmlFor="ferDrafting" className="ml-2 text-sm">FER Drafting</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="psDraftingReview"
                      checked={filters.draftingStatus.psDraftingReview}
                      onCheckedChange={(checked) => 
                        handleFilterChange('draftingStatus', 'psDraftingReview', checked as boolean)
                      }
                    />
                    <label htmlFor="psDraftingReview" className="ml-2 text-sm">PS Drafting Review</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="csDraftingReview"
                      checked={filters.draftingStatus.csDraftingReview}
                      onCheckedChange={(checked) => 
                        handleFilterChange('draftingStatus', 'csDraftingReview', checked as boolean)
                      }
                    />
                    <label htmlFor="csDraftingReview" className="ml-2 text-sm">CS Drafting Review</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="ferDraftingReview"
                      checked={filters.draftingStatus.ferDraftingReview}
                      onCheckedChange={(checked) => 
                        handleFilterChange('draftingStatus', 'ferDraftingReview', checked as boolean)
                      }
                    />
                    <label htmlFor="ferDraftingReview" className="ml-2 text-sm">FER Drafting Review</label>
                  </div>
                </div>
              </div>

              {/* Filing Status Filters */}
              <div>
                <h5 className="mb-2 text-sm font-medium">Filing Status</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox 
                      id="psFiling"
                      checked={filters.filingStatus.psFiling}
                      onCheckedChange={(checked) => 
                        handleFilterChange('filingStatus', 'psFiling', checked as boolean)
                      }
                    />
                    <label htmlFor="psFiling" className="ml-2 text-sm">PS Filing</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="csFiling"
                      checked={filters.filingStatus.csFiling}
                      onCheckedChange={(checked) => 
                        handleFilterChange('filingStatus', 'csFiling', checked as boolean)
                      }
                    />
                    <label htmlFor="csFiling" className="ml-2 text-sm">CS Filing</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="ferFiling"
                      checked={filters.filingStatus.ferFiling}
                      onCheckedChange={(checked) => 
                        handleFilterChange('filingStatus', 'ferFiling', checked as boolean)
                      }
                    />
                    <label htmlFor="ferFiling" className="ml-2 text-sm">FER Filing</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="psFilingReview"
                      checked={filters.filingStatus.psFilingReview}
                      onCheckedChange={(checked) => 
                        handleFilterChange('filingStatus', 'psFilingReview', checked as boolean)
                      }
                    />
                    <label htmlFor="psFilingReview" className="ml-2 text-sm">PS Filing Review</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="csFilingReview"
                      checked={filters.filingStatus.csFilingReview}
                      onCheckedChange={(checked) => 
                        handleFilterChange('filingStatus', 'csFilingReview', checked as boolean)
                      }
                    />
                    <label htmlFor="csFilingReview" className="ml-2 text-sm">CS Filing Review</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="ferFilingReview"
                      checked={filters.filingStatus.ferFilingReview}
                      onCheckedChange={(checked) => 
                        handleFilterChange('filingStatus', 'ferFilingReview', checked as boolean)
                      }
                    />
                    <label htmlFor="ferFilingReview" className="ml-2 text-sm">FER Filing Review</label>
                  </div>
                </div>
              </div>

              {/* Form Status Filters */}
              <div>
                <h5 className="mb-2 text-sm font-medium">Form Status</h5>
                <div className="space-y-2">
                  {Object.entries(filters.formStatus).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <Checkbox 
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          handleFilterChange('formStatus', key, checked as boolean)
                        }
                      />
                      <label htmlFor={key} className="ml-2 text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range Filters */}
              <div>
                <h5 className="mb-2 text-sm font-medium">Date Range</h5>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="startDate" className="block text-xs mb-1">Start Date</label>
                    <Input 
                      id="startDate"
                      type="date"
                      value={filters.dateRange.startDate}
                      onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-xs mb-1">End Date</label>
                    <Input 
                      id="endDate"
                      type="date"
                      value={filters.dateRange.endDate}
                      onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterSection;
