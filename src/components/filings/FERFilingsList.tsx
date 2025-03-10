
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle } from 'lucide-react';
import { FEREntry } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, parseISO } from 'date-fns';

interface FERFilingsListProps {
  ferEntries: FEREntry[];
  onFERClick: (fer: FEREntry) => void;
}

const FERFilingsList: React.FC<FERFilingsListProps> = ({
  ferEntries,
  onFERClick,
}) => {
  const navigate = useNavigate();

  const isDeadlinePassed = (deadline: string | undefined | null) => {
    if (!deadline) return false;
    return isAfter(new Date(), parseISO(deadline));
  };

  const getPatentInfo = (fer: FEREntry) => {
    if (fer.patent) {
      return fer.patent.tracking_id || 'Unknown';
    }
    
    return fer.patent_id || 'Unknown';
  };

  return (
    <div className="grid gap-6">
      {ferEntries.map(fer => {
        const isLate = isDeadlinePassed(fer.fer_filer_deadline);
        
        return (
          <Card key={fer.id} className={isLate ? "border-red-500" : ""}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  {fer.patent?.patent_title || `FER #${fer.fer_number}`}
                  {isLate && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="h-3 w-3 mr-1" /> Overdue
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  FER #{fer.fer_number} | Tracking ID: {getPatentInfo(fer)}
                </CardDescription>
              </div>
              <Badge>FER Filing</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Deadline</div>
                  <div className="font-semibold">
                    {fer.fer_filer_deadline ? format(new Date(fer.fer_filer_deadline), 'PPP') : 'Not set'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">FER Date</div>
                  <div className="font-semibold">
                    {fer.fer_date ? format(new Date(fer.fer_date), 'PPP') : 'Not set'}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => navigate(`/patents/${fer.patent_id}`)}>
                  View Patent
                </Button>
                <Button onClick={() => onFERClick(fer)}>
                  Complete FER Filing
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FERFilingsList;
