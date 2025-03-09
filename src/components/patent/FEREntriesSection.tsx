
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Patent, FEREntry } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFEREntry, updateFEREntry, deleteFEREntry } from '@/lib/api';
import { toast } from 'sonner';

interface FEREntriesSectionProps {
  patent: Patent;
  userRole: string;
  userName: string;
  employees: any[];
  refreshPatentData: () => Promise<void>;
  onApproveDraft: (fer: FEREntry) => void;
  onApproveFiling: (fer: FEREntry) => void;
  onCompleteDraft: (fer: FEREntry) => void;
  onCompleteFiling: (fer: FEREntry) => void;
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

  // FER status update states
  const [isCompletingDraft, setIsCompletingDraft] = useState(false);
  const [isCompletingFiling, setIsCompletingFiling] = useState(false);
  const [isApprovingDraft, setIsApprovingDraft] = useState(false);
  const [isApprovingFiling, setIsApprovingFiling] = useState(false);

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
        await refreshPatentData();
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
    if (!patent?.id) return;
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
          await refreshPatentData();
        }
      } else {
        // Create new FER
        const nextFERNumber = patent.fer_entries && patent.fer_entries.length > 0 
          ? Math.max(...patent.fer_entries.map(fer => fer.fer_number)) + 1 
          : 1;
        
        await createFEREntry(
          patent.id, 
          nextFERNumber, 
          ferDrafter, 
          ferDrafterDeadline,
          ferFiler,
          ferFilerDeadline,
          ferDate
        );
        
        toast.success('New FER created successfully');
        await refreshPatentData();
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

  const canManageFERs = userRole === 'admin';
  const canCompleteDrafting = (fer: FEREntry) => 
    userRole === 'drafter' && fer.fer_drafter_assgn === userName && fer.fer_drafter_status === 0;
  const canCompleteFiling = (fer: FEREntry) => 
    userRole === 'filer' && fer.fer_filer_assgn === userName && 
    fer.fer_filing_status === 0 && fer.fer_drafter_status === 1 && fer.fer_review_draft_status === 0;
  const canApproveDraft = (fer: FEREntry) => 
    userRole === 'admin' && fer.fer_review_draft_status === 1;
  const canApproveFiling = (fer: FEREntry) => 
    userRole === 'admin' && fer.fer_review_file_status === 1;

  const drafters = employees.filter(emp => emp.role === 'drafter').map(emp => emp.full_name);
  const filers = employees.filter(emp => emp.role === 'filer').map(emp => emp.full_name);

  return (
    <>
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
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">FER #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Drafter</TableHead>
                    <TableHead>Filer</TableHead>
                    <TableHead>Draft Status</TableHead>
                    <TableHead>File Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canManageFERs && (
                            <>
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
                              {canApproveDraft(fer) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => onApproveDraft(fer)}
                                  disabled={isApprovingDraft}
                                >
                                  {isApprovingDraft ? 
                                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                                    'Approve Draft'}
                                </Button>
                              )}
                              {canApproveFiling(fer) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => onApproveFiling(fer)}
                                  disabled={isApprovingFiling}
                                >
                                  {isApprovingFiling ? 
                                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                                    'Approve Filing'}
                                </Button>
                              )}
                            </>
                          )}
                          {canCompleteDrafting(fer) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => onCompleteDraft(fer)}
                              disabled={isCompletingDraft}
                            >
                              {isCompletingDraft ? 
                                <Loader2 className="h-4 w-4 animate-spin" /> : 
                                'Complete Draft'}
                            </Button>
                          )}
                          {canCompleteFiling(fer) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => onCompleteFiling(fer)}
                              disabled={isCompletingFiling}
                            >
                              {isCompletingFiling ? 
                                <Loader2 className="h-4 w-4 animate-spin" /> : 
                                'Complete Filing'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
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

      {/* FER Edit/Add Dialog */}
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
      
      {/* FER Delete Confirmation Dialog */}
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
    </>
  );
};

export default FEREntriesSection;
