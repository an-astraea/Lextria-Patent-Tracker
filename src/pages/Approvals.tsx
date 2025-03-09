
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPendingReviews, approvePatentReview, rejectPatentReview } from '@/lib/api';
import { Patent } from '@/lib/types';
import PageHeader from '@/components/common/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Info, Loader2, MessageCircle, X } from 'lucide-react';
import PatentCard from '@/components/PatentCard';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';

const Approvals = () => {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [currentPatent, setCurrentPatent] = useState<Patent | null>(null);
  const [currentReviewType, setCurrentReviewType] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Get user role and info from localStorage
  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role || '';
  
  useEffect(() => {
    const loadPendingReviews = async () => {
      try {
        setLoading(true);
        const response = await fetchPendingReviews();
        if (response.error) {
          toast.error('Failed to load pending reviews');
          setPatents([]);
        } else {
          setPatents(response.patents);
        }
      } catch (error) {
        console.error('Error loading pending reviews:', error);
        toast.error('An error occurred while loading pending reviews');
        setPatents([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadPendingReviews();
  }, []);
  
  const handleApprove = async (patent: Patent, reviewType: string) => {
    if (processingIds.has(patent.id)) return;
    
    setProcessingIds(new Set([...processingIds, patent.id]));
    try {
      const success = await approvePatentReview(patent.id, reviewType as any);
      if (success) {
        toast.success('Review approved successfully');
        // Remove the patent from the list if there are no more pending reviews
        setPatents(prev => {
          return prev.filter(p => {
            if (p.id !== patent.id) return true;
            
            // Check if there are any remaining reviews after this approval
            const hasMoreReviews = 
              (reviewType !== 'ps_draft' && p.ps_review_draft_status === 1) ||
              (reviewType !== 'ps_file' && p.ps_review_file_status === 1) ||
              (reviewType !== 'cs_draft' && p.cs_review_draft_status === 1) ||
              (reviewType !== 'cs_file' && p.cs_review_file_status === 1) ||
              (reviewType !== 'fer_draft' && p.fer_review_draft_status === 1) ||
              (reviewType !== 'fer_file' && p.fer_review_file_status === 1);
            
            return hasMoreReviews;
          });
        });
      } else {
        toast.error('Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('An error occurred while approving review');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(patent.id);
        return newSet;
      });
    }
  };
  
  const openRejectDialog = (patent: Patent, reviewType: string) => {
    setCurrentPatent(patent);
    setCurrentReviewType(reviewType);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };
  
  const handleReject = async () => {
    if (!currentPatent || !currentReviewType || processingIds.has(currentPatent.id)) return;
    
    setProcessingIds(new Set([...processingIds, currentPatent.id]));
    try {
      const success = await rejectPatentReview(currentPatent.id, currentReviewType as any, rejectionReason);
      if (success) {
        toast.success('Review rejected successfully');
        // Remove the patent from the list
        setPatents(prev => prev.filter(p => 
          p.id !== currentPatent.id || (
            (currentReviewType !== 'ps_draft' && p.ps_review_draft_status === 1) ||
            (currentReviewType !== 'ps_file' && p.ps_review_file_status === 1) ||
            (currentReviewType !== 'cs_draft' && p.cs_review_draft_status === 1) ||
            (currentReviewType !== 'cs_file' && p.cs_review_file_status === 1) ||
            (currentReviewType !== 'fer_draft' && p.fer_review_draft_status === 1) ||
            (currentReviewType !== 'fer_file' && p.fer_review_file_status === 1)
          )
        ));
        setRejectDialogOpen(false);
      } else {
        toast.error('Failed to reject review');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('An error occurred while rejecting review');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentPatent.id);
        return newSet;
      });
    }
  };
  
  // Filter patents based on the active tab
  const filteredPatents = patents.filter(patent => {
    if (activeTab === 'all') return true;
    if (activeTab === 'drafting') 
      return patent.ps_review_draft_status === 1 || patent.cs_review_draft_status === 1 || patent.fer_review_draft_status === 1;
    if (activeTab === 'filing') 
      return patent.ps_review_file_status === 1 || patent.cs_review_file_status === 1 || patent.fer_review_file_status === 1;
    return true;
  });
  
  if (userRole !== 'admin') {
    return (
      <div className="space-y-6">
        <PageHeader title="Approvals" description="Approve or reject review requests" icon="CheckSquare" />
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            Only administrators can access the approvals page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader title="Approvals" description="Approve or reject review requests" icon="CheckSquare" />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Approvals</TabsTrigger>
          <TabsTrigger value="drafting">Drafting Reviews</TabsTrigger>
          <TabsTrigger value="filing">Filing Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <LoadingState message="Loading approval requests..." />
          ) : filteredPatents.length === 0 ? (
            <EmptyState 
              title="No pending approvals" 
              description="There are no pending reviews that require your attention." 
              icon="CheckCircle"
            />
          ) : (
            <>
              {filteredPatents.map(patent => (
                <Card key={patent.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 p-6">
                        <h3 className="text-lg font-semibold mb-2">{patent.patent_title}</h3>
                        <div className="text-sm text-muted-foreground mb-2">
                          ID: {patent.tracking_id} | Applicant: {patent.patent_applicant}
                        </div>
                        
                        {patent.ps_review_draft_status === 1 && (
                          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-600" />
                              <span>PS Draft needs review by admin</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-300 hover:bg-red-50"
                                onClick={() => openRejectDialog(patent, 'ps_draft')}
                                disabled={processingIds.has(patent.id)}
                              >
                                <X className="h-4 w-4 mr-1 text-red-500" /> Reject
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleApprove(patent, 'ps_draft')}
                                disabled={processingIds.has(patent.id)}
                              >
                                {processingIds.has(patent.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {patent.ps_review_file_status === 1 && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span>PS Filing needs review by admin</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-300 hover:bg-red-50"
                                onClick={() => openRejectDialog(patent, 'ps_file')}
                                disabled={processingIds.has(patent.id)}
                              >
                                <X className="h-4 w-4 mr-1 text-red-500" /> Reject
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleApprove(patent, 'ps_file')}
                                disabled={processingIds.has(patent.id)}
                              >
                                {processingIds.has(patent.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {patent.cs_review_draft_status === 1 && (
                          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-600" />
                              <span>CS Draft needs review by admin</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-300 hover:bg-red-50"
                                onClick={() => openRejectDialog(patent, 'cs_draft')}
                                disabled={processingIds.has(patent.id)}
                              >
                                <X className="h-4 w-4 mr-1 text-red-500" /> Reject
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleApprove(patent, 'cs_draft')}
                                disabled={processingIds.has(patent.id)}
                              >
                                {processingIds.has(patent.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {patent.cs_review_file_status === 1 && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span>CS Filing needs review by admin</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-300 hover:bg-red-50"
                                onClick={() => openRejectDialog(patent, 'cs_file')}
                                disabled={processingIds.has(patent.id)}
                              >
                                <X className="h-4 w-4 mr-1 text-red-500" /> Reject
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleApprove(patent, 'cs_file')}
                                disabled={processingIds.has(patent.id)}
                              >
                                {processingIds.has(patent.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {patent.fer_review_draft_status === 1 && (
                          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-600" />
                              <span>FER Draft needs review by admin</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-300 hover:bg-red-50"
                                onClick={() => openRejectDialog(patent, 'fer_draft')}
                                disabled={processingIds.has(patent.id)}
                              >
                                <X className="h-4 w-4 mr-1 text-red-500" /> Reject
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleApprove(patent, 'fer_draft')}
                                disabled={processingIds.has(patent.id)}
                              >
                                {processingIds.has(patent.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {patent.fer_review_file_status === 1 && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span>FER Filing needs review by admin</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-300 hover:bg-red-50"
                                onClick={() => openRejectDialog(patent, 'fer_file')}
                                disabled={processingIds.has(patent.id)}
                              >
                                <X className="h-4 w-4 mr-1 text-red-500" /> Reject
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleApprove(patent, 'fer_file')}
                                disabled={processingIds.has(patent.id)}
                              >
                                {processingIds.has(patent.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 p-6 flex flex-col justify-between">
                        <div>
                          <h4 className="font-medium mb-2">Patent Details</h4>
                          <div className="space-y-1 text-sm">
                            <div><span className="text-gray-500">Client ID:</span> {patent.client_id}</div>
                            <div><span className="text-gray-500">Application No:</span> {patent.application_no || 'N/A'}</div>
                            <div>
                              <span className="text-gray-500">Filing Date:</span> {patent.date_of_filing 
                                ? new Date(patent.date_of_filing).toLocaleDateString() 
                                : 'Not filed yet'}
                            </div>
                            <div>
                              <span className="text-gray-500">PS Drafter:</span> {patent.ps_drafter_assgn || 'Not assigned'}
                            </div>
                            <div>
                              <span className="text-gray-500">PS Filer:</span> {patent.ps_filer_assgn || 'Not assigned'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button variant="outline" className="w-full" asChild>
                            <a href={`/patents/${patent.id}`}>
                              View Full Details
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Review</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be sent to the assignee for correction.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processingIds.has(currentPatent?.id || '')}
            >
              {processingIds.has(currentPatent?.id || '') ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <X className="h-4 w-4 mr-1" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals;
