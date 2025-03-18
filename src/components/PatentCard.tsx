
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, User, FileText, Hash } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';

interface PatentCardProps {
  patent: Patent;
  showDeadline?: boolean;
}

const PatentCard: React.FC<PatentCardProps> = ({ patent, showDeadline = false }) => {
  const navigate = useNavigate();
  
  const upcomingDeadline = React.useMemo(() => {
    const deadlines = [
      { type: 'PS Drafter', date: patent.ps_drafter_deadline, status: patent.ps_drafting_status },
      { type: 'PS Filer', date: patent.ps_filer_deadline, status: patent.ps_filing_status },
      { type: 'CS Drafter', date: patent.cs_drafter_deadline, status: patent.cs_drafting_status },
      { type: 'CS Filer', date: patent.cs_filer_deadline, status: patent.cs_filing_status },
      { type: 'FER Drafter', date: patent.fer_drafter_deadline, status: patent.fer_drafter_status },
      { type: 'FER Filer', date: patent.fer_filer_deadline, status: patent.fer_filing_status },
    ]
      .filter(({ date, status }) => date && status === 0)
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    
    return deadlines.length > 0 ? deadlines[0] : null;
  }, [patent]);
  
  const getStatusText = () => {
    if (patent.ps_completion_status === 1 && patent.cs_completion_status === 1) {
      return "Completed";
    }
    if (patent.ps_completion_status === 1 && patent.cs_completion_status === 0) {
      return "Provisional";
    }
    if (patent.ps_completion_status === 0) {
      return "Draft";
    }
    return "In Progress";
  };
  
  const handleViewDetails = () => {
    navigate(`/patents/${patent.id}`);
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{patent.patent_title}</CardTitle>
            <div className="flex flex-wrap gap-1 items-center">
              <Badge variant="outline" className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {patent.tracking_id}
              </Badge>
              
              {patent.internal_tracking_id && patent.internal_tracking_id !== patent.tracking_id && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Int: {patent.internal_tracking_id}
                </Badge>
              )}
            </div>
          </div>
          
          <StatusBadge status={getStatusText()} />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{patent.patent_applicant}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Client: {patent.client_id}</span>
            </div>
            
            {patent.date_of_filing && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Filed: {format(new Date(patent.date_of_filing), 'dd MMM yyyy')}</span>
              </div>
            )}
          </div>
          
          {showDeadline && upcomingDeadline && (
            <div className="mt-2">
              <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50">
                <Calendar className="h-3 w-3 text-yellow-600" />
                <span className="text-yellow-800">
                  {upcomingDeadline.type} Deadline: {format(new Date(upcomingDeadline.date!), 'dd MMM yyyy')}
                </span>
              </Badge>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-500">PS Status</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant={patent.ps_drafting_status ? "success" : "outline"} className="text-[10px]">
                  Drafting
                </Badge>
                <Badge variant={patent.ps_filing_status ? "success" : "outline"} className="text-[10px]">
                  Filing
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-500">CS Status</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant={patent.cs_drafting_status ? "success" : "outline"} className="text-[10px]">
                  Drafting
                </Badge>
                <Badge variant={patent.cs_filing_status ? "success" : "outline"} className="text-[10px]">
                  Filing
                </Badge>
              </div>
            </div>
          </div>
          
          {patent.fer_status === 1 && (
            <div className="space-y-1 mt-2">
              <h4 className="text-xs font-medium text-gray-500">FER Status</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant={patent.fer_drafter_status ? "success" : "outline"} className="text-[10px]">
                  Drafting
                </Badge>
                <Badge variant={patent.fer_filing_status ? "success" : "outline"} className="text-[10px]">
                  Filing
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" size="sm" onClick={handleViewDetails} className="w-full">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PatentCard;
