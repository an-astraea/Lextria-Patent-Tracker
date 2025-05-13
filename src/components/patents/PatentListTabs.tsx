
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Patent } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';

interface PatentListTabsProps {
  filteredPatents: Patent[];
  getInProgressPatents: () => Patent[];
  getCompletedPatents: () => Patent[];
  getWithdrawnPatents: () => Patent[];
  onDeletePatent: (id: string) => void;
  userRole: string;
}

const PatentListTabs: React.FC<PatentListTabsProps> = ({
  filteredPatents,
  getInProgressPatents,
  getCompletedPatents,
  getWithdrawnPatents,
  onDeletePatent,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Define columns for patents table
  const columns: ColumnDef<Patent>[] = [
    {
      accessorKey: 'tracking_id',
      header: 'ID',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.tracking_id}</div>
      ),
    },
    {
      accessorKey: 'patent_title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">{row.original.patent_title}</div>
      ),
    },
    {
      accessorKey: 'patent_applicant',
      header: 'Applicant',
    },
    {
      accessorKey: 'client_id',
      header: 'Client ID',
    },
    {
      accessorKey: 'date_of_filing',
      header: 'Filing Date',
      cell: ({ row }) => {
        const date = row.original.date_of_filing;
        if (!date) return <span className="text-muted-foreground">Not filed</span>;
        return format(new Date(date), 'MMM dd, yyyy');
      }
    },
    {
      accessorKey: 'ps_drafting_status',
      header: 'PS Drafting',
      cell: ({ row }) => {
        const status = row.original.ps_drafting_status ? 'completed' : 'notStarted';
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: 'ps_filing_status',
      header: 'PS Filing',
      cell: ({ row }) => {
        const status = row.original.ps_filing_status ? 'completed' : 'notStarted';
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: 'cs_drafting_status',
      header: 'CS Drafting',
      cell: ({ row }) => {
        const status = row.original.cs_drafting_status ? 'completed' : 'notStarted';
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: 'cs_filing_status',
      header: 'CS Filing',
      cell: ({ row }) => {
        const status = row.original.cs_filing_status ? 'completed' : 'notStarted';
        return <StatusBadge status={status} />;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const patent = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link to={`/patents/${patent.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
            
            {userRole === 'admin' && (
              <>
                <Link to={`/patents/edit/${patent.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeletePatent(patent.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];
  
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="all">
          All
          <Badge variant="secondary" className="ml-2">
            {filteredPatents.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="in-progress">
          In Progress
          <Badge variant="secondary" className="ml-2">
            {getInProgressPatents().length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed
          <Badge variant="secondary" className="ml-2">
            {getCompletedPatents().length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="withdrawn">
          Withdrawn
          <Badge variant="secondary" className="ml-2">
            {getWithdrawnPatents().length}
          </Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="border rounded-lg p-4">
        <DataTable
          columns={columns}
          data={filteredPatents}
          searchField="tracking_id"
          placeholder="Search by tracking ID..."
        />
      </TabsContent>
      
      <TabsContent value="in-progress" className="border rounded-lg p-4">
        <DataTable
          columns={columns}
          data={getInProgressPatents()}
          searchField="tracking_id"
          placeholder="Search by tracking ID..."
        />
      </TabsContent>
      
      <TabsContent value="completed" className="border rounded-lg p-4">
        <DataTable
          columns={columns}
          data={getCompletedPatents()}
          searchField="tracking_id"
          placeholder="Search by tracking ID..."
        />
      </TabsContent>
      
      <TabsContent value="withdrawn" className="border rounded-lg p-4">
        <DataTable
          columns={columns}
          data={getWithdrawnPatents()}
          searchField="tracking_id"
          placeholder="Search by tracking ID..."
        />
      </TabsContent>
    </Tabs>
  );
};

export default PatentListTabs;
