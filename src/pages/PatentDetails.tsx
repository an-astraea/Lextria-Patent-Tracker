
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { 
  fetchPatentById, 
  updatePatentNotes, 
  fetchPatentTimeline, 
  updatePatentForms,
  createFEREntry,
  updateFEREntry,
  deleteFEREntry
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import FormRequirementsList from '@/components/patent/FormRequirementsList';
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PatentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patent, setPatent] = useState<Patent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState('');
  const [isNotesSaving, setIsNotesSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [employees, setEmployees] = useState<any[]>([]);
  
  // FER Dialog state
  const [isFERDialogOpen, setIsFERDialogOpen] = useState(false);
  const [isEditingFER, setIsEditingFER] = useState(false);
  const [selectedFER, setSelectedFER] = useState<FEREntry | null>(null);
  const [ferDrafter, setFERDrafter] = useState('');
  const [ferDrafterDeadline, setFERDrafterDeadline] = useState('');
  const [ferFiler, setFERFiler] = useState('');
  const [ferFilerDeadline, setFERFilerDeadline] = useState('');
  const [ferDate, setFERDate] = useState('');
  const [isProcessingFER, setIsProcessingFER] = useState(false);
  
  // FER delete confirmation dialog
  const [deleteFERDialogOpen, setDeleteFERDialogOpen] = useState(false);
  const [ferToDelete, setFERToDelete] = useState<FEREntry | null>(null);

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');

    const fetchPatent = async () => {
      if (id) {
        try {
          const patentData = await fetchPatentById(id);
          if (patentData) {
            setPatent(patentData);
            setNotes(patentData.notes || '');
          } else {
            toast.error('Patent not found');
            navigate('/patents');
          }
        } catch (error) {
          console.error('Error fetching patent:', error);
          toast.error('Failed to load patent details');
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchTimelineData = async () => {
      if (id) {
        try {
          const timelineData = await fetchPatentTimeline(id);
          setTimeline(timelineData);
        } catch (error) {
          console.error('Error fetching patent timeline:', error);
          toast.error('Failed to load patent timeline');
        }
      }
    };
    
    const fetchAllEmployees = async () => {
      try {
        const { employees } = await fetchPatentsAndEmployees();
        setEmployees(employees);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchPatent();
    fetchTimelineData();
    fetchAllEmployees();
  }, [id, navigate]);

  const handleFormUpdate = async (formName: string, value: boolean) => {
    if (!patent || !id) return;
    
    setIsSaving(true);
    try {
      // Create an object with just the updated form field
      const formData: Record<string, boolean> = {
        [formName]: value
      };
      
      const success = await updatePatentForms(id, formData);
      if (success) {
        // Update local state to reflect the change
        setPatent(prev => {
          if (!prev) return null;
          return {
            ...prev,
            [formName]: value
          };
        });
        toast.success(`${formName.toUpperCase()} updated successfully`);
      }
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Failed to update form');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = async () => {
    if (!id) {
      toast.error('Patent ID is missing');
      return;
    }

    setIsNotesSaving(true);

    try {
      const success = await updatePatentNotes(id, notes);

      if (success) {
        toast.success('Notes updated successfully');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    } finally {
      setIsNotesSaving(false);
    }
  };
  
  const handleAddFER = () => {
    setIsEditingFER(false);
    setSelectedFER(null);
    setFERDrafter('');
    setFERDrafterDeadline('');
    setFERFiler('');
    setFERFilerDeadline('');
    setFERDate('');
    setIsFERDialogOpen(true);
  };
  
  const handleEditFER = (fer: FEREntry) => {
    setIsEditingFER(true);
    setSelectedFER(fer);
    setFERDrafter(fer.fer_drafter_assgn || '');
    setFERDrafterDeadline(fer.fer_drafter_deadline ? fer.fer_drafter_deadline.split('T')[0] : '');
    setFERFiler(fer.fer_filer_assgn || '');
    setFERFilerDeadline(fer.fer_filer_deadline ? fer.fer_filer_deadline.split('T')[0] : '');
    setFERDate(fer.fer_date ? fer.fer_date.split('T')[0] : '');
    setIsFERDialogOpen(true);
  };
  
  const handleDeleteFER = (fer: FEREntry) => {
    setFERToDelete(fer);
    setDeleteFERDialogOpen(true);
  };
  
  const confirmDeleteFER = async () => {
    if (!ferToDelete) return;
    
    try {
      const success = await deleteFEREntry(ferToDelete.id);
      if (success) {
        toast.success('FER entry deleted successfully');
        // Update local state to remove the deleted FER
        setPatent(prev => {
          if (!prev || !prev.fer_entries) return prev;
          return {
            ...prev,
            fer_entries: prev.fer_entries.filter(fer => fer.id !== ferToDelete.id)
          };
        });
      }
    } catch (error) {
      console.error('Error deleting FER entry:', error);
      toast.error('Failed to delete FER entry');
    } finally {
      setDeleteFERDialogOpen(false);
      setFERToDelete(null);
    }
  };
  
  const handleSaveFER = async () => {
    if (!id || !patent) return;
    setIsProcessingFER(true);
    
    try {
      if (isEditingFER && selectedFER) {
        // Update existing FER
        const ferData: Partial<FEREntry> = {
          fer_drafter_assgn: ferDrafter || null,
          fer_drafter_deadline: ferDrafterDeadline || null,
          fer_filer_assgn: ferFiler || null,
          fer_filer_deadline: ferFilerDeadline || null,
          fer_date: ferDate || null
        };
        
        const success = await updateFEREntry(selectedFER.id, ferData);
        if (success) {
          toast.success('FER updated successfully');
          
          // Update local state
          setPatent(prev => {
            if (!prev || !prev.fer_entries) return prev;
            
            const updatedFERs = prev.fer_entries.map(fer => 
              fer.id === selectedFER.id ? { ...fer, ...ferData } : fer
            );
            
            return {
              ...prev,
              fer_entries: updatedFERs
            };
          });
        }
      } else {
        // Create new FER
        const nextFERNumber = patent.fer_entries && patent.fer_entries.length > 0 
          ? Math.max(...patent.fer_entries.map(fer => fer.fer_number)) + 1 
          : 1;
        
        const newFER = await createFEREntry(
          id, 
          nextFERNumber, 
          ferDrafter, 
          ferDrafterDeadline,
          ferFiler,
          ferFilerDeadline
        );
        
        if (newFER) {
          toast.success('New FER created successfully');
          
          // Update local state
          setPatent(prev => {
            if (!prev) return prev;
            
            return {
              ...prev,
              fer_entries: [...(prev.fer_entries || []), newFER]
            };
          });
        }
      }
      
      // Close dialog
      setIsFERDialogOpen(false);
    } catch (error) {
      console.error('Error saving FER:', error);
      toast.error('Failed to save FER');
    } finally {
      setIsProcessingFER(false);
    }
  };

  // Check if user is allowed to edit forms (admin or filer)
  const canEditForms = userRole === 'admin' || userRole === 'filer';
  // Check if user is allowed to manage FERs (admin only)
  const canManageFERs = userRole === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Loading patent details...
      </div>
    );
  }

  if (!patent) {
    return <div className="text-red-500">Patent not found.</div>;
  }
  
  // Get drafters and filers for dropdown selection
  const drafters = employees.filter(emp => emp.role === 'drafter').map(emp => emp.full_name);
  const filers = employees.filter(emp => emp.role === 'filer').map(emp => emp.full_name);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Patent Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patent Information</CardTitle>
          <CardDescription>Details about the patent application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Tracking ID</div>
              <div className="font-semibold">{patent.tracking_id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Patent Applicant</div>
              <div className="font-semibold">{patent.patent_applicant}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Client ID</div>
              <div className="font-semibold">{patent.client_id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Application No</div>
              <div className="font-semibold">{patent.application_no || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Date of Filing</div>
              <div className="font-semibold">{patent.date_of_filing || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Patent Title</div>
              <div className="font-semibold">{patent.patent_title}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Applicant Address</div>
              <div className="font-semibold">{patent.applicant_addr}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Inventor Phone No</div>
              <div className="font-semibold">{patent.inventor_ph_no}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Inventor Email</div>
              <div className="font-semibold">{patent.inventor_email}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventors</CardTitle>
          <CardDescription>List of inventors associated with this patent</CardDescription>
        </CardHeader>
        <CardContent>
          {patent.inventors && patent.inventors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patent.inventors.map(inventor => (
                  <TableRow key={inventor.id}>
                    <TableCell>{inventor.inventor_name}</TableCell>
                    <TableCell>{inventor.inventor_addr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-gray-500">No inventors found for this patent.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patent Status</CardTitle>
          <CardDescription>Current status of each stage in the patent process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">PS Drafting Status</div>
              <Badge variant={patent.ps_drafting_status === 1 ? "success" : "secondary"}>
                {patent.ps_drafting_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">PS Filing Status</div>
              <Badge variant={patent.ps_filing_status === 1 ? "success" : "secondary"}>
                {patent.ps_filing_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">PS Completion Status</div>
              <Badge variant={patent.ps_completion_status === 1 ? "success" : "secondary"}>
                {patent.ps_completion_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">CS Drafting Status</div>
              <Badge variant={patent.cs_drafting_status === 1 ? "success" : "secondary"}>
                {patent.cs_drafting_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">CS Filing Status</div>
              <Badge variant={patent.cs_filing_status === 1 ? "success" : "secondary"}>
                {patent.cs_filing_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">CS Completion Status</div>
              <Badge variant={patent.cs_completion_status === 1 ? "success" : "secondary"}>
                {patent.cs_completion_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">FER Status</div>
              <Badge variant={patent.fer_status === 1 ? "success" : "secondary"}>
                {patent.fer_status === 1 ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* FER Entries Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>FER Entries</CardTitle>
            <CardDescription>First Examination Reports for this patent</CardDescription>
          </div>
          {canManageFERs && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddFER}
            >
              <Plus className="h-4 w-4 mr-1" /> Add FER
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {patent.fer_entries && patent.fer_entries.length > 0 ? (
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">FER #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Drafter</TableHead>
                    <TableHead>Filer</TableHead>
                    <TableHead>Draft Status</TableHead>
                    <TableHead>File Status</TableHead>
                    {canManageFERs && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patent.fer_entries.map((fer) => (
                    <TableRow key={fer.id}>
                      <TableCell className="font-medium">{fer.fer_number}</TableCell>
                      <TableCell>{fer.fer_date ? format(new Date(fer.fer_date), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{fer.fer_drafter_assgn || 'Not assigned'}</span>
                          <span className="text-xs text-gray-500">
                            {fer.fer_drafter_deadline ? 
                              `Due: ${format(new Date(fer.fer_drafter_deadline), 'yyyy-MM-dd')}` : 
                              ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{fer.fer_filer_assgn || 'Not assigned'}</span>
                          <span className="text-xs text-gray-500">
                            {fer.fer_filer_deadline ? 
                              `Due: ${format(new Date(fer.fer_filer_deadline), 'yyyy-MM-dd')}` : 
                              ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={fer.fer_drafter_status === 1 ? "success" : "secondary"}>
                          {fer.fer_drafter_status === 1 ? "Completed" : "Pending"}
                        </Badge>
                        {fer.fer_review_draft_status === 1 && (
                          <Badge variant="warning" className="ml-1">Under Review</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={fer.fer_filing_status === 1 ? "success" : "secondary"}>
                          {fer.fer_filing_status === 1 ? "Completed" : "Pending"}
                        </Badge>
                        {fer.fer_review_file_status === 1 && (
                          <Badge variant="warning" className="ml-1">Under Review</Badge>
                        )}
                      </TableCell>
                      {canManageFERs && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditFER(fer)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteFER(fer)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-gray-500 flex flex-col items-center justify-center py-8">
              <p className="mb-4">No FER entries found for this patent.</p>
              {canManageFERs && (
                <Button variant="outline" onClick={handleAddFER}>
                  <Plus className="h-4 w-4 mr-2" /> Add First FER
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Requirements Card */}
      <FormRequirementsList 
        patent={patent} 
        userRole={userRole} 
        onUpdate={canEditForms ? handleFormUpdate : undefined} 
      />

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Add or update notes for this patent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Textarea
                id="notes"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Type your notes here."
              />
            </div>
            <Button onClick={handleSaveNotes} disabled={isNotesSaving}>
              {isNotesSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Notes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>History of events for this patent</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <Table>
              <TableCaption>A list of events for the patent.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeline.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{format(new Date(event.created_at), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{event.event_type}</TableCell>
                    <TableCell>{event.event_description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* FER Dialog */}
      <Dialog open={isFERDialogOpen} onOpenChange={setIsFERDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditingFER ? 'Edit FER Entry' : 'Add New FER Entry'}</DialogTitle>
            <DialogDescription>
              {isEditingFER 
                ? `Update FER #${selectedFER?.fer_number} details` 
                : 'Create a new First Examination Report entry for this patent'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fer-date">FER Date</Label>
              <Input
                id="fer-date"
                type="date"
                value={ferDate}
                onChange={(e) => setFERDate(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fer-drafter">Drafter</Label>
              <Select value={ferDrafter} onValueChange={setFERDrafter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drafter" />
                </SelectTrigger>
                <SelectContent>
                  {drafters.length > 0 ? 
                    drafters.map(drafter => (
                      <SelectItem key={drafter} value={drafter}>{drafter}</SelectItem>
                    )) :
                    <SelectItem value="none" disabled>No drafters available</SelectItem>
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fer-drafter-deadline">Drafter Deadline</Label>
              <Input
                id="fer-drafter-deadline"
                type="date"
                value={ferDrafterDeadline}
                onChange={(e) => setFERDrafterDeadline(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fer-filer">Filer</Label>
              <Select value={ferFiler} onValueChange={setFERFiler}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filer" />
                </SelectTrigger>
                <SelectContent>
                  {filers.length > 0 ? 
                    filers.map(filer => (
                      <SelectItem key={filer} value={filer}>{filer}</SelectItem>
                    )) :
                    <SelectItem value="none" disabled>No filers available</SelectItem>
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fer-filer-deadline">Filer Deadline</Label>
              <Input
                id="fer-filer-deadline"
                type="date"
                value={ferFilerDeadline}
                onChange={(e) => setFERFilerDeadline(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFERDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFER} disabled={isProcessingFER}>
              {isProcessingFER ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditingFER ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditingFER ? 'Update FER' : 'Create FER'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete FER Confirmation Dialog */}
      <AlertDialog open={deleteFERDialogOpen} onOpenChange={setDeleteFERDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this FER?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete FER #{ferToDelete?.fer_number} 
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteFER} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Import missing function
import { fetchPatentsAndEmployees } from '@/lib/api';

export default PatentDetails;
