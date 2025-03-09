import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { 
  fetchFilerAssignments, 
  fetchFilerCompletedAssignments, 
  completeFilerTask,
  fetchFilerFERAssignments,
  completeFERFiling
} from '@/lib/api';
import { Patent, FEREntry, handlePatentsResponse } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import RefreshButton from '@/components/approvals/RefreshButton';
import LoadingSpinner from '@/components/approvals/LoadingSpinner';
import EmptyApprovals from '@/components/approvals/EmptyApprovals';
import { useIsMobile } from '@/hooks/use-mobile';

const ITEMS_PER_PAGE = 6; // Number of items to show per page

const Filings = () => {
  const navigate = useNavigate();
  const [activePatents, setActivePatents] = useState<Patent[]>([]);
  const [completedPatents, setCompletedPatents] = useState<Patent[]>([]);
  const [ferEntries, setFerEntries] = useState<FEREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [ferPage, setFerPage] = useState(1);
  const isMobile = useIsMobile();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  React.useEffect(() => {
    if (!user || user.role !== 'filer') {
      toast.error('Access denied. Filer privileges required.');
      navigate('/dashboard');
    } else if (!initialLoadComplete) {
      loadPatents();
    }
  }, [user, navigate, initialLoadComplete]);

  const loadPatents = async (isRefresh = false) => {
    if (!user || user.role !== 'filer') return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [activeResp, completedResp, ferResp] = await Promise.all([
        fetchFilerAssignments(user.full_name),
        fetchFilerCompletedAssignments(user.full_name),
        fetchFilerFERAssignments(user.full_name)
      ]);
      
      const activeData = handlePatentsResponse(activeResp);
      const completedData = handlePatentsResponse(completedResp);
      const ferData = handlePatentsResponse(ferResp).flatMap(patent => 
        patent.fer_entries?.filter(entry => 
          entry.fer_filer_assgn === user.full_name && entry.fer_filing_status === 0
        ) || []
      );
      
      setActivePatents(activeData);
      setCompletedPatents(completedData);
      setFerEntries(ferData);
      setInitialLoadComplete(true);
      
      if (isRefresh) {
        setActivePage(1);
        setCompletedPage(1);
        setFerPage(1);
      }
    } catch (error) {
      console.error('Error loading filer assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadPatents(true);
  };

  const handleComplete = async (patent: Patent) => {
    if (!user) return;
    
    try {
      const success = await completeFilerTask(patent.id, user.full_name);
      if (success) {
        toast.success('Filing task completed');
        
        const updatedPatent = { ...patent };
        
        if (patent.ps_filer_assgn === user.full_name) {
          updatedPatent.ps_filing_status = 1;
          updatedPatent.ps_review_file_status = 1;
        } else if (patent.cs_filer_assgn === user.full_name) {
          updatedPatent.cs_filing_status = 1;
          updatedPatent.cs_review_file_status = 1;
        }
        
        setActivePatents(prevPatents => prevPatents.filter(p => p.id !== patent.id));
        setCompletedPatents(prevPatents => [updatedPatent, ...prevPatents]);
      }
    } catch (error) {
      console.error('Error completing filing task:', error);
      toast.error('Failed to complete filing task');
    }
  };

  const handleCompleteFER = async (ferId: string) => {
    if (!user) return;
    
    try {
      const response = await completeFERFiling(ferId);
      if (response.success) {
        toast.success('FER Filing task completed');
        
        setFerEntries(prevEntries => {
          return prevEntries.filter(entry => entry.id !== ferId);
        });
      } else {
        toast.error(response.error || 'Failed to complete FER filing task');
      }
    } catch (error: any) {
      console.error('Error completing FER filing task:', error);
      toast.error('Failed to complete FER filing task');
    }
  };

  const getTaskType = (patent: Patent) => {
    if (patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 0) {
      return 'Provisional Specification Filing';
    } else if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
      return 'Complete Specification Filing';
    }
    return 'Unknown Task';
  };

  const getDeadline = (patent: Patent) => {
    if (patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 0) {
      return patent.ps_filer_deadline;
    } else if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
      return patent.cs_filer_deadline;
    }
    return null;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline set';
    return new Date(dateString).toLocaleDateString();
  };

  const isTaskAvailable = (patent: Patent) => {
    if (patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 0) {
      return true;
    } 
    
    if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
      return !patent.ps_filer_assgn || patent.ps_filing_status === 1;
    }
    
    return false;
  };

  const paginateData = (data: any[], pageNumber: number) => {
    const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const activePatentsPaginated = paginateData(activePatents, activePage);
  const completedPatentsPaginated = paginateData(completedPatents, completedPage);
  const ferEntriesPaginated = paginateData(ferEntries, ferPage);
  
  const renderPagination = (data: any[], currentPage: number, setPage: React.Dispatch<React.SetStateAction<number>>) => {
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }).map((_, i) => (
            <PaginationItem key={i} className={isMobile && totalPages > 5 && ![0, 1, totalPages - 2, totalPages - 1].includes(i) && i !== currentPage - 1 ? "hidden" : ""}>
              <PaginationLink
                onClick={() => setPage(i + 1)}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h1 className="text-2xl font-bold">Filing Assignments</h1>
        <RefreshButton onRefresh={handleRefresh} loading={refreshing} />
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto justify-start overflow-x-auto">
          <TabsTrigger value="active">Active Tasks ({activePatents.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Tasks ({completedPatents.length})</TabsTrigger>
          <TabsTrigger value="fer">FER Filing ({ferEntries.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="min-h-[50vh]">
          {loading ? (
            <LoadingSpinner />
          ) : activePatents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePatentsPaginated.map(patent => (
                  <Card key={patent.id} className="hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <div className="truncate">{patent.patent_title}</div>
                        <StatusBadge status={isTaskAvailable(patent) ? 'active' : 'pending'} />
                      </CardTitle>
                      <CardDescription>ID: {patent.tracking_id}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <div className="space-y-2 text-sm flex-grow">
                        <div><span className="font-medium">Applicant:</span> {patent.patent_applicant}</div>
                        <div><span className="font-medium">Task:</span> {getTaskType(patent)}</div>
                        <div><span className="font-medium">Client ID:</span> {patent.client_id}</div>
                        <div><span className="font-medium">Deadline:</span> {formatDate(getDeadline(patent))}</div>
                      </div>
                      
                      <div className="pt-4 mt-auto flex flex-col sm:flex-row justify-between gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/patents/${patent.id}`)}
                          className="w-full sm:w-auto"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleComplete(patent)}
                          disabled={!isTaskAvailable(patent)}
                          className="w-full sm:w-auto"
                        >
                          Complete & Submit
                        </Button>
                      </div>
                      
                      {!isTaskAvailable(patent) && (
                        <div className="text-amber-600 font-medium text-xs mt-2">
                          Waiting for previous stage to be completed
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {renderPagination(activePatents, activePage, setActivePage)}
            </>
          ) : (
            <EmptyApprovals />
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="min-h-[50vh]">
          {loading ? (
            <LoadingSpinner />
          ) : completedPatents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedPatentsPaginated.map(patent => (
                  <Card key={patent.id} className="hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <div className="truncate">{patent.patent_title}</div>
                        <StatusBadge status="completed" />
                      </CardTitle>
                      <CardDescription>ID: {patent.tracking_id}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <div className="space-y-2 text-sm flex-grow">
                        <div><span className="font-medium">Applicant:</span> {patent.patent_applicant}</div>
                        <div><span className="font-medium">Client ID:</span> {patent.client_id}</div>
                        <div><span className="font-medium">Filing Date:</span> {formatDate(patent.date_of_filing)}</div>
                      </div>
                      
                      <div className="pt-4 mt-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/patents/${patent.id}`)}
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {renderPagination(completedPatents, completedPage, setCompletedPage)}
            </>
          ) : (
            <EmptyApprovals />
          )}
        </TabsContent>

        <TabsContent value="fer" className="min-h-[50vh]">
          {loading ? (
            <LoadingSpinner />
          ) : ferEntries.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ferEntriesPaginated.map(ferEntry => (
                  <Card key={ferEntry.id} className="hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <div className="truncate">FER #{ferEntry.fer_number}</div>
                        <StatusBadge status="active" />
                      </CardTitle>
                      <CardDescription>Patent ID: {ferEntry.patent_id}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <div className="space-y-2 text-sm flex-grow">
                        <div><span className="font-medium">Drafter:</span> {ferEntry.fer_drafter_assgn || 'Not Assigned'}</div>
                        <div><span className="font-medium">Filer:</span> {ferEntry.fer_filer_assgn || 'Not Assigned'}</div>
                        <div><span className="font-medium">Deadline:</span> {ferEntry.fer_filer_deadline ? formatDate(ferEntry.fer_filer_deadline) : 'No Deadline'}</div>
                      </div>
                      
                      <div className="pt-4 mt-auto flex flex-col sm:flex-row justify-between gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleCompleteFER(ferEntry.id)}
                          className="w-full sm:w-auto"
                        >
                          Complete FER Filing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {renderPagination(ferEntries, ferPage, setFerPage)}
            </>
          ) : (
            <EmptyApprovals />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Filings;
