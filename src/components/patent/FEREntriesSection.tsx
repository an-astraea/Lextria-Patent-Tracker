
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Patent, FEREntry, Employee } from '@/lib/types';
import { PlusCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { createFEREntry, updateFEREntry, deleteFEREntry } from '@/lib/api';
import FERCard from './FERCard';
import FEREditDialog from './FEREditDialog';
import FERDeleteDialog from './FERDeleteDialog';
import FEREmptyState from './FEREmptyState';

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
        const newFER = await createFEREntry(
          patent.id,
          ferNumber
        );
        
        if (newFER) {
          const ferData: Partial<FEREntry> = {
            fer_drafter_assgn: ferDrafter || null,
            fer_drafter_deadline: ferDrafterDeadline || null,
            fer_filer_assgn: ferFiler || null,
            fer_filer_deadline: ferFilerDeadline || null,
            fer_date: ferDate || null
          };
          
          await updateFEREntry(newFER.id, ferData);
          
          toast.success('FER entry created successfully');
          await refreshPatentData();
        } else {
          toast.error('Failed to create FER entry');
        }
      } else if (selectedFER) {
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
            <FERCard
              key={fer.id}
              fer={fer}
              userRole={userRole}
              userName={userName}
              onEdit={handleEditFER}
              onDelete={handleDeleteFER}
              onCompleteDraft={onCompleteDraft}
              onCompleteFiling={onCompleteFiling}
              onApproveDraft={handleApproveDraft}
              onApproveFiling={handleApproveFiling}
              isApprovingDraft={isApprovingDraft}
              isApprovingFiling={isApprovingFiling}
            />
          ))}
        </div>
      ) : (
        <FEREmptyState userRole={userRole} onAddFER={handleAddFER} />
      )}
      
      <FEREditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedFER={selectedFER}
        isAddingFER={isAddingFER}
        ferNumber={ferNumber}
        ferDrafter={ferDrafter}
        ferDrafterDeadline={ferDrafterDeadline}
        ferFiler={ferFiler}
        ferFilerDeadline={ferFilerDeadline}
        ferDate={ferDate}
        isSubmitting={isSubmitting}
        drafters={drafters}
        filers={filers}
        setFERNumber={setFERNumber}
        setFERDrafter={setFERDrafter}
        setFERDrafterDeadline={setFERDrafterDeadline}
        setFERFiler={setFERFiler}
        setFERFilerDeadline={setFERFilerDeadline}
        setFERDate={setFERDate}
        onSave={handleSaveFER}
      />
      
      <FERDeleteDialog
        isOpen={isAlertDialogOpen}
        onOpenChange={setIsAlertDialogOpen}
        ferToDelete={ferToDelete}
        ferNumber={ferToDelete?.fer_number || 0}
        isSubmitting={isSubmitting}
        onConfirmDelete={confirmDeleteFER}
      />
    </div>
  );
};

export default FEREntriesSection;
