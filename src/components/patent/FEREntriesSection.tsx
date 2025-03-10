
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent, FEREntry, Employee } from '@/lib/types';
import { PencilIcon, FileType, CheckCircleIcon, PlusCircleIcon, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createFEREntry, updateFEREntry, deleteFEREntry } from '@/lib/api';
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

interface FEREntriesSectionProps {
  patent: Patent;
  userRole: string;
  userName: string;
  employees: Employee[];
  refreshPatentData: () => Promise<void>;
  onApproveDraft: (fer: FEREntry) => Promise<void>;
  onApproveFiling: (fer: FEREntry) => Promise<void>;
  onCompleteDraft: (fer: FEREntry) => Promise<void>;
  onCompleteFiling: (fer: FEREntry) => Promise<void>;
}

const FEREntriesSection: React.FC<FEREntriesSectionProps> = ({
  patent,
  userRole,
  userName,
  employees,
  refreshPatentData,
  onApproveDraft,
  onApproveFiling,
  onCompleteDraft,
  onCompleteFiling
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingFER, setIsAddingFER] = useState(false);
  const [ferDrafter, setFERDrafter] = useState<string>('');
  const [ferDrafterDeadline, setFERDrafterDeadline] = useState<string>('');
  const [ferFiler, setFERFiler] = useState<string>('');
  const [ferFilerDeadline, setFERFilerDeadline] = useState<string>('');
  const [ferNumber, setFERNumber] = useState<number>(1);
  const [ferDate, setFERDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedFER, setSelectedFER] = useState<FEREntry | null>(null);
  const [ferToDelete, setFerToDelete] = useState<FEREntry | null>(null);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isApprovingDraft, setIsApprovingDraft] = useState(false);
  const [isApprovingFiling, setIsApprovingFiling] = useState(false);

  const drafters = employees.filter(emp => emp.role === 'drafter').map(emp => emp.full_name);
  const filers = employees.filter(emp => emp.role === 'filer').map(emp => emp.full_name);

  const handleAddFER = () => {
    setIsAddingFER(true);
    setSelectedFER(null);
    const nextFERNumber = patent.fer_entries?.length > 0 
      ? Math.max(...patent.fer_entries.map(fer => fer.fer_number || 0)) + 1 
      : 1;
    setFERNumber(nextFERNumber);
    setFERDrafter('');
    setFERDrafterDeadline('');
    setFERFiler('');
    setFERFilerDeadline('');
    setFERDate('');
    setIsDialogOpen(true);
  };

  const handleEditFER = (fer: FEREntry) => {
    setIsAddingFER(false);
    setSelectedFER(fer);
    setFERNumber(fer.fer_number || 1);
    setFERDrafter(fer.fer_drafter_assgn || '');
    setFERDrafterDeadline(fer.fer_drafter_deadline ? fer.fer_drafter_deadline.split('T')[0] : '');
    setFERFiler(fer.fer_filer_assgn || '');
    setFERFilerDeadline(fer.fer_filer_deadline ? fer.fer_filer_deadline.split('T')[0] : '');
    setFERDate(fer.fer_date ? fer.fer_date.split('T')[0] : '');
    setIsDialogOpen(true);
  };

  const handleDeleteFER = (fer: FEREntry) => {
    setFerToDelete(fer);
    setIsAlertDialogOpen(true);
  };

  const confirmDeleteFER = async () => {
    if (!ferToDelete) return;
    
    try {
      setIsSubmitting(true);
      const success = await deleteFEREntry(ferToDelete.id);
      if (success) {
        toast.success('FER entry deleted successfully');
        await refreshPatentData();
      } else {
        toast.error('Failed to delete FER entry');
      }
    } catch (error) {
      console.error('Error deleting FER entry:', error);
      toast.error('An error occurred while deleting the FER entry');
    } finally {
      setIsSubmitting(false);
      setIsAlertDialogOpen(false);
      setFerToDelete(null);
    }
  };

  const handleSaveFER = async () => {
    if (!patent.id) return;
    
    try {
      setIsSubmitting(true);
      
      if (isAddingFER) {
        // Create new FER entry
        const newFER = await createFEREntry(
          patent.id,
          ferNumber,
          ferDrafter,
          ferDrafterDeadline,
          ferFiler,
          ferFilerDeadline,
          ferDate
        );
        
        if (newFER) {
          toast.success('FER entry created successfully');
          await refreshPatentData();
        } else {
          toast.error('Failed to create FER entry');
        }
      } else if (selectedFER) {
        // Update existing FER entry
        const ferData: Partial<FEREntry> = {
          fer_number: ferNumber,
          fer_drafter_assgn: ferDrafter || null,
          fer_drafter_deadline: ferDrafterDeadline || null,
          fer_filer_assgn: ferFiler || null,
          fer_filer_deadline: ferFilerDeadline || null,
          fer_date: ferDate || null
        };
        
        const success = await updateFEREntry(selectedFER.id, ferData);
        
        if (success) {
          toast.success('FER entry updated successfully');
          await refreshPatentData();
        } else {
          toast.error('Failed to update FER entry');
        }
      }
    } catch (error) {
      console.error('Error saving FER entry:', error);
      toast.error('An error occurred while saving the FER entry');
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  const handleCompleteDraft = async (fer: FEREntry) => {
    await onCompleteDraft(fer);
  };

  const handleCompleteFiling = async (fer: FEREntry) => {
    await onCompleteFiling(fer);
  };

  const handleApproveDraft = async (fer: FEREntry) => {
    setIsApprovingDraft(true);
    try {
      await onApproveDraft(fer);
    } finally {
      setIsApprovingDraft(false);
    }
  };

  const handleApproveFiling = async (fer: FEREntry) => {
    setIsApprovingFiling(true);
    try {
      await onApproveFiling(fer);
    } finally {
      setIsApprovingFiling(false);
    }
  };

  const canCompleteDraft = (fer: FEREntry) => {
    return userName === fer.fer_drafter_assgn && fer.fer_drafter_status === 0;
  };

  const canCompleteFiling = (fer: FEREntry) => {
    return userName === fer.fer_filer_assgn && fer.fer_filing_status === 0 && fer.fer_drafter_status === 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">First Examination Reports (FER)</h2>
        {userRole === 'admin' && (
          <Button onClick={handleAddFER}>
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Add FER Entry
          </Button>
        )}
      </div>
      
      {patent.fer_entries && patent.fer_entries.length > 0 ? (
        <div className="space-y-6">
          {patent.fer_entries.map((fer) => (
            <Card key={fer.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">FER #{fer.fer_number || 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    {fer.fer_date && (
                      <Badge variant="outline">
                        Date: {format(new Date(fer.fer_date), 'dd MMM yyyy')}
                      </Badge>
                    )}
                    
                    {userRole === 'admin' && (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditFER(fer)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteFER(fer)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Drafting Status</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant={fer.fer_drafter_status === 1 ? "success" : "default"}>
                            {fer.fer_drafter_status === 1 ? "Completed" : "Pending"}
                          </Badge>
                          <Badge variant={fer.fer_review_draft_status === 1 ? "success" : "default"} className="ml-2">
                            {fer.fer_review_draft_status === 1 ? "Approved" : "Not Approved"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {canCompleteDraft(fer) && (
                            <Button size="sm" onClick={() => handleCompleteDraft(fer)}>
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Complete Draft
                            </Button>
                          )}
                          
                          {userRole === 'admin' && fer.fer_drafter_status === 1 && fer.fer_review_draft_status === 0 && (
                            <Button size="sm" onClick={() => handleApproveDraft(fer)} disabled={isApprovingDraft}>
                              {isApprovingDraft ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                                  Approve Draft
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          Drafter: <span className="font-medium">{fer.fer_drafter_assgn || 'Unassigned'}</span>
                        </p>
                        {fer.fer_drafter_deadline && (
                          <p className="text-sm text-muted-foreground">
                            Deadline: <span className="font-medium">{format(new Date(fer.fer_drafter_deadline), 'dd MMM yyyy')}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Filing Status</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant={fer.fer_filing_status === 1 ? "success" : "default"}>
                            {fer.fer_filing_status === 1 ? "Completed" : "Pending"}
                          </Badge>
                          <Badge variant={fer.fer_review_file_status === 1 ? "success" : "default"} className="ml-2">
                            {fer.fer_review_file_status === 1 ? "Approved" : "Not Approved"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {canCompleteFiling(fer) && (
                            <Button size="sm" onClick={() => handleCompleteFiling(fer)}>
                              <FileType className="h-4 w-4 mr-2" />
                              Complete Filing
                            </Button>
                          )}
                          
                          {userRole === 'admin' && fer.fer_filing_status === 1 && fer.fer_review_file_status === 0 && (
                            <Button size="sm" onClick={() => handleApproveFiling(fer)} disabled={isApprovingFiling}>
                              {isApprovingFiling ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                                  Approve Filing
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          Filer: <span className="font-medium">{fer.fer_filer_assgn || 'Unassigned'}</span>
                        </p>
                        {fer.fer_filer_deadline && (
                          <p className="text-sm text-muted-foreground">
                            Deadline: <span className="font-medium">{format(new Date(fer.fer_filer_deadline), 'dd MMM yyyy')}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Completion Status</h3>
                      <Badge variant={fer.fer_completion_status === 1 ? "success" : "default"} className="text-base">
                        {fer.fer_completion_status === 1 ? "Complete" : "Incomplete"}
                      </Badge>
                      
                      {fer.fer_completion_status === 1 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          All tasks for this FER have been completed and approved.
                        </p>
                      )}
                      
                      {fer.fer_completion_status === 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Pending tasks:
                          </p>
                          <ul className="text-sm text-muted-foreground list-disc pl-5">
                            {fer.fer_drafter_status === 0 && (
                              <li>Drafting needs to be completed</li>
                            )}
                            {fer.fer_drafter_status === 1 && fer.fer_review_draft_status === 0 && (
                              <li>Drafting needs to be approved</li>
                            )}
                            {fer.fer_filing_status === 0 && fer.fer_drafter_status === 1 && (
                              <li>Filing needs to be completed</li>
                            )}
                            {fer.fer_filing_status === 1 && fer.fer_review_file_status === 0 && (
                              <li>Filing needs to be approved</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>No FER entries have been added yet.</p>
              {userRole === 'admin' && (
                <Button variant="outline" className="mt-4" onClick={handleAddFER}>
                  <PlusCircleIcon className="h-4 w-4 mr-2" />
                  Add FER Entry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAddingFER ? 'Add FER Entry' : 'Edit FER Entry'}</DialogTitle>
            <DialogDescription>
              {isAddingFER ? 'Create a new FER entry with the required details.' : 'Update the FER entry details.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fer-number">FER Number</Label>
                <Input
                  id="fer-number"
                  type="number"
                  value={ferNumber}
                  onChange={(e) => setFERNumber(parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fer-date">FER Date</Label>
                <Input
                  id="fer-date"
                  type="date"
                  value={ferDate}
                  onChange={(e) => setFERDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fer-drafter">Drafter</Label>
              <Select value={ferDrafter} onValueChange={setFERDrafter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drafter" />
                </SelectTrigger>
                <SelectContent>
                  {drafters.map((drafter) => (
                    <SelectItem key={drafter} value={drafter}>{drafter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fer-drafter-deadline">Drafter Deadline</Label>
              <Input
                id="fer-drafter-deadline"
                type="date"
                value={ferDrafterDeadline}
                onChange={(e) => setFERDrafterDeadline(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fer-filer">Filer</Label>
              <Select value={ferFiler} onValueChange={setFERFiler}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filer" />
                </SelectTrigger>
                <SelectContent>
                  {filers.map((filer) => (
                    <SelectItem key={filer} value={filer}>{filer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFER} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the FER entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFER} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FEREntriesSection;
