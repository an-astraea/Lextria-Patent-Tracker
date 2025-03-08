import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, completeFilerTask } from '@/lib/api';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from 'date-fns';

const Filings = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Patent[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [formValues, setFormValues] = useState({
    form_26: false,
    form_18: false,
    form_18a: false,
    form_09: false,
    form_09a: false,
    form_13: false,
  });

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues(prev => ({ ...prev, [name]: checked }));
  };

  const handleOpenConfirmation = (patent: Patent) => {
    setSelectedPatent(patent);
    setFormValues({
      form_26: patent.form_26 || false,
      form_18: patent.form_18 || false,
      form_18a: patent.form_18a || false,
      form_09: patent.form_09 || false,
      form_09a: patent.form_09a || false,
      form_13: patent.form_13 || false,
    });
  };

  // Fix the formData type issue
  const handleCompleteFiling = async (patent: Patent) => {
    setIsCompleting(true);
    
    try {
      const selectedForms: Record<string, boolean> = {}; // Explicitly type as Record<string, boolean>
      
      // Add all form values to the formData object
      if (patent.cs_filer_assgn === user?.full_name) {
        // For CS filing, include form data
        Object.entries(formValues).forEach(([key, value]) => {
          selectedForms[key] = value;
        });
      }
      
      const success = await completeFilerTask(patent, user?.full_name || '', selectedForms);
      
      if (success) {
        toast.success("Filing task completed and submitted for review!");
        fetchAssignments();
      }
    } catch (error) {
      console.error("Error completing filing task:", error);
      toast.error("Failed to complete filing task");
    } finally {
      setIsCompleting(false);
      setSelectedPatent(null);
    }
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
                      <TableCell>
                        {patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 0 ? 'PS Filing' :
                          patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0 ? 'CS Filing' :
                            patent.fer_filer_assgn === user?.full_name && patent.fer_filing_status === 0 ? 'FER Filing' : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => handleOpenConfirmation(patent)}>
                              Complete Filing
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Complete Filing</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to complete the filing for {patent.patent_title}?
                              </DialogDescription>
                            </DialogHeader>
                            {patent.cs_filer_assgn === user?.full_name && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label htmlFor="form_26" className="text-right">
                                    Form 26
                                  </Label>
                                  <Checkbox id="form_26" checked={formValues.form_26} onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, form_26: !!checked }))} />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label htmlFor="form_18" className="text-right">
                                    Form 18
                                  </Label>
                                  <Checkbox id="form_18" checked={formValues.form_18} onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, form_18: !!checked }))} />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label htmlFor="form_18a" className="text-right">
                                    Form 18A
                                  </Label>
                                  <Checkbox id="form_18a" checked={formValues.form_18a} onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, form_18a: !!checked }))} />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label htmlFor="form_09" className="text-right">
                                    Form 09
                                  </Label>
                                  <Checkbox id="form_09" checked={formValues.form_09} onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, form_09: !!checked }))} />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label htmlFor="form_09a" className="text-right">
                                    Form 09A
                                  </Label>
                                  <Checkbox id="form_09a" checked={formValues.form_09a} onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, form_09a: !!checked }))} />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label htmlFor="form_13" className="text-right">
                                    Form 13
                                  </Label>
                                  <Checkbox id="form_13" checked={formValues.form_13} onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, form_13: !!checked }))} />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button
                                type="submit"
                                disabled={isCompleting}
                                onClick={() => handleCompleteFiling(patent)}
                              >
                                {isCompleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Completing...
                                  </>
                                ) : (
                                  "Complete Filing"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedAssignments.map((patent) => (
                    <TableRow key={patent.id}>
                      <TableCell>{patent.tracking_id}</TableCell>
                      <TableCell>{patent.patent_title}</TableCell>
                      <TableCell>{patent.patent_applicant}</TableCell>
                      <TableCell>
                        {patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 1 ? 'PS Filing' :
                          patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 1 ? 'CS Filing' :
                            patent.fer_filer_assgn === user?.full_name && patent.fer_filing_status === 1 ? 'FER Filing' : 'N/A'}
                      </TableCell>
                      <TableCell>{format(new Date(patent.updated_at), 'yyyy-MM-dd')}</TableCell>
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
    </div>
  );
};

export default Filings;
