
import React from 'react';
import { Patent } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface PatentTableViewProps {
  patents: Patent[];
  onDeletePatent?: (id: string) => void;
  userRole?: string;
}

const PatentTableView: React.FC<PatentTableViewProps> = ({ 
  patents, 
  onDeletePatent, 
  userRole 
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: number) => {
    return status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStage = (patent: Patent) => {
    if (patent.completed) return 'Completed';
    if (patent.withdrawn) return 'Withdrawn';
    if (patent.fer_status === 1) return 'FER';
    if (patent.cs_filing_status === 1) return 'CS Filing';
    if (patent.cs_drafting_status === 1) return 'CS Drafting';
    if (patent.ps_filing_status === 1) return 'PS Filing';
    if (patent.ps_drafting_status === 1) return 'PS Drafting';
    return 'Initial';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patents ({patents.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Filing Date</TableHead>
                <TableHead>PS Status</TableHead>
                <TableHead>CS Status</TableHead>
                <TableHead>FER Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patents.map((patent) => (
                <TableRow key={patent.id}>
                  <TableCell className="font-medium">{patent.tracking_id}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={patent.patent_title}>
                      {patent.patent_title}
                    </div>
                  </TableCell>
                  <TableCell>{patent.patent_applicant}</TableCell>
                  <TableCell>{patent.client_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getStage(patent)}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(patent.date_of_filing), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge className={getStatusColor(patent.ps_drafting_status)}>
                        D: {patent.ps_drafting_status ? '✓' : '✗'}
                      </Badge>
                      <Badge className={getStatusColor(patent.ps_filing_status)}>
                        F: {patent.ps_filing_status ? '✓' : '✗'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge className={getStatusColor(patent.cs_drafting_status)}>
                        D: {patent.cs_drafting_status ? '✓' : '✗'}
                      </Badge>
                      <Badge className={getStatusColor(patent.cs_filing_status)}>
                        F: {patent.cs_filing_status ? '✓' : '✗'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(patent.fer_status)}>
                      {patent.fer_status ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/patents/${patent.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(userRole === 'admin' || userRole === 'drafter') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/patents/edit/${patent.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {userRole === 'admin' && onDeletePatent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeletePatent(patent.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentTableView;
