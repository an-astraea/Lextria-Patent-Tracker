
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
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Patents ({patents.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-auto max-h-[70vh]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="min-w-[120px]">Tracking ID</TableHead>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="min-w-[150px]">Applicant</TableHead>
                  <TableHead className="min-w-[100px]">Client</TableHead>
                  <TableHead className="min-w-[100px]">Stage</TableHead>
                  <TableHead className="min-w-[120px]">Filing Date</TableHead>
                  <TableHead className="min-w-[120px]">PS Status</TableHead>
                  <TableHead className="min-w-[120px]">CS Status</TableHead>
                  <TableHead className="min-w-[100px]">FER Status</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
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
                      <div className="flex gap-1 flex-wrap">
                        <Badge className={getStatusColor(patent.ps_drafting_status)}>
                          D: {patent.ps_drafting_status ? '✓' : '✗'}
                        </Badge>
                        <Badge className={getStatusColor(patent.ps_filing_status)}>
                          F: {patent.ps_filing_status ? '✓' : '✗'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
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
                      <div className="flex gap-1 flex-wrap">
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
    </div>
  );
};

export default PatentTableView;
