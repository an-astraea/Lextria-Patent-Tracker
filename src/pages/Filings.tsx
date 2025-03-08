
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, completeFilerTask, updatePatentForms } from '@/lib/api';
import { Patent } from '@/lib/types';
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

const Filings = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Patent[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [viewingForms, setViewingForms] = useState(false);

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
  
  const handleOpenFormsDialog = (patent: Patent) => {
    setSelectedPatent(patent);
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

      {/* Pending Assignments */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Assignments</CardTitle>
          <CardDescription>List of patents awaiting your filing.</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length > 0 ? (
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <Table>
                <TableCaption>A list of patents awaiting filing.</TableCaption>
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
                          View & Complete Forms
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <p className="text-gray-500">No pending filing assignments.</p>
          )}
        </CardContent>
      </Card>

      {/* Completed Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Assignments</CardTitle>
          <CardDescription>List of patents you have completed filing for.</CardDescription>
        </CardHeader>
        <CardContent>
          {completedAssignments.length > 0 ? (
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <Table>
                <TableCaption>A list of patents you have completed filing for.</TableCaption>
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
                          View Forms
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <p className="text-gray-500">No completed filing assignments.</p>
          )}
        </CardContent>
      </Card>

      {/* Form Requirements Dialog */}
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
    </div>
  );
};

export default Filings;
