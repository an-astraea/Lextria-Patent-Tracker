
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PatentStateTableProps {
  patents: Patent[];
}

const PatentStateTable: React.FC<PatentStateTableProps> = ({ patents }) => {
  // Get unique state names from all patents
  const getUniqueStates = (): string[] => {
    const states = patents
      .map(patent => patent.applicant_addr?.split(',').pop()?.trim())
      .filter(Boolean) as string[];
    
    return [...new Set(states)].sort();
  };

  // Count patents by state
  const getPatentCountByState = () => {
    const states = getUniqueStates();
    const countByState: Record<string, number> = {};
    
    // Initialize counts
    states.forEach(state => {
      countByState[state] = 0;
    });
    
    // Count patents per state
    patents.forEach(patent => {
      const state = patent.applicant_addr?.split(',').pop()?.trim();
      if (state && countByState[state] !== undefined) {
        countByState[state]++;
      }
    });
    
    return { states, countByState };
  };

  const { states, countByState } = getPatentCountByState();
  const totalPatents = patents.length;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Patent Distribution by State</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Patent Count</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {states.map(state => (
              <TableRow key={state}>
                <TableCell className="font-medium">{state}</TableCell>
                <TableCell className="text-right">{countByState[state]}</TableCell>
                <TableCell className="text-right">
                  {totalPatents > 0 
                    ? ((countByState[state] / totalPatents) * 100).toFixed(1) + '%' 
                    : '0%'}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{totalPatents}</TableCell>
              <TableCell className="text-right">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PatentStateTable;
