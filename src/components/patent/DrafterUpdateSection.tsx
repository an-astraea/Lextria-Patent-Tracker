
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Patent } from '@/lib/types';
import { updatePatent } from '@/lib/api/patent-api';
import { toast } from 'sonner';

interface DrafterUpdateSectionProps {
  patent: Patent;
  userRole: string;
  userName: string;
  onPatentUpdate: (updatedPatent: Patent) => void;
}

const DrafterUpdateSection: React.FC<DrafterUpdateSectionProps> = ({
  patent,
  userRole,
  userName,
  onPatentUpdate
}) => {
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState(patent.notes || '');
  const [psDeadline, setPsDeadline] = useState<Date | undefined>(
    patent.ps_drafter_deadline ? new Date(patent.ps_drafter_deadline) : undefined
  );
  const [csDeadline, setCsDeadline] = useState<Date | undefined>(
    patent.cs_drafter_deadline ? new Date(patent.cs_drafter_deadline) : undefined
  );
  const [ferDeadline, setFerDeadline] = useState<Date | undefined>(
    patent.fer_drafter_deadline ? new Date(patent.fer_drafter_deadline) : undefined
  );

  // Check if the current user is assigned to this patent for drafting
  const canUpdatePS = userRole === 'drafter' && patent.ps_drafter_assgn === userName;
  const canUpdateCS = userRole === 'drafter' && patent.cs_drafter_assgn === userName;
  const canUpdateFER = userRole === 'drafter' && patent.fer_drafter_assgn === userName;

  const canUpdate = canUpdatePS || canUpdateCS || canUpdateFER;

  if (!canUpdate) {
    return null;
  }

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      
      const updateData: any = {
        notes: notes,
      };

      if (canUpdatePS && psDeadline) {
        updateData.ps_drafter_deadline = format(psDeadline, 'yyyy-MM-dd');
      }
      
      if (canUpdateCS && csDeadline) {
        updateData.cs_drafter_deadline = format(csDeadline, 'yyyy-MM-dd');
      }
      
      if (canUpdateFER && ferDeadline) {
        updateData.fer_drafter_deadline = format(ferDeadline, 'yyyy-MM-dd');
      }

      const result = await updatePatent(patent.id, updateData);
      
      if (result.success) {
        toast.success('Patent details updated successfully');
        onPatentUpdate({ ...patent, ...updateData });
      } else {
        toast.error(result.message || 'Failed to update patent');
      }
    } catch (error) {
      console.error('Error updating patent:', error);
      toast.error('Failed to update patent details');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Drafting Details</CardTitle>
        <CardDescription>
          Update your assigned drafting tasks and deadlines for this patent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {canUpdatePS && (
            <div className="space-y-2">
              <Label htmlFor="ps-deadline">PS Drafting Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !psDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {psDeadline ? format(psDeadline, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={psDeadline}
                    onSelect={setPsDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {canUpdateCS && (
            <div className="space-y-2">
              <Label htmlFor="cs-deadline">CS Drafting Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !csDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {csDeadline ? format(csDeadline, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={csDeadline}
                    onSelect={setCsDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {canUpdateFER && (
            <div className="space-y-2">
              <Label htmlFor="fer-deadline">FER Drafting Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !ferDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {ferDeadline ? format(ferDeadline, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={ferDeadline}
                    onSelect={setFerDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Drafting Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes about your drafting work..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleUpdate} 
          disabled={updating}
          className="w-full sm:w-auto"
        >
          <Save className="mr-2 h-4 w-4" />
          {updating ? 'Updating...' : 'Update Details'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DrafterUpdateSection;
