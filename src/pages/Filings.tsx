
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, completeFilerTask } from '@/lib/api';
import { Patent } from '@/lib/types';
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const isMobile = useIsMobile();
  
  const [form01, setForm01] = useState(false);
  const [form02PS, setForm02PS] = useState(false);
  const [form02CS, setForm02CS] = useState(false);
  const [form03, setForm03] = useState(false);
  const [form04, setForm04] = useState(false);
  const [form05, setForm05] = useState(false);
  const [form06, setForm06] = useState(false);
  const [form07, setForm07] = useState(false);
  const [form07a, setForm07a] = useState(false);
  const [form08, setForm08] = useState(false);
  const [form08a, setForm08a] = useState(false);
  const [form09, setForm09] = useState(false);
  const [form10, setForm10] = useState(false);
  const [form11, setForm11] = useState(false);
  const [form12, setForm12] = useState(false);
  const [form13, setForm13] = useState(false);
  const [form14, setForm14] = useState(false);
  const [form15, setForm15] = useState(false);
  const [form16, setForm16] = useState(false);
  const [form17, setForm17] = useState(false);
  const [form18, setForm18] = useState(false);
  const [form18a, setForm18a] = useState(false);
  const [form19, setForm19] = useState(false);
  const [form20, setForm20] = useState(false);
  const [form21, setForm21] = useState(false);
  const [form22, setForm22] = useState(false);
  const [form23, setForm23] = useState(false);
  const [form24, setForm24] = useState(false);
  const [form25, setForm25] = useState(false);
  const [form26, setForm26] = useState(false);
  const [form27, setForm27] = useState(false);
  const [form28, setForm28] = useState(false);
  const [form29, setForm29] = useState(false);
  const [form30, setForm30] = useState(false);
  const [form31, setForm31] = useState(false);
  const [form9, setForm9] = useState(false);
  const [form9a, setForm9a] = useState(false);
  const [otherForms, setOtherForms] = useState('');
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
    setForm01(false);
    setForm02PS(false);
    setForm02CS(false);
    setForm03(false);
    setForm04(false);
    setForm05(false);
    setForm06(false);
    setForm07(false);
    setForm07a(false);
    setForm08(false);
    setForm08a(false);
    setForm09(false);
    setForm10(false);
    setForm11(false);
    setForm12(false);
    setForm13(false);
    setForm14(false);
    setForm15(false);
    setForm16(false);
    setForm17(false);
    setForm18(false);
    setForm18a(false);
    setForm19(false);
    setForm20(false);
    setForm21(false);
    setForm22(false);
    setForm23(false);
    setForm24(false);
    setForm25(false);
    setForm26(false);
    setForm27(false);
    setForm28(false);
    setForm29(false);
    setForm30(false);
    setForm31(false);
    setForm9(false);
    setForm9a(false);
    setOtherForms('');
  };

  const handleShowFormsDialog = (patent: Patent) => {
    setSelectedPatent(patent);
    
    resetFormState();
    
    if (patent.form_01) setForm01(true);
    if (patent.form_02_ps) setForm02PS(true);
    if (patent.form_02_cs) setForm02CS(true);
    if (patent.form_03) setForm03(true);
    if (patent.form_04) setForm04(true);
    if (patent.form_05) setForm05(true);
    if (patent.form_06) setForm06(true);
    if (patent.form_07) setForm07(true);
    if (patent.form_07a) setForm07a(true);
    if (patent.form_08) setForm08(true);
    if (patent.form_08a) setForm08a(true);
    if (patent.form_09) setForm09(true);
    if (patent.form_10) setForm10(true);
    if (patent.form_11) setForm11(true);
    if (patent.form_12) setForm12(true);
    if (patent.form_13) setForm13(true);
    if (patent.form_14) setForm14(true);
    if (patent.form_15) setForm15(true);
    if (patent.form_16) setForm16(true);
    if (patent.form_17) setForm17(true);
    if (patent.form_18) setForm18(true);
    if (patent.form_18a) setForm18a(true);
    if (patent.form_19) setForm19(true);
    if (patent.form_20) setForm20(true);
    if (patent.form_21) setForm21(true);
    if (patent.form_22) setForm22(true);
    if (patent.form_23) setForm23(true);
    if (patent.form_24) setForm24(true);
    if (patent.form_25) setForm25(true);
    if (patent.form_26) setForm26(true);
    if (patent.form_27) setForm27(true);
    if (patent.form_28) setForm28(true);
    if (patent.form_29) setForm29(true);
    if (patent.form_30) setForm30(true);
    if (patent.form_31) setForm31(true);
    if (patent.form_9) setForm9(true);
    if (patent.form_9a) setForm9a(true);
    if (patent.other_forms) setOtherForms(patent.other_forms);
    
    setDialogOpen(true);
  };

  const handleComplete = async (patent: Patent) => {
    if (!user) return;
    
    try {
      let formData;
      
      if (patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 0) {
        formData = {
          form_01: form01,
          form_02_ps: form02PS,
          form_26: form26,
          other_forms: otherForms
        };
      } else if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
        formData = {
          form_01: form01,
          form_02_cs: form02CS,
          form_03: form03,
          form_04: form04,
          form_05: form05,
          form_06: form06,
          form_07: form07,
          form_07a: form07a,
          form_08: form08,
          form_08a: form08a,
          form_09: form09,
          form_10: form10,
          form_11: form11,
          form_12: form12,
          form_13: form13,
          form_14: form14,
          form_15: form15,
          form_16: form16,
          form_17: form17,
          form_18: form18,
          form_18a: form18a,
          form_19: form19,
          form_20: form20,
          form_21: form21,
          form_22: form22,
          form_23: form23,
          form_24: form24,
          form_25: form25,
          form_26: form26,
          form_27: form27,
          form_28: form28,
          form_29: form29,
          form_30: form30,
          form_31: form31,
          form_9: form9,
          form_9a: form9a,
          other_forms: otherForms
        };
      } else if (patent.fer_filer_assgn === user?.full_name && patent.fer_filing_status === 0) {
        formData = {
          form_04: form04,
          form_13: form13,
          form_20: form20,
          other_forms: otherForms
        };
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
          if (formData) {
            Object.assign(updatedPatent, formData);
          }
        } else if (patent.cs_filer_assgn === user.full_name) {
          updatedPatent.cs_filing_status = 1;
          updatedPatent.cs_review_file_status = 1;
          if (formData) {
            Object.assign(updatedPatent, formData);
          }
        } else if (patent.fer_filer_assgn === user.full_name) {
          updatedPatent.fer_filing_status = 1;
          updatedPatent.fer_review_file_status = 1;
          if (formData) {
            Object.assign(updatedPatent, formData);
          }
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

  const getFormDialogTitle = (patent: Patent) => {
    if (patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 0) {
      return 'Provisional Specification Filing';
    } else if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
      return 'Complete Specification Filing';
    } else if (patent.fer_filer_assgn === user?.full_name && patent.fer_filing_status === 0) {
      return 'First Examination Report Filing';
    }
    return 'Patent Filing';
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
                        
                        <Button
                          size="sm"
                          onClick={() => handleShowFormsDialog(patent)}
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
      </Tabs>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPatent && getFormDialogTitle(selectedPatent)}</DialogTitle>
            <DialogDescription>
              {selectedPatent && (
                selectedPatent.ps_filer_assgn === user?.full_name && selectedPatent.ps_filing_status === 0
                  ? "Select the forms for Provisional Specification filing."
                  : selectedPatent.cs_filer_assgn === user?.full_name && selectedPatent.cs_filing_status === 0
                  ? "Select the forms for Complete Specification filing."
                  : "Select the forms that you have completed for this patent."
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedPatent && (
              <>
                {/* Provisional Specification Forms */}
                {(selectedPatent.ps_filer_assgn === user?.full_name && selectedPatent.ps_filing_status === 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form01" checked={form01} onCheckedChange={(checked) => setForm01(checked === true)} />
                      <Label htmlFor="form01">Form 01 - Application for Grant of Patent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form02_ps" checked={form02PS} onCheckedChange={(checked) => setForm02PS(checked === true)} />
                      <Label htmlFor="form02_ps">Form 02 - Provisional Specification</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form26" checked={form26} onCheckedChange={(checked) => setForm26(checked === true)} />
                      <Label htmlFor="form26">Form 26 - Power of Attorney</Label>
                    </div>
                  </div>
                )}

                {/* Complete Specification Forms */}
                {(selectedPatent.cs_filer_assgn === user?.full_name && selectedPatent.cs_filing_status === 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form01" checked={form01} onCheckedChange={(checked) => setForm01(checked === true)} />
                      <Label htmlFor="form01">Form 01 - Application for Grant of Patent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form02_cs" checked={form02CS} onCheckedChange={(checked) => setForm02CS(checked === true)} />
                      <Label htmlFor="form02_cs">Form 02 - Complete Specification</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form03" checked={form03} onCheckedChange={(checked) => setForm03(checked === true)} />
                      <Label htmlFor="form03">Form 03 - Statement Under Section 8</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form04" checked={form04} onCheckedChange={(checked) => setForm04(checked === true)} />
                      <Label htmlFor="form04">Form 04 - Request for Extension of Time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form05" checked={form05} onCheckedChange={(checked) => setForm05(checked === true)} />
                      <Label htmlFor="form05">Form 05 - Declaration as to Inventorship</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form06" checked={form06} onCheckedChange={(checked) => setForm06(checked === true)} />
                      <Label htmlFor="form06">Form 06 - Change in Applicant</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form07" checked={form07} onCheckedChange={(checked) => setForm07(checked === true)} />
                      <Label htmlFor="form07">Form 07 - Notice of Opposition</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form07a" checked={form07a} onCheckedChange={(checked) => setForm07a(checked === true)} />
                      <Label htmlFor="form07a">Form 07A - Opposition to Grant of Patent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form08" checked={form08} onCheckedChange={(checked) => setForm08(checked === true)} />
                      <Label htmlFor="form08">Form 08 - Mention of Inventor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form08a" checked={form08a} onCheckedChange={(checked) => setForm08a(checked === true)} />
                      <Label htmlFor="form08a">Form 8A - Certificate of Inventorship</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form09" checked={form09} onCheckedChange={(checked) => setForm09(checked === true)} />
                      <Label htmlFor="form09">Form 09 - Request for Publication</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form9" checked={form9} onCheckedChange={(checked) => setForm9(checked === true)} />
                      <Label htmlFor="form9">Form 9 - Complete Specification</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form9a" checked={form9a} onCheckedChange={(checked) => setForm9a(checked === true)} />
                      <Label htmlFor="form9a">Form 9A - PCT National Phase</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form10" checked={form10} onCheckedChange={(checked) => setForm10(checked === true)} />
                      <Label htmlFor="form10">Form 10 - Amendment of Patent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form11" checked={form11} onCheckedChange={(checked) => setForm11(checked === true)} />
                      <Label htmlFor="form11">Form 11 - Application for Direction</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form12" checked={form12} onCheckedChange={(checked) => setForm12(checked === true)} />
                      <Label htmlFor="form12">Form 12 - Request Under Section 26(1)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form13" checked={form13} onCheckedChange={(checked) => setForm13(checked === true)} />
                      <Label htmlFor="form13">Form 13 - Request for Amendment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form14" checked={form14} onCheckedChange={(checked) => setForm14(checked === true)} />
                      <Label htmlFor="form14">Form 14 - Notice of Opposition</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form15" checked={form15} onCheckedChange={(checked) => setForm15(checked === true)} />
                      <Label htmlFor="form15">Form 15 - Application for Restoration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form16" checked={form16} onCheckedChange={(checked) => setForm16(checked === true)} />
                      <Label htmlFor="form16">Form 16 - Restoration of Title/Interest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form17" checked={form17} onCheckedChange={(checked) => setForm17(checked === true)} />
                      <Label htmlFor="form17">Form 17 - Compulsory Licence Application</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form18" checked={form18} onCheckedChange={(checked) => setForm18(checked === true)} />
                      <Label htmlFor="form18">Form 18 - Request for Examination</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form18a" checked={form18a} onCheckedChange={(checked) => setForm18a(checked === true)} />
                      <Label htmlFor="form18a">Form 18A - Fast Track Examination</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form19" checked={form19} onCheckedChange={(checked) => setForm19(checked === true)} />
                      <Label htmlFor="form19">Form 19 - Revocation for Non-Working</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form20" checked={form20} onCheckedChange={(checked) => setForm20(checked === true)} />
                      <Label htmlFor="form20">Form 20 - Revision of Terms</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form21" checked={form21} onCheckedChange={(checked) => setForm21(checked === true)} />
                      <Label htmlFor="form21">Form 21 - Termination of Licence</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form22" checked={form22} onCheckedChange={(checked) => setForm22(checked === true)} />
                      <Label htmlFor="form22">Form 22 - Registration of Patent Agent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form23" checked={form23} onCheckedChange={(checked) => setForm23(checked === true)} />
                      <Label htmlFor="form23">Form 23 - Restoration of Name</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form24" checked={form24} onCheckedChange={(checked) => setForm24(checked === true)} />
                      <Label htmlFor="form24">Form 24 - Review/Setting Aside</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form25" checked={form25} onCheckedChange={(checked) => setForm25(checked === true)} />
                      <Label htmlFor="form25">Form 25 - Permission for Application</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form26" checked={form26} onCheckedChange={(checked) => setForm26(checked === true)} />
                      <Label htmlFor="form26">Form 26 - Power of Attorney</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form27" checked={form27} onCheckedChange={(checked) => setForm27(checked === true)} />
                      <Label htmlFor="form27">Form 27 - Statement of Working</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form28" checked={form28} onCheckedChange={(checked) => setForm28(checked === true)} />
                      <Label htmlFor="form28">Form 28 - Small Entity/Startup</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form29" checked={form29} onCheckedChange={(checked) => setForm29(checked === true)} />
                      <Label htmlFor="form29">Form 29 - Withdrawal of Application</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form30" checked={form30} onCheckedChange={(checked) => setForm30(checked === true)} />
                      <Label htmlFor="form30">Form 30 - No Form Prescribed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form31" checked={form31} onCheckedChange={(checked) => setForm31(checked === true)} />
                      <Label htmlFor="form31">Form 31 - Grace Period</Label>
                    </div>
                  </div>
                )}

                {/* FER Forms */}
                {(selectedPatent.fer_filer_assgn === user?.full_name && selectedPatent.fer_filing_status === 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form04" checked={form04} onCheckedChange={(checked) => setForm04(checked === true)} />
                      <Label htmlFor="form04">Form 04 - Request for Extension of Time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form13" checked={form13} onCheckedChange={(checked) => setForm13(checked === true)} />
                      <Label htmlFor="form13">Form 13 - Request for Amendment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="form20" checked={form20} onCheckedChange={(checked) => setForm20(checked === true)} />
                      <Label htmlFor="form20">Form 20 - Revision of Terms</Label>
                    </div>
                  </div>
                )}

                <div className="col-span-full mt-4">
                  <Label htmlFor="otherForms">Other Forms / Notes</Label>
                  <Textarea 
                    id="otherForms" 
                    placeholder="Enter any additional forms or notes" 
                    value={otherForms} 
                    onChange={(e) => setOtherForms(e.target.value)} 
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </>
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
