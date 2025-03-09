import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import FormSelection from '@/components/patent/FormSelection';
import { fetchPatentsByFiler, updatePatentForms, submitFilingForReview } from '@/lib/api';
import { Patent, FEREntry } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Filings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [psFilings, setPsFilings] = useState<Patent[]>([]);
  const [csFilings, setCsFilings] = useState<Patent[]>([]);
  const [ferEntries, setFerEntries] = useState<FEREntry[]>([]);
  const [loadingPS, setLoadingPS] = useState(true);
  const [loadingCS, setLoadingCS] = useState(true);
  const [loadingFER, setLoadingFER] = useState(true);
  const [selectedPatentId, setSelectedPatentId] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingForms, setIsSavingForms] = useState(false);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  useEffect(() => {
    if (user?.email) {
      fetchPSFilings(user.email);
      fetchCSFilings(user.email);
      fetchFERFilings(user.email);
    }
  }, [user]);
  
  const fetchPSFilings = async (email: string) => {
    setLoadingPS(true);
    try {
      const response = await fetchPatentsByFiler(email, 'ps');
      if (response && response.patents) {
        setPsFilings(response.patents);
      } else {
        toast.error('Failed to load PS filing tasks');
      }
    } catch (error) {
      console.error('Error fetching PS filings:', error);
      toast.error('Failed to load PS filing tasks');
    } finally {
      setLoadingPS(false);
    }
  };
  
  const fetchCSFilings = async (email: string) => {
    setLoadingCS(true);
    try {
      const response = await fetchPatentsByFiler(email, 'cs');
      if (response && response.patents) {
        setCsFilings(response.patents);
      } else {
        toast.error('Failed to load CS filing tasks');
      }
    } catch (error) {
      console.error('Error fetching CS filings:', error);
      toast.error('Failed to load CS filing tasks');
    } finally {
      setLoadingCS(false);
    }
  };
  
  const fetchFERFilings = async (email: string) => {
    setLoadingFER(true);
    try {
      const response = await fetchPatentsByFiler(email, 'fer');
      if (response && response.ferEntries) {
        setFerEntries(response.ferEntries);
      } else {
        toast.error('Failed to load FER filing tasks');
      }
    } catch (error) {
      console.error('Error fetching FER filings:', error);
      toast.error('Failed to load FER filing tasks');
    } finally {
      setLoadingFER(false);
    }
  };
  
  const handleStartFiling = (patentId: string, type: 'ps' | 'cs') => {
    setSelectedPatentId(patentId);
    setIsFormDialogOpen(true);
  };
  
  const handleStartFERFiling = (ferId: string) => {
    // Find the patent ID associated with the FER entry
    const ferEntry = ferEntries.find(fer => fer.id === ferId);
    if (ferEntry && ferEntry.patent_id) {
      setSelectedPatentId(ferEntry.patent_id);
      setIsFormDialogOpen(true);
    } else {
      toast.error('Patent ID not found for this FER entry.');
    }
  };
  
  const handleSaveForms = async (forms: Record<string, boolean>) => {
    if (!selectedPatentId) {
      toast.error('No patent selected');
      return;
    }
    
    setIsSavingForms(true);
    try {
      const success = await updatePatentForms(selectedPatentId, forms);
      if (success) {
        toast.success('Forms updated successfully');
        setIsFormDialogOpen(false);
        // Refresh filings after saving forms
        if (user?.email) {
          fetchPSFilings(user.email);
          fetchCSFilings(user.email);
          fetchFERFilings(user.email);
        }
      } else {
        toast.error('Failed to update forms');
      }
    } catch (error) {
      console.error('Error updating forms:', error);
      toast.error('Failed to update forms');
    } finally {
      setIsSavingForms(false);
    }
  };
  
  const handleSubmitForReview = async () => {
    if (!selectedPatentId) {
      toast.error('No patent selected');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await submitFilingForReview(selectedPatentId);
      if (success) {
        toast.success('Patent submitted for review');
        setIsFormDialogOpen(false);
        // Refresh filings after submission
        if (user?.email) {
          fetchPSFilings(user.email);
          fetchCSFilings(user.email);
          fetchFERFilings(user.email);
        }
      } else {
        toast.error('Failed to submit patent for review');
      }
    } catch (error) {
      console.error('Error submitting patent for review:', error);
      toast.error('Failed to submit patent for review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Filing Tasks" 
        description="Manage and track your assigned patent filing tasks"
      />
      
      <Tabs defaultValue="ps">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ps">PS Filings</TabsTrigger>
          <TabsTrigger value="cs">CS Filings</TabsTrigger>
          <TabsTrigger value="fer">FER Filings</TabsTrigger>
        </TabsList>
        
        {/* PS Filing Tab */}
        <TabsContent value="ps">
          {loadingPS ? (
            <LoadingState message="Loading provisional specification filing tasks..." />
          ) : (
            psFilings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {psFilings.map(patent => (
                  <Card key={patent.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-1">{patent.patent_title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        ID: {patent.tracking_id}
                        {patent.ps_review_file_status === 1 && (
                          <Badge variant="warning">Under Review</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="font-medium">
                            {patent.ps_filer_deadline ? format(new Date(patent.ps_filer_deadline), 'dd MMM yyyy') : 'No deadline set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">
                            {patent.ps_filing_status === 1 ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="default"
                        onClick={() => handleStartFiling(patent.id, 'ps')}
                        disabled={patent.ps_review_file_status === 1}
                      >
                        File PS
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => navigate(`/patents/${patent.id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No PS Filing Tasks" 
                description="You don't have any provisional specification filing tasks assigned to you." 
                icon="FileText"
              />
            )
          )}
        </TabsContent>
        
        {/* CS Filing Tab */}
        <TabsContent value="cs">
          {loadingCS ? (
            <LoadingState message="Loading complete specification filing tasks..." />
          ) : (
            csFilings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {csFilings.map(patent => (
                  <Card key={patent.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-1">{patent.patent_title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        ID: {patent.tracking_id}
                        {patent.cs_review_file_status === 1 && (
                          <Badge variant="warning">Under Review</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="font-medium">
                            {patent.cs_filer_deadline ? format(new Date(patent.cs_filer_deadline), 'dd MMM yyyy') : 'No deadline set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">
                            {patent.cs_filing_status === 1 ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="default"
                        onClick={() => handleStartFiling(patent.id, 'cs')}
                        disabled={patent.cs_review_file_status === 1}
                      >
                        File CS
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => navigate(`/patents/${patent.id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No CS Filing Tasks" 
                description="You don't have any complete specification filing tasks assigned to you." 
                icon="FileText"
              />
            )
          )}
        </TabsContent>
        
        {/* FER Filing Tab */}
        <TabsContent value="fer">
          {loadingFER ? (
            <LoadingState message="Loading FER filing tasks..." />
          ) : (
            ferEntries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ferEntries.map(fer => (
                  <Card key={fer.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-1">
                        {fer.patent?.patent_title || "FER filing task"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        FER #{fer.fer_number}
                        {fer.fer_review_file_status === 1 && (
                          <Badge variant="warning">Under Review</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="font-medium">
                            {fer.fer_filer_deadline ? format(new Date(fer.fer_filer_deadline), 'dd MMM yyyy') : 'No deadline set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">
                            {fer.fer_filing_status === 1 ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="default"
                        onClick={() => handleStartFERFiling(fer.id)}
                        disabled={fer.fer_review_file_status === 1}
                      >
                        File FER
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => navigate(`/patents/${fer.patent_id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No FER Filing Tasks" 
                description="You don't have any first examination report filing tasks assigned to you." 
                icon="FileText"
              />
            )
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialog for selecting forms */}
      {selectedPatentId && (
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Select Required Forms</DialogTitle>
              <DialogDescription>
                Choose the necessary forms for this filing.
              </DialogDescription>
            </DialogHeader>
            <FormSelection 
              patentId={selectedPatentId}
              onSaveForms={handleSaveForms}
              isLoading={isSavingForms}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={isSubmitting} onClick={handleSubmitForReview}>
                {isSubmitting ? (
                  <span className="animate-spin mr-2">⟳</span>
                ) : null}
                Submit for Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Filings;
