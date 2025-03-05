
import React from 'react';
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
  Building 
} from 'lucide-react';
import { formatDate } from '@/lib/data';
import { Link } from 'react-router-dom';

interface PatentCardProps {
  patent: Patent;
  onDelete: (id: string) => void;
}

const PatentCard: React.FC<PatentCardProps> = ({ patent, onDelete }) => {
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
        <Link to={`/patents/${patent.id}`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>View</span>
          </Button>
        </Link>
        
        <div className="flex items-center gap-1">
          <Link to={`/patents/edit/${patent.id}`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(patent.id)}
            className="hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PatentCard;
