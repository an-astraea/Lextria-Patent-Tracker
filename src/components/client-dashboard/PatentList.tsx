
import React from 'react';
import { Patent } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import PatentCard from '@/components/PatentCard';
import EmptyState from '@/components/common/EmptyState';
import * as XLSX from 'xlsx';

interface PatentListProps {
  patents: Patent[];
  onExportToExcel: () => void;
}

const PatentList: React.FC<PatentListProps> = ({ patents, onExportToExcel }) => {
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportToExcel}
          disabled={patents.length === 0}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Patents</TabsTrigger>
          <TabsTrigger value="provisional">Provisional</TabsTrigger>
          <TabsTrigger value="complete">Complete</TabsTrigger>
          <TabsTrigger value="fer">FER</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {patents.length > 0 ? (
            patents.map(patent => (
              <PatentCard key={patent.id} patent={patent} />
            ))
          ) : (
            <EmptyState 
              title="No Patents Found" 
              message="No patents match your search criteria or none have been assigned to this client." 
            />
          )}
        </TabsContent>
        
        <TabsContent value="provisional" className="space-y-4">
          {patents.filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 0).length > 0 ? (
            patents
              .filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 0)
              .map(patent => (
                <PatentCard key={patent.id} patent={patent} />
              ))
          ) : (
            <EmptyState 
              title="No Provisional Patents" 
              message="No provisional patents found for this client." 
            />
          )}
        </TabsContent>
        
        <TabsContent value="complete" className="space-y-4">
          {patents.filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 1).length > 0 ? (
            patents
              .filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 1)
              .map(patent => (
                <PatentCard key={patent.id} patent={patent} />
              ))
          ) : (
            <EmptyState 
              title="No Complete Patents" 
              message="No complete patents found for this client." 
            />
          )}
        </TabsContent>
        
        <TabsContent value="fer" className="space-y-4">
          {patents.filter(p => p.fer_status === 1).length > 0 ? (
            patents
              .filter(p => p.fer_status === 1)
              .map(patent => (
                <PatentCard key={patent.id} patent={patent} />
              ))
          ) : (
            <EmptyState 
              title="No FER Patents" 
              message="No patents with active FER found for this client." 
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default PatentList;
