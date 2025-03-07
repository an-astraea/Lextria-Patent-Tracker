import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Filter, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import PatentCard from '@/components/PatentCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { fetchPatentsAndEmployees, deletePatent } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Patents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [patentToDelete, setPatentToDelete] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    draftingStatus: null as string | null,
    filingStatus: null as string | null,
    ferStatus: null as string | null,
    clientId: null as string | null,
    dateRange: {
      start: null as string | null,
      end: null as string | null,
    },
  });
  
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  
  const uniqueClientIds = [...new Set(patents.map(patent => patent.client_id))];
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const { patents } = await fetchPatentsAndEmployees();
        setPatents(patents);
        setFilteredPatents(patents);
      } catch (error) {
        console.error('Error fetching patents:', error);
        toast.error('Failed to load patents');
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);
  
  useEffect(() => {
    let filtered = patents;
    
    if (filters.draftingStatus) {
      filtered = filtered.filter(patent => {
        if (filters.draftingStatus === 'ps_drafting_complete') {
          return patent.ps_drafting_status === 1;
        } else if (filters.draftingStatus === 'ps_drafting_pending') {
          return patent.ps_drafting_status === 0;
        } else if (filters.draftingStatus === 'cs_drafting_complete') {
          return patent.cs_drafting_status === 1;
        } else if (filters.draftingStatus === 'cs_drafting_pending') {
          return patent.cs_drafting_status === 0;
        } else if (filters.draftingStatus === 'fer_drafting_complete') {
          return patent.fer_drafter_status === 1;
        } else if (filters.draftingStatus === 'fer_drafting_pending') {
          return patent.fer_drafter_status === 0;
        }
        return true;
      });
    }
    
    if (filters.filingStatus) {
      filtered = filtered.filter(patent => {
        if (filters.filingStatus === 'ps_filing_complete') {
          return patent.ps_filing_status === 1;
        } else if (filters.filingStatus === 'ps_filing_pending') {
          return patent.ps_filing_status === 0;
        } else if (filters.filingStatus === 'cs_filing_complete') {
          return patent.cs_filing_status === 1;
        } else if (filters.filingStatus === 'cs_filing_pending') {
          return patent.cs_filing_status === 0;
        } else if (filters.filingStatus === 'fer_filing_complete') {
          return patent.fer_filing_status === 1;
        } else if (filters.filingStatus === 'fer_filing_pending') {
          return patent.fer_filing_status === 0;
        }
        return true;
      });
    }
    
    if (filters.ferStatus) {
      filtered = filtered.filter(patent => {
        if (filters.ferStatus === 'active') {
          return patent.fer_status === 1;
        } else if (filters.ferStatus === 'inactive') {
          return patent.fer_status === 0;
        }
        return true;
      });
    }
    
    if (filters.clientId) {
      filtered = filtered.filter(patent => patent.client_id === filters.clientId);
    }
    
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(patent => {
        if (!patent.date_of_filing) {
          return false;
        }
        
        const filingDate = new Date(patent.date_of_filing);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (startDate && endDate) {
          return filingDate >= startDate && filingDate <= endDate;
        } else if (startDate) {
          return filingDate >= startDate;
        } else if (endDate) {
          return filingDate <= endDate;
        }
        
        return true;
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (patent) =>
          patent.patent_title.toLowerCase().includes(query) ||
          patent.tracking_id.toLowerCase().includes(query) ||
          patent.patent_applicant.toLowerCase().includes(query) ||
          patent.client_id.toLowerCase().includes(query) ||
          (patent.application_no && patent.application_no.toLowerCase().includes(query)) ||
          (patent.ps_drafter_assgn && patent.ps_drafter_assgn.toLowerCase().includes(query)) ||
          (patent.ps_filer_assgn && patent.ps_filer_assgn.toLowerCase().includes(query)) ||
          (patent.cs_drafter_assgn && patent.cs_drafter_assgn.toLowerCase().includes(query)) ||
          (patent.cs_filer_assgn && patent.cs_filer_assgn.toLowerCase().includes(query)) ||
          (patent.fer_drafter_assgn && patent.fer_drafter_assgn.toLowerCase().includes(query)) ||
          (patent.fer_filer_assgn && patent.fer_filer_assgn.toLowerCase().includes(query))
      );
    }
    
    setFilteredPatents(filtered);
  }, [searchQuery, patents, filters]);
  
  const handleSearch = () => {
    setSearchQuery(pendingSearchQuery);
  };
  
  const handleDeletePatent = async (id: string) => {
    try {
      const success = await deletePatent(id);
      if (success) {
        setPatents(patents.filter(patent => patent.id !== id));
        setFilteredPatents(filteredPatents.filter(patent => patent.id !== id));
        toast.success('Patent deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting patent:', error);
      toast.error('Failed to delete patent');
    }
    setPatentToDelete(null);
  };
  
  const confirmDelete = (id: string) => {
    setPatentToDelete(id);
  };
  
  const cancelDelete = () => {
    setPatentToDelete(null);
  };
  
  const clearFilters = () => {
    setFilters({
      draftingStatus: null,
      filingStatus: null,
      ferStatus: null,
      clientId: null,
      dateRange: {
        start: null,
        end: null,
      },
    });
    setSearchQuery('');
    setPendingSearchQuery('');
  };
  
  const getInProgressPatents = () => {
    return filteredPatents.filter(patent => 
      !patent.ps_completion_status || 
      !patent.cs_completion_status || 
      (patent.fer_status === 1 && !patent.fer_completion_status)
    );
  };
  
  const getCompletedPatents = () => {
    return filteredPatents.filter(patent => 
      patent.ps_completion_status === 1 && 
      patent.cs_completion_status === 1 && 
      (patent.fer_status === 0 || patent.fer_completion_status === 1)
    );
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.draftingStatus) count++;
    if (filters.filingStatus) count++;
    if (filters.ferStatus) count++;
    if (filters.clientId) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (searchQuery) count++;
    return count;
  };

  const getFiledStatus = () => {
    return (
      <div className="space-y-2">
        <h5 className="text-sm font-medium">Filing Date</h5>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="filed-filter" 
              checked={!!filters.dateRange.start || !!filters.dateRange.end}
              onCheckedChange={(checked) => {
                if (!checked) {
                  setFilters({
                    ...filters, 
                    dateRange: {start: null, end: null}
                  });
                }
              }}
            />
            <Label htmlFor="filed-filter">Show only filed patents</Label>
          </div>
          
          {(!!filters.dateRange.start || !!filters.dateRange.end) && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="start-date">From</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => setFilters({
                    ...filters, 
                    dateRange: {...filters.dateRange, start: e.target.value || null}
                  })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">To</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => setFilters({
                    ...filters, 
                    dateRange: {...filters.dateRange, end: e.target.value || null}
                  })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Patents</h1>
        {user?.role === 'admin' && (
          <Button onClick={() => navigate('/patents/add')} className="sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Patent
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patents..."
            className="pl-10"
            value={pendingSearchQuery}
            onChange={(e) => setPendingSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        
        <Button variant="secondary" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="sm:w-auto relative">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Filter Patents</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Drafting Status</h5>
                <Select 
                  value={filters.draftingStatus || undefined} 
                  onValueChange={(value) => setFilters({...filters, draftingStatus: value || null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ps_drafting_complete">PS Drafting Complete</SelectItem>
                    <SelectItem value="ps_drafting_pending">PS Drafting Pending</SelectItem>
                    <SelectItem value="cs_drafting_complete">CS Drafting Complete</SelectItem>
                    <SelectItem value="cs_drafting_pending">CS Drafting Pending</SelectItem>
                    <SelectItem value="fer_drafting_complete">FER Drafting Complete</SelectItem>
                    <SelectItem value="fer_drafting_pending">FER Drafting Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Filing Status</h5>
                <Select 
                  value={filters.filingStatus || undefined} 
                  onValueChange={(value) => setFilters({...filters, filingStatus: value || null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ps_filing_complete">PS Filing Complete</SelectItem>
                    <SelectItem value="ps_filing_pending">PS Filing Pending</SelectItem>
                    <SelectItem value="cs_filing_complete">CS Filing Complete</SelectItem>
                    <SelectItem value="cs_filing_pending">CS Filing Pending</SelectItem>
                    <SelectItem value="fer_filing_complete">FER Filing Complete</SelectItem>
                    <SelectItem value="fer_filing_pending">FER Filing Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">FER Status</h5>
                <Select 
                  value={filters.ferStatus || undefined} 
                  onValueChange={(value) => setFilters({...filters, ferStatus: value || null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Client ID</h5>
                <Select 
                  value={filters.clientId || undefined} 
                  onValueChange={(value) => setFilters({...filters, clientId: value || null})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueClientIds.map(clientId => (
                      <SelectItem key={clientId} value={clientId}>{clientId}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {getFiledStatus()}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.draftingStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Drafting: {filters.draftingStatus.replace('_', ' ')}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, draftingStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.filingStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Filing: {filters.filingStatus.replace('_', ' ')}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, filingStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.ferStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              FER: {filters.ferStatus}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, ferStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.clientId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Client: {filters.clientId}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, clientId: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {filters.dateRange.start || 'Any'} to {filters.dateRange.end || 'Any'}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, dateRange: {start: null, end: null}})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
      
      <Tabs defaultValue="in-progress">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="in-progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getInProgressPatents().length > 0 ? (
              getInProgressPatents().map((patent) => (
                <PatentCard 
                  key={patent.id} 
                  patent={patent} 
                  onDelete={user?.role === 'admin' ? () => confirmDelete(patent.id) : undefined} 
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">No patents in progress</p>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCompletedPatents().length > 0 ? (
              getCompletedPatents().map((patent) => (
                <PatentCard 
                  key={patent.id} 
                  patent={patent} 
                  onDelete={user?.role === 'admin' ? () => confirmDelete(patent.id) : undefined} 
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">No completed patents</p>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={!!patentToDelete} onOpenChange={() => !patentToDelete && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this patent?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patent and remove all associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => patentToDelete && handleDeletePatent(patentToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Patents;

