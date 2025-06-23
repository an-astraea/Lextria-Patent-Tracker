
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStatusCounts, STATUS_LABELS, STATUS_COLORS, PatentStatus } from '@/lib/utils/status-utils';

interface PatentStatusTableProps {
  patents: Patent[];
}

const PatentStatusTable: React.FC<PatentStatusTableProps> = ({ patents }) => {
  const statusCounts = getStatusCounts(patents);
  const totalPatents = patents.length;

  // Define the order of statuses as they appear in the workflow
  const statusOrder: PatentStatus[] = [
    'idf_sent',
    'idf_received',
    'ps_drafting',
    'ps_drafting_approval',
    'ps_filing',
    'ps_filing_approval',
    'ps_completed',
    'cs_data_sent',
    'cs_data_received',
    'cs_drafting',
    'cs_drafting_approval',
    'cs_filing',
    'cs_filing_approval',
    'cs_completed',
    'completed',
    'withdrawn'
  ];

  // Filter out statuses with zero patents for cleaner display
  const visibleStatuses = statusOrder.filter(status => statusCounts[status] > 0);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Patent Distribution by Processing Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Processing Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Patent Count</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleStatuses.map(status => (
              <TableRow key={status} className={STATUS_COLORS[status]}>
                <TableCell className="font-medium capitalize">
                  {status.replace(/_/g, ' ')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {STATUS_LABELS[status]}
                </TableCell>
                <TableCell className="text-right">{statusCounts[status]}</TableCell>
                <TableCell className="text-right">
                  {totalPatents > 0 
                    ? ((statusCounts[status] / totalPatents) * 100).toFixed(1) + '%' 
                    : '0%'}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold">
              <TableCell>Total</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">{totalPatents}</TableCell>
              <TableCell className="text-right">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PatentStatusTable;
