
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, FileCheck, Loader2 } from 'lucide-react';
import { 
  fetchFilerAssignments, 
  fetchFilerCompletedAssignments, 
  completeFilerTask, 
  updatePatentForms,
  fetchFilerFERAssignments,
  completeFERFilerTask
} from '@/lib/api';
import { FEREntry, Patent } from '@/lib/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from 'date-fns';
import FormRequirementsList from '@/components/patent/FormRequirementsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Filings = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Patent[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<Patent[]>([]);
  const [ferAssignments, setFERAssignments] = useState<FEREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [selectedFER, setSelectedFER] = useState<FEREntry | null>(null);
  const [viewingForms, setViewingForms] = useState(false);
  const [activeTab, setActiveTab] = useState("patents");

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchAssignments = async () => {
    if (user?.full_name) {
      setLoading(true);
      try {
        const assigned = await fetchFilerAssignments(user.full_name);
        setAssignments(assigned);
        
        const completed = await fetchFilerCompletedAssignments(user.full_name);
        setCompletedAssignments(completed);
        
        const ferAssigned = await fetchFilerFERAssignments(user.full_name);
        setFERAssignments(ferAssigned);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast.error("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const handleUpdateForm = async (formName: string, value: boolean) => {
    if (selectedPatent) {
      try {
        // Create an object with just the updated form
        const formUpdates: Record<string, boolean> = {
          [formName]: value
        };
        
        // Send the update to the server
        await updatePatentForms(selectedPatent.id, formUpdates);
        
        // Update the local state to reflect the changes
        setSelectedPatent(prev => {
          if (!prev) return null;
          return {
            ...prev,
            [formName]: value
          };
        });
        
        toast.success(`Form ${formName} updated successfully`);
      } catch (error) {
        console.error("Error updating form:", error);
        toast.error("Failed to update form");
      }
    }
  };

  const handleCompleteWithForms = async () => {
    if (!selectedPatent) return;
    
    setIsCompleting(true);
    
    try {
      // Extract all form values from the selectedPatent
      const formFields: Record<string, boolean> = {};
      
      // We check for form fields from 01 to 31, and the special cases
      for (let i = 1; i <= 31; i++) {
        const formNum = i < 10 ? `0${i}` : `${i}`;
        const formKey = `form_${formNum}` as keyof Patent;
        
        if (selectedPatent[formKey] !== undefined) {
          formFields[formKey] = !!selectedPatent[formKey];
        }
      }
      
      // Add special form_02 cases
      if (selectedPatent.form_02_ps !== undefined) {
        formFields.form_02_ps = !!selectedPatent.form_02_ps;
      }
      if (selectedPatent.form_02_cs !== undefined) {
        formFields.form_02_cs = !!selectedPatent.form_02_cs;
      }
      
      // Special form suffixes
      ['a'].forEach(suffix => {
        for (let i = 1; i <= 31; i++) {
          const formNum = i < 10 ? `0${i}` : `${i}`;
          const formKey = `form_${formNum}${suffix}` as keyof Patent;
          
          if (selectedPatent[formKey] !== undefined) {
            formFields[formKey] = !!selectedPatent[formKey];
          }
        }
      });
      
      const success = await completeFilerTask(selectedPatent, user?.full_name || '', formFields);
      
      if (success) {
        toast.success("Filing task completed and submitted for review!");
        setViewingForms(false);
        fetchAssignments();
      }
    } catch (error) {
      console.error("Error completing filing task:", error);
      toast.error("Failed to complete filing task");
    } finally {
      setIsCompleting(false);
    }
  };
  
  const handleCompleteFER = async () => {
    if (!selectedFER) return;
    
    setIsCompleting(true);
    
    try {
      const success = await completeFERFilerTask(selectedFER, user?.full_name || '');
      
      if (success) {
        toast.success("FER filing task completed and submitted for review!");
        setViewingForms(false);
        fetchAssignments();
      }
    } catch (error) {
      console.error("Error completing FER filing task:", error);
      toast.error("Failed to complete FER filing task");
    } finally {
      setIsCompleting(false);
    }
  };
  
  const handleOpenFormsDialog = (patent: Patent) => {
    setSelectedPatent(patent);
    setSelectedFER(null);
    setViewingForms(true);
  };
  
  const handleOpenFERDialog = (ferEntry: FEREntry) => {
    setSelectedFER(ferEntry);
    setSelectedPatent(null);
    setViewingForms(true);
  };

  const getPatentStage = (patent: Patent, userName: string) => {
    if (patent.ps_filer_assgn === userName && patent.ps_filing_status === 0) return 'PS Filing';
    if (patent.cs_filer_assgn === userName && patent.cs_filing_status === 0) return 'CS Filing';
    if (patent.fer_filer_assgn === userName && patent.fer_filing_status === 0) return 'FER Filing';
    if (patent.ps_filer_assgn === userName && patent.ps_filing_status === 1) return 'PS Filing';
    if (patent.cs_filer_assgn === userName && patent.cs_filing_status === 1) return 'CS Filing';
    if (patent.fer_filer_assgn === userName && patent.fer_filing_status === 1) return 'FER Filing';
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Loading assignments...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Filing Assignments</h1>
      
      <Tabs defaultValue="patents" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="patents">Patent Filings</TabsTrigger>
          <TabsTrigger value="fers">FER Filings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="patents" className="mt-6">
          {/* Regular Patent Assignments */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pending Patent Assignments</CardTitle>
              <CardDescription>List of patents awaiting your filing</CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <ScrollArea className="h-[300px] w-full rounded-md border">
                  <Table>
                    <TableCaption>A list of patents awaiting filing</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking ID</TableHead>
                        <TableHead>Patent Title</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((patent) => (
                        <TableRow key={patent.id}>
                          <TableCell>{patent.tracking_id}</TableCell>
                          <TableCell>{patent.patent_title}</TableCell>
                          <TableCell>{patent.patent_applicant}</TableCell>
                          <TableCell>{getPatentStage(patent, user?.full_name)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              onClick={() => handleOpenFormsDialog(patent)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> Forms
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-gray-500">No pending filing assignments</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Patent Assignments</CardTitle>
              <CardDescription>List of patents you have completed filing for</CardDescription>
            </CardHeader>
            <CardContent>
              {completedAssignments.length > 0 ? (
                <ScrollArea className="h-[300px] w-full rounded-md border">
                  <Table>
                    <TableCaption>A list of patents you have completed filing for</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking ID</TableHead>
                        <TableHead>Patent Title</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Completion Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedAssignments.map((patent) => (
                        <TableRow key={patent.id}>
                          <TableCell>{patent.tracking_id}</TableCell>
                          <TableCell>{patent.patent_title}</TableCell>
                          <TableCell>{patent.patent_applicant}</TableCell>
                          <TableCell>{getPatentStage(patent, user?.full_name)}</TableCell>
                          <TableCell>{format(new Date(patent.updated_at), 'yyyy-MM-dd')}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="secondary"
                              onClick={() => handleOpenFormsDialog(patent)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> Forms
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-gray-500">No completed filing assignments</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fers" className="mt-6">
          {/* FER Assignments */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pending FER Assignments</CardTitle>
              <CardDescription>List of FERs awaiting your filing</CardDescription>
            </CardHeader>
            <CardContent>
              {ferAssignments.length > 0 ? (
                <ScrollArea className="h-[300px] w-full rounded-md border">
                  <Table>
                    <TableCaption>A list of FERs awaiting filing</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patent</TableHead>
                        <TableHead>FER #</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ferAssignments.map((fer) => (
                        <TableRow key={fer.id}>
                          <TableCell>
                            {fer.patents ? fer.patents.patent_title : 'Unknown Patent'}
                          </TableCell>
                          <TableCell>{fer.fer_number}</TableCell>
                          <TableCell>
                            {fer.fer_filer_deadline 
                              ? format(new Date(fer.fer_filer_deadline), 'yyyy-MM-dd')
                              : 'Not set'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={fer.fer_drafter_status === 1 ? "success" : "secondary"}
                              className="mr-2"
                            >
                              Draft: {fer.fer_drafter_status === 1 ? "Ready" : "Pending"}
                            </Badge>
                            <Badge variant="secondary">
                              Filing: Pending
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              onClick={() => handleOpenFERDialog(fer)}
                              disabled={fer.fer_drafter_status !== 1}
                            >
                              <FileCheck className="h-4 w-4 mr-2" /> Complete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-gray-500">No pending FER filing assignments</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Patent Forms Dialog */}
      {selectedPatent && (
        <Dialog open={viewingForms} onOpenChange={setViewingForms}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Patent Forms - {selectedPatent.patent_title}</DialogTitle>
              <DialogDescription>
                {selectedPatent.ps_filing_status === 0 || selectedPatent.cs_filing_status === 0 || selectedPatent.fer_filing_status === 0 ? 
                  "Complete the required forms and submit for review" : 
                  "View the forms you have completed"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <FormRequirementsList 
                patent={selectedPatent} 
                userRole="filer"
                onUpdate={handleUpdateForm}
              />
            </div>
            
            <DialogFooter className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
              
              {(selectedPatent.ps_filing_status === 0 || selectedPatent.cs_filing_status === 0 || selectedPatent.fer_filing_status === 0) && (
                <Button
                  onClick={handleCompleteWithForms}
                  disabled={isCompleting}
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Complete & Submit for Review"
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* FER Dialog */}
      {selectedFER && (
        <Dialog open={viewingForms} onOpenChange={setViewingForms}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Complete FER Filing - FER #{selectedFER.fer_number}</DialogTitle>
              <DialogDescription>
                Mark this FER as completed and submit it for review
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">FER Number</p>
                  <p className="font-semibold">{selectedFER.fer_number}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">FER Date</p>
                  <p className="font-semibold">
                    {selectedFER.fer_date 
                      ? format(new Date(selectedFER.fer_date), 'yyyy-MM-dd') 
                      : 'Not set'}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Drafter</p>
                  <p className="font-semibold">{selectedFER.fer_drafter_assgn || 'Not assigned'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Draft Status</p>
                  <Badge variant={selectedFER.fer_drafter_status === 1 ? "success" : "secondary"}>
                    {selectedFER.fer_drafter_status === 1 ? "Completed" : "Pending"}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Filer</p>
                  <p className="font-semibold">{selectedFER.fer_filer_assgn || 'Not assigned'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Filer Deadline</p>
                  <p className="font-semibold">
                    {selectedFER.fer_filer_deadline 
                      ? format(new Date(selectedFER.fer_filer_deadline), 'yyyy-MM-dd') 
                      : 'Not set'}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-center mb-2 font-medium">Filing Confirmation</p>
                <p className="text-sm text-gray-600 text-center">
                  By clicking "Complete & Submit for Review", you confirm that you have completed 
                  all necessary filing work for this FER.
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
              
              <Button
                onClick={handleCompleteFER}
                disabled={isCompleting || selectedFER.fer_drafter_status !== 1}
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Complete & Submit for Review"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Filings;
