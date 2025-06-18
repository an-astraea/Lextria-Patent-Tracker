
import React, { useState } from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Edit, 
  Trash2, 
  CalendarClock, 
  User, 
  Building,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PatentTimeline from '@/components/patent/PatentTimeline';

interface PatentCardProps {
  patent: Patent;
  showDeadline?: boolean;
  onDelete?: (id: string) => void;
}

const PatentCard = ({ patent, showDeadline, onDelete }: PatentCardProps) => {
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Add state for timeline dialog
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);

  const determineStatus = (patent: Patent) => {
    if (patent.ps_completion_status === 1 && patent.cs_completion_status === 1) {
      return 'completed';
    } else if ((patent.ps_drafting_status === 1 || patent.cs_drafting_status === 1 || patent.fer_drafter_status === 1) && 
               (patent.ps_filing_status === 0 || patent.cs_filing_status === 0 || patent.fer_filing_status === 0)) {
      return 'inProgress';
    } else if (patent.ps_drafting_status === 0 && patent.cs_drafting_status === 0) {
      return 'notStarted';
    } else {
      return 'pending';
    }
  };

  const status = determineStatus(patent);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(patent.id);
    } else {
      toast.error("Delete functionality not implemented");
    }
  };

  // Find the closest deadline if showDeadline is true
  const findClosestDeadline = () => {
    if (!showDeadline) return null;
    
    const deadlines = [
      { label: 'PS Draft', date: patent.ps_drafter_deadline },
      { label: 'PS File', date: patent.ps_filer_deadline },
      { label: 'CS Draft', date: patent.cs_drafter_deadline },
      { label: 'CS File', date: patent.cs_filer_deadline },
      { label: 'FER Draft', date: patent.fer_drafter_deadline },
      { label: 'FER File', date: patent.fer_filer_deadline }
    ].filter(d => d.date);
    
    if (deadlines.length === 0) return null;
    
    deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return deadlines[0];
  };
  
  const closestDeadline = findClosestDeadline();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Function to open the full timeline dialog
  const openTimelineDialog = () => {
    setShowTimelineDialog(true);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border border-border">
      <div className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold line-clamp-1">{patent.patent_title}</h3>
            <div className="text-sm text-muted-foreground mt-1">ID: {patent.tracking_id}</div>
          </div>
          <StatusBadge status={status} />
        </div>
        
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{patent.patent_applicant}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Client: {patent.client_id}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Filed: {formatDate(patent.date_of_filing)}</span>
          </div>
          
          {closestDeadline && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm">
              <span className="font-medium">{closestDeadline.label} Deadline:</span> {formatDate(closestDeadline.date)}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {patent.ps_drafting_status === 1 && (
            <Badge variant="secondary" className="text-xs">PS Draft Complete</Badge>
          )}
          {patent.ps_filing_status === 1 && (
            <Badge variant="secondary" className="text-xs">PS File Complete</Badge>
          )}
          {patent.cs_drafting_status === 1 && (
            <Badge variant="secondary" className="text-xs">CS Draft Complete</Badge>
          )}
          {patent.cs_filing_status === 1 && (
            <Badge variant="secondary" className="text-xs">CS File Complete</Badge>
          )}
          {patent.fer_drafter_status === 1 && (
            <Badge variant="secondary" className="text-xs">FER Draft Complete</Badge>
          )}
          {patent.fer_filing_status === 1 && (
            <Badge variant="secondary" className="text-xs">FER File Complete</Badge>
          )}
        </div>
      </div>
      
      <CardFooter className="flex justify-between bg-muted/30 p-4 border-t">
        <div className="flex items-center gap-1">
          <Link to={`/patents/${patent.id}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>View</span>
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={openTimelineDialog}
          >
            <History className="h-4 w-4" />
            <span>Timeline</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          {(user?.role === 'admin' || user?.role === 'drafter') && (
            <>
              <Link to={`/patents/edit/${patent.id}`}>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              
              {user?.role === 'admin' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDelete}
                  className="hover:text-destructive"
                  disabled={!onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>

      {/* Full Timeline Dialog */}
      <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patent Timeline - {patent.patent_title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <PatentTimeline 
              patentId={patent.id} 
              onAddTimelineClick={() => {
                // Close this dialog and redirect to patent details for adding timeline events
                setShowTimelineDialog(false);
                // You could add a toast here to inform the user to go to patent details to add events
                toast.info('Visit the patent details page to add new timeline events');
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PatentCard;
