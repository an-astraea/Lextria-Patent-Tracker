
import React, { useState } from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PatentStatusTableProps {
  patents: Patent[];
}

const PatentStatusTable: React.FC<PatentStatusTableProps> = ({ patents }) => {
  // Get the current processing state of each patent
  const getCurrentState = (patent: Patent): string => {
    // Check processing state in order of progression
    if (!patent.idf_received) return 'Awaiting IDF';
    if (patent.ps_drafting_status === 0) return 'PS Drafting Pending';
    if (patent.ps_drafting_status === 1 && patent.ps_filing_status === 0) return 'PS Drafted';
    if (patent.ps_filing_status === 1 && patent.cs_drafting_status === 0) return 'PS Filed';
    if (patent.cs_drafting_status === 1 && patent.cs_filing_status === 0) return 'CS Drafted';
    if (patent.cs_filing_status === 1 && patent.fer_status === 0) return 'CS Filed';
    if (patent.fer_status === 1 && patent.fer_drafter_status === 0) return 'FER Drafting Pending';
    if (patent.fer_drafter_status === 1 && patent.fer_filing_status === 0) return 'FER Drafted';
    if (patent.fer_filing_status === 1 && !patent.completed) return 'FER Filed';
    if (patent.completed) return 'Completed';
    if (patent.withdrawn) return 'Withdrawn';
    
    return 'Unknown';
  };

  // Count patents by their current state and get patent details
  const getPatentCountByState = () => {
    const stateCount: Record<string, number> = {};
    const statePatents: Record<string, Patent[]> = {};
    
    // Predefined states in the order we want them to appear
    const stateOrder = [
      'Awaiting IDF',
      'PS Drafting Pending',
      'PS Drafted',
      'PS Filed',
      'CS Drafted',
      'CS Filed',
      'FER Drafting Pending',
      'FER Drafted',
      'FER Filed',
      'Completed',
      'Withdrawn',
      'Unknown'
    ];
    
    // Initialize counts and patent arrays
    stateOrder.forEach(state => {
      stateCount[state] = 0;
      statePatents[state] = [];
    });
    
    // Count patents by their current state and store patent details
    patents.forEach(patent => {
      const currentState = getCurrentState(patent);
      stateCount[currentState]++;
      statePatents[currentState].push(patent);
    });
    
    // Filter out states with zero patents
    const filteredStates = stateOrder.filter(state => stateCount[state] > 0);
    
    return { filteredStates, stateCount, statePatents };
  };

  const { filteredStates, stateCount, statePatents } = getPatentCountByState();
  const totalPatents = patents.length;

  // Function to determine background color based on state
  const getStateColor = (state: string): string => {
    switch (state) {
      case 'Awaiting IDF':
        return 'bg-gray-100';
      case 'PS Drafting Pending':
        return 'bg-blue-50';
      case 'PS Drafted':
        return 'bg-blue-100';
      case 'PS Filed':
        return 'bg-blue-200';
      case 'CS Drafted':
        return 'bg-indigo-100';
      case 'CS Filed':
        return 'bg-indigo-200';
      case 'FER Drafting Pending':
        return 'bg-amber-50';
      case 'FER Drafted':
        return 'bg-amber-100';
      case 'FER Filed':
        return 'bg-amber-200';
      case 'Completed':
        return 'bg-green-100';
      case 'Withdrawn':
        return 'bg-red-100';
      default:
        return '';
    }
  };

  // Function to format patent list for tooltip
  const formatPatentList = (patentList: Patent[]): string => {
    if (patentList.length === 0) return 'No patents';
    
    return patentList
      .slice(0, 10) // Show max 10 patents to avoid overly long tooltips
      .map(patent => `${patent.tracking_id} - ${patent.patent_title}`)
      .join('\n') + (patentList.length > 10 ? `\n... and ${patentList.length - 10} more` : '');
  };

  return (
    <TooltipProvider>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Patent Distribution by Processing State</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Processing State</TableHead>
                <TableHead className="text-right">Patent Count</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStates.map(state => (
                <TableRow key={state} className={getStateColor(state)}>
                  <TableCell className="font-medium">{state}</TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help hover:underline">
                          {stateCount[state]}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <div className="text-sm">
                          <div className="font-semibold mb-2">Patents in {state}:</div>
                          <div className="whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {formatPatentList(statePatents[state])}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-right">
                    {totalPatents > 0 
                      ? ((stateCount[state] / totalPatents) * 100).toFixed(1) + '%' 
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
    </TooltipProvider>
  );
};

export default PatentStatusTable;
