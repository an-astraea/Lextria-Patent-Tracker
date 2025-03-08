import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, completeFilerTask } from '@/lib/api';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import RefreshButton from '@/components/approvals/RefreshButton';
import LoadingSpinner from '@/components/approvals/LoadingSpinner';
import EmptyApprovals from '@/components/approvals/EmptyApprovals';
import { useIsMobile } from '@/hooks/use-mobile';
import FormRequirementsList from '@/components/patent/FormRequirementsList';

const ITEMS_PER_PAGE = 6; // Number of items to show per page

const Filings = () => {
  const navigate = useNavigate();
  const [activePatents, setActivePatents] = useState<Patent[]>([]);
  const [completedPatents, setCompletedPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const isMobile = useIsMobile();
  const [formStatuses, setFormStatuses] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

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
      
      const [activeData, completedData] = await Promise.all([
        fetchFilerAssignments(user.full_name),
        fetchFilerCompletedAssignments(user.full_name)
      ]);
      
      const sortedActivePatents = activeData.sort((a, b) => {
        const getQueueOrder = (patent: Patent) => {
          if (patent.ps_filer_assgn === user.full_name && patent.ps_filing_status === 0) {
            return 1;
          } else if (patent.cs_filer_assgn === user.full_name && patent.cs_filing_status === 0) {
            return 2;
          } else if (patent.fer_filer_assgn === user.full_name && patent.fer_filing_status === 0) {
            return 3;
          }
          return 4;
        };
        
        return getQueueOrder(a) - getQueueOrder(b);
      });
      
      setActivePatents(sortedActivePatents);
      setCompletedPatents(completedData);
      setInitialLoadComplete(true);
      
      if (isRefresh) {
        setActivePage(1);
        setCompletedPage(1);
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

  const resetFormState = () => {
    setFormStatuses({});
  };

  const handleShowFormsDialog = (patent: Patent) => {
    setSelectedPatent(patent);
    
    const initialFormStatuses: Record<string, boolean> = {};
    
    Object.entries(patent).forEach(([key, value]) => {
      if (key.startsWith('form_') && typeof value === 'boolean') {
        initialFormStatuses[key] = value === true;
      }
    });
    
    setFormStatuses(initialFormStatuses);
    setDialogOpen(true);
  };

  const handleUpdateForm = (formName: string, value: boolean) => {
    setFormStatuses(prev => ({
      ...prev,
      [formName]: value
    }));
  };

  const handleComplete = async (patent: Patent) => {
    if (!user) return;
    
    try {
      let formData: Record<string, boolean> | undefined;
      if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
        formData = formStatuses;
      }
      
      const success = await completeFilerTask(patent, user.full_name, formData);
      if (success) {
        toast.success('Filing task completed and sent for review');
        setDialogOpen(false);
        resetFormState();
        
        const updatedPatent = { ...patent };
        
        if (patent.ps_filer_assgn === user.full_name) {
          updatedPatent.ps_filing_status = 1;
          updatedPatent.ps_review_file_status = 1;
        } else if (patent.cs_filer_assgn === user.full_name) {
          updatedPatent.cs_filing_status = 1;
          updatedPatent.cs_review_file_status = 1;
          if (formData) {
            Object.entries(formData).forEach(([key, value]) => {
              (updatedPatent as any)[key] = value;
            });
          }
        } else if (patent.fer_filer_assgn === user.full_name) {
          updatedPatent.fer_filing_status = 1;
          updatedPatent.fer_review_file_status = 1;
        }
        
        setActivePatents(prevPatents => prevPatents.filter(p => p.id !== patent.id));
        setCompletedPatents(prevPatents => [updatedPatent, ...prevPatents]);
      }
    } catch (error) {
      console.error('Error completing filing task:', error);
      toast.error('Failed to complete filing task');
    }
  };

  const getTaskType = (patent: Patent) => {
    if (patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 0) {
      return 'Provisional Specification';
    } else if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
      return 'Complete Specification';
    } else if (patent.fer_filer_assgn === user?.full_name && patent.fer_filing_status === 0) {
      return 'First Examination Report';
    }
    return 'Unknown Task';
  };

  const getDeadline = (patent: Patent) => {
    if (patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 0) {
      return patent.ps_filer_deadline;
    } else if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
      return patent.cs_filer_deadline;
    } else if (patent.fer_filer_assgn === user?.full_name && patent.fer_filing_status === 0) {
      return patent.fer_filer_deadline;
    }
    return null;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline set';
    return new Date(dateString).toLocaleDateString();
  };

  const isTaskAvailable = (patent: Patent) => {
    if (patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 0) {
      return patent.ps_drafting_status === 1;
    } 
    
    if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
      const psNotRequired = !patent.ps_filer_assgn;
      const psCompleted = patent.ps_filing_status === 1;
      return (psNotRequired || psCompleted) && patent.cs_drafting_status === 1;
    }
    
    if (patent.fer_filer_assgn === user?.full_name && patent.fer_filing_status === 0) {
      const psNotRequired = !patent.ps_filer_assgn;
      const csNotRequired = !patent.cs_filer_assgn;
      const psCompleted = patent.ps_filing_status === 1;
      const csCompleted = patent.cs_filing_status === 1;
      return (psNotRequired || psCompleted) && (csNotRequired || csCompleted) && patent.fer_drafter_status === 1;
    }
    
    return false;
  };

  const requiresForms = (patent: Patent) => {
    return patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0;
  };

  const paginateData = (data: Patent[], pageNumber: number) => {
    const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const activePatentsPaginated = paginateData(activePatents, activePage);
  const completedPatentsPaginated = paginateData(completedPatents, completedPage);
  
  const renderPagination = (data: Patent[], currentPage: number, setPage: React.Dispatch<React.SetStateAction<number>>) => {
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
                        
                        {requiresForms(patent) ? (
                          <Button
                            size="sm"
                            onClick={() => handleShowFormsDialog(patent)}
                            disabled={!isTaskAvailable(patent)}
                            className="w-full sm:w-auto"
                          >
                            Complete & Submit
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleComplete(patent)}
                            disabled={!isTaskAvailable(patent)}
                            className="w-full sm:w-auto"
                          >
                            Complete & Submit
                          </Button>
                        )}
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
      </Tabs>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle>Complete Specification Forms</DialogTitle>
            <DialogDescription>
              Select the forms that you have completed for this patent.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {selectedPatent && (
              <FormRequirementsList 
                patent={{
                  ...selectedPatent,
                  ...Object.keys(formStatuses).reduce((acc, key) => {
                    acc[key as keyof Patent] = formStatuses[key] as any;
                    return acc;
                  }, {} as Partial<Patent>)
                }} 
                userRole="filer"
                onUpdate={handleUpdateForm}
              />
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button 
              onClick={() => selectedPatent && handleComplete(selectedPatent)}
              className="w-full sm:w-auto"
            >
              Submit & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Filings;
