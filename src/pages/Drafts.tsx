import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import { fetchPatentsByDrafter, submitDraftForReview } from '@/lib/api';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Check, Clock, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Drafts = () => {
  const [psDrafts, setPSDrafts] = useState<Patent[]>([]);
  const [csDrafts, setCSDrafts] = useState<Patent[]>([]);
  const [ferDrafts, setFERDrafts] = useState<Patent[]>([]);
  const [loadingPS, setLoadingPS] = useState(true);
  const [loadingCS, setLoadingCS] = useState(true);
  const [loadingFER, setLoadingFER] = useState(true);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const navigate = useNavigate();
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Fetch drafts on mount
  useEffect(() => {
    fetchDrafts();
  }, [user]);
  
  const fetchDrafts = async () => {
    if (!user) {
      toast.error('User not found. Please log in.');
      return;
    }
    
    try {
      setLoadingPS(true);
      setLoadingCS(true);
      setLoadingFER(true);
      
      const psResponse = await fetchPatentsByDrafter(user.full_name, 'ps');
      if (psResponse && psResponse.patents) {
        setPSDrafts(psResponse.patents);
      } else {
        toast.error('Failed to load PS drafts');
      }
      
      const csResponse = await fetchPatentsByDrafter(user.full_name, 'cs');
      if (csResponse && csResponse.patents) {
        setCSDrafts(csResponse.patents);
      } else {
        toast.error('Failed to load CS drafts');
      }
      
      const ferResponse = await fetchPatentsByDrafter(user.full_name, 'fer');
        if (ferResponse && ferResponse.patents) {
          setFERDrafts(ferResponse.patents);
        } else {
          toast.error('Failed to load FER drafts');
        }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setLoadingPS(false);
      setLoadingCS(false);
      setLoadingFER(false);
    }
  };
  
  const handleOpenDialog = (patent: Patent) => {
    setSelectedPatent(patent);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setReviewNotes('');
    setSelectedPatent(null);
  };
  
  const handleSubmitForReview = async () => {
    if (!selectedPatent) {
      toast.error('No patent selected for review.');
      return;
    }
    
    try {
      // Determine the workflow stage based on the selected tab
      let workflowStage = '';
      if (psDrafts.find(p => p.id === selectedPatent.id)) {
        workflowStage = 'ps';
      } else if (csDrafts.find(p => p.id === selectedPatent.id)) {
        workflowStage = 'cs';
      } else if (ferDrafts.find(p => p.id === selectedPatent.id)) {
        workflowStage = 'fer';
      }
      
      // Submit the draft for review
      const success = await submitDraftForReview(selectedPatent.id, workflowStage, reviewNotes);
      if (success) {
        toast.success('Draft submitted for review successfully!');
        fetchDrafts(); // Refresh drafts
      } else {
        toast.error('Failed to submit draft for review.');
      }
    } catch (error) {
      console.error('Error submitting draft for review:', error);
      toast.error('Failed to submit draft for review.');
    } finally {
      handleCloseDialog();
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Drafting Tasks" 
        description="Manage and track your assigned patent drafting tasks"
      />
      
      <Tabs defaultValue="ps">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ps">PS Drafts</TabsTrigger>
          <TabsTrigger value="cs">CS Drafts</TabsTrigger>
          <TabsTrigger value="fer">FER Drafts</TabsTrigger>
        </TabsList>
        
        {/* PS Drafting Tab */}
        <TabsContent value="ps">
          {loadingPS ? (
            <LoadingState message="Loading provisional specification drafting tasks..." />
          ) : (
            psDrafts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {psDrafts.map(patent => (
                  <Card key={patent.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-1">{patent.patent_title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        ID: {patent.tracking_id}
                        {patent.ps_review_draft_status === 1 && (
                          <Badge variant="warning">Under Review</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="font-medium">
                            {patent.ps_drafter_deadline ? format(new Date(patent.ps_drafter_deadline), 'dd MMM yyyy') : 'No deadline set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">
                            {patent.ps_drafting_status === 1 ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => navigate(`/patents/${patent.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={() => handleOpenDialog(patent)}
                        disabled={patent.ps_review_draft_status === 1}
                      >
                        Submit for Review
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No PS Drafting Tasks" 
                description="You don't have any provisional specification drafting tasks assigned to you."
                icon="FileText"
                buttonText="Refresh Tasks"
                onButtonClick={fetchDrafts}
              />
            )
          )}
        </TabsContent>
        
        {/* CS Drafting Tab */}
        <TabsContent value="cs">
          {loadingCS ? (
            <LoadingState message="Loading complete specification drafting tasks..." />
          ) : (
            csDrafts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {csDrafts.map(patent => (
                  <Card key={patent.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-1">{patent.patent_title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        ID: {patent.tracking_id}
                        {patent.cs_review_draft_status === 1 && (
                          <Badge variant="warning">Under Review</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="font-medium">
                            {patent.cs_drafter_deadline ? format(new Date(patent.cs_drafter_deadline), 'dd MMM yyyy') : 'No deadline set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">
                            {patent.cs_drafting_status === 1 ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => navigate(`/patents/${patent.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={() => handleOpenDialog(patent)}
                        disabled={patent.cs_review_draft_status === 1}
                      >
                        Submit for Review
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No CS Drafting Tasks" 
                description="You don't have any complete specification drafting tasks assigned to you."
                icon="FileText"
                buttonText="Refresh Tasks"
                onButtonClick={fetchDrafts}
              />
            )
          )}
        </TabsContent>
        
        {/* FER Drafting Tab */}
        <TabsContent value="fer">
          {loadingFER ? (
            <LoadingState message="Loading FER drafting tasks..." />
          ) : (
            ferDrafts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ferDrafts.map(patent => (
                  <Card key={patent.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-1">{patent.patent_title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        ID: {patent.tracking_id}
                        {patent.fer_review_draft_status === 1 && (
                          <Badge variant="warning">Under Review</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="font-medium">
                            {patent.fer_drafter_deadline ? format(new Date(patent.fer_drafter_deadline), 'dd MMM yyyy') : 'No deadline set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">
                            {patent.fer_drafter_status === 1 ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => navigate(`/patents/${patent.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={() => handleOpenDialog(patent)}
                        disabled={patent.fer_review_draft_status === 1}
                      >
                        Submit for Review
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No FER Drafting Tasks" 
                description="You don't have any first examination report drafting tasks assigned to you."
                icon="FileText"
                buttonText="Refresh Tasks"
                onButtonClick={fetchDrafts}
              />
            )
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Draft for Review</DialogTitle>
            <DialogDescription>
              Add any notes or comments for the reviewer before submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="review-notes">Review Notes</Label>
              <Textarea 
                id="review-notes" 
                value={reviewNotes} 
                onChange={(e) => setReviewNotes(e.target.value)} 
                placeholder="Enter any notes for the reviewer..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmitForReview}>
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Drafts;
