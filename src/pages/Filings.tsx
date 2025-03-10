import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, fetchFilerFERAssignments, completeFilerTask } from '@/lib/api';
import { FEREntry, Patent } from '@/lib/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormRequirementsList from '@/components/patent/FormRequirementsList';

const Filings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [completedPatents, setCompletedPatents] = useState<Patent[]>([]);
  const [ferEntries, setFEREntries] = useState<FEREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [selectedFER, setSelectedFER] = useState<FEREntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFERDialogOpen, setIsFERDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      const fetchData = async () => {
        try {
          const [patentsData, completedData, ferData] = await Promise.all([
            fetchFilerAssignments(parsedUser.full_name),
            fetchFilerCompletedAssignments(parsedUser.full_name),
            fetchFilerFERAssignments(parsedUser.full_name)
          ]);
          
          setPatents(patentsData);
          setCompletedPatents(completedData);
          setFEREntries(ferData);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load assignments');
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handlePatentClick = (patent: Patent) => {
    setSelectedPatent(patent);
    setIsDialogOpen(true);
    
    const initialFormData: Record<string, boolean> = {};
    for (let i = 1; i <= 31; i++) {
      const formKey = i < 10 ? `form_0${i}` : `form_${i}`;
      if (formKey in patent) {
        initialFormData[formKey] = !!patent[formKey as keyof Patent];
      }
    }
    
    if ('form_02_ps' in patent) {
      initialFormData['form_02_ps'] = !!patent.form_02_ps;
    }
    if ('form_02_cs' in patent) {
      initialFormData['form_02_cs'] = !!patent.form_02_cs;
    }
    
    ['form_07a', 'form_08a', 'form_09a', 'form_18a'].forEach(formKey => {
      if (formKey in patent) {
        initialFormData[formKey] = !!patent[formKey as keyof Patent];
      }
    });
    
    setFormData(initialFormData);
  };

  const handleFERClick = (fer: FEREntry) => {
    setSelectedFER(fer);
    setIsFERDialogOpen(true);
  };

  const handleFormChange = (formName: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [formName]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedPatent) return;
    
    setIsSubmitting(true);
    
    try {
      let filingType = '';
      
      if (selectedPatent.ps_filer_assgn === user.full_name && selectedPatent.ps_filing_status === 0) {
        filingType = 'PS';
      } else if (selectedPatent.cs_filer_assgn === user.full_name && selectedPatent.cs_filing_status === 0) {
        filingType = 'CS';
      } else if (selectedPatent.fer_filer_assgn === user.full_name && selectedPatent.fer_filing_status === 0) {
        filingType = 'FER';
      }
      
      const success = await completeFilerTask(
        selectedPatent, 
        user.full_name,
        filingType === 'CS' ? formData : undefined
      );
      
      if (success) {
        toast.success(`${filingType} filing completed successfully`);
        
        setPatents(prev => prev.filter(p => p.id !== selectedPatent.id));
        setCompletedPatents(prev => [selectedPatent, ...prev]);
        
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error completing filing:', error);
      toast.error('Failed to complete filing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFERSubmit = async () => {
    if (!selectedFER) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await completeFilerTask(
        selectedFER.patent as Patent, 
        user.full_name,
        undefined,
        selectedFER.id
      );
      
      if (success) {
        toast.success('FER filing completed successfully');
        
        setFEREntries(prev => prev.filter(fer => fer.id !== selectedFER.id));
        
        setIsFERDialogOpen(false);
      }
    } catch (error) {
      console.error('Error completing FER filing:', error);
      toast.error('Failed to complete FER filing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDeadlinePassed = (deadline: string | undefined | null) => {
    if (!deadline) return false;
    return isAfter(new Date(), parseISO(deadline));
  };

  const getPatentInfo = (fer: FEREntry) => {
    return fer.patent?.tracking_id || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Loading filing assignments...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">My Filing Assignments</h1>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending Filings ({patents.length})</TabsTrigger>
          <TabsTrigger value="fer">FER Filings ({ferEntries.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Filings ({completedPatents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {patents.length > 0 ? (
            <div className="grid gap-6">
              {patents.map(patent => {
                let filingType = '';
                let deadline = '';
                
                if (patent.ps_filer_assgn === user.full_name && patent.ps_filing_status === 0) {
                  filingType = 'PS';
                  deadline = patent.ps_filer_deadline;
                } else if (patent.cs_filer_assgn === user.full_name && patent.cs_filing_status === 0) {
                  filingType = 'CS';
                  deadline = patent.cs_filer_deadline;
                } else if (patent.fer_filer_assgn === user.full_name && patent.fer_filing_status === 0) {
                  filingType = 'FER';
                  deadline = patent.fer_filer_deadline;
                }
                
                const isLate = isDeadlinePassed(deadline);
                
                return (
                  <Card key={patent.id} className={isLate ? "border-red-500" : ""}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          {patent.patent_title}
                          {isLate && (
                            <Badge variant="destructive" className="ml-2">
                              <AlertCircle className="h-3 w-3 mr-1" /> Overdue
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Tracking ID: {patent.tracking_id} | Client: {patent.patent_applicant}
                        </CardDescription>
                      </div>
                      <Badge>{filingType} Filing</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Deadline</div>
                          <div className="font-semibold">
                            {deadline ? format(new Date(deadline), 'PPP') : 'Not set'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Application No</div>
                          <div className="font-semibold">{patent.application_no || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => navigate(`/patents/${patent.id}`)}>
                          View Details
                        </Button>
                        <Button onClick={() => handlePatentClick(patent)}>
                          Complete Filing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-xl font-medium">No pending filing assignments</p>
                <p className="text-gray-500">You're all caught up!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="fer">
          {ferEntries.length > 0 ? (
            <div className="grid gap-6">
              {ferEntries.map(fer => {
                const isLate = isDeadlinePassed(fer.fer_filer_deadline);
                
                return (
                  <Card key={fer.id} className={isLate ? "border-red-500" : ""}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          {getPatentInfo(fer)}
                          {isLate && (
                            <Badge variant="destructive" className="ml-2">
                              <AlertCircle className="h-3 w-3 mr-1" /> Overdue
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          FER #{fer.fer_number} | Tracking ID: {getPatentInfo(fer)}
                        </CardDescription>
                      </div>
                      <Badge>FER Filing</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Deadline</div>
                          <div className="font-semibold">
                            {fer.fer_filer_deadline ? format(new Date(fer.fer_filer_deadline), 'PPP') : 'Not set'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">FER Date</div>
                          <div className="font-semibold">
                            {fer.fer_date ? format(new Date(fer.fer_date), 'PPP') : 'Not set'}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => navigate(`/patents/${fer.patent_id}`)}>
                          View Patent
                        </Button>
                        <Button onClick={() => handleFERClick(fer)}>
                          Complete FER Filing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-xl font-medium">No pending FER filing assignments</p>
                <p className="text-gray-500">You're all caught up!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedPatents.length > 0 ? (
            <Table>
              <TableCaption>List of your completed filing assignments</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Patent Title</TableHead>
                  <TableHead>Filing Type</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedPatents.map(patent => {
                  let filingType = '';
                  
                  if (patent.ps_filer_assgn === user.full_name && patent.ps_filing_status === 1) {
                    filingType = 'PS';
                  } else if (patent.cs_filer_assgn === user.full_name && patent.cs_filing_status === 1) {
                    filingType = 'CS';
                  } else if (patent.fer_filer_assgn === user.full_name && patent.fer_filing_status === 1) {
                    filingType = 'FER';
                  }
                  
                  return (
                    <TableRow key={patent.id}>
                      <TableCell>{patent.tracking_id}</TableCell>
                      <TableCell>{patent.patent_title}</TableCell>
                      <TableCell>{filingType} Filing</TableCell>
                      <TableCell>{format(new Date(patent.updated_at), 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" onClick={() => navigate(`/patents/${patent.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-xl font-medium">No completed filing assignments yet</p>
                <p className="text-gray-500">Your completed filings will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Complete Filing</DialogTitle>
            <DialogDescription>
              Confirm that you have completed the filing for this patent
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Patent Title</div>
                  <div className="font-semibold">{selectedPatent.patent_title}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Tracking ID</div>
                  <div className="font-semibold">{selectedPatent.tracking_id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Client</div>
                  <div className="font-semibold">{selectedPatent.patent_applicant}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Application No</div>
                  <div className="font-semibold">{selectedPatent.application_no || 'N/A'}</div>
                </div>
              </div>
              
              {selectedPatent.cs_filer_assgn === user.full_name && selectedPatent.cs_filing_status === 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Form Requirements</h3>
                  <FormRequirementsList 
                    patent={selectedPatent} 
                    userRole="filer"
                    onUpdate={handleFormChange}
                    formValues={formData}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Complete Filing'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isFERDialogOpen} onOpenChange={setIsFERDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete FER Filing</DialogTitle>
            <DialogDescription>
              Confirm that you have completed the FER filing
            </DialogDescription>
          </DialogHeader>
          
          {selectedFER && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Patent Title</div>
                  <div className="font-semibold">{selectedFER.patent?.patent_title}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">FER Number</div>
                  <div className="font-semibold">FER #{selectedFER.fer_number}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">FER Date</div>
                  <div className="font-semibold">
                    {selectedFER.fer_date ? format(new Date(selectedFER.fer_date), 'PPP') : 'Not set'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Deadline</div>
                  <div className="font-semibold">
                    {selectedFER.fer_filer_deadline ? format(new Date(selectedFER.fer_filer_deadline), 'PPP') : 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFERDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFERSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Complete FER Filing'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Filings;
