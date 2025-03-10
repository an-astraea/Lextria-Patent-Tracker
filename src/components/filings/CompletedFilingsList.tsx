
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface CompletedFilingsListProps {
  patents: Patent[];
  username: string;
}

const CompletedFilingsList: React.FC<CompletedFilingsListProps> = ({
  patents,
  username,
}) => {
  const navigate = useNavigate();

  if (patents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-xl font-medium">No completed filing assignments yet</p>
        <p className="text-gray-500">Your completed filings will appear here</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>List of your completed filing assignments</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Tracking ID</TableHead>
          <TableHead>Patent Title</TableHead>
          <TableHead>Filing Type</TableHead>
          <TableHead>Completed Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patents.map(patent => {
          let filingType = '';
          
          if (patent.ps_filer_assgn === username && patent.ps_filing_status === 1) {
            filingType = 'PS';
          } else if (patent.cs_filer_assgn === username && patent.cs_filing_status === 1) {
            filingType = 'CS';
          } else if (patent.fer_filer_assgn === username && patent.fer_filing_status === 1) {
            filingType = 'FER';
          }
          
          return (
            <TableRow key={patent.id}>
              <TableCell>{patent.tracking_id}</TableCell>
              <TableCell>{patent.patent_title}</TableCell>
              <TableCell>{filingType} Filing</TableCell>
              <TableCell>{format(new Date(patent.updated_at), 'PPP')}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" onClick={() => navigate(`/patents/${patent.id}`)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default CompletedFilingsList;
