
import React, { useState } from 'react';
import { Patent } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import PatentCard from '@/components/PatentCard';
import PatentTableView from './PatentTableView';

interface PatentListTabsProps {
  filteredPatents: Patent[];
  getInProgressPatents: () => Patent[];
  getCompletedPatents: () => Patent[];
  getWithdrawnPatents: () => Patent[];
  onDeletePatent: (id: string) => void;
  userRole: string | undefined;
}

const PatentListTabs: React.FC<PatentListTabsProps> = ({
  filteredPatents,
  getInProgressPatents,
  getCompletedPatents,
  getWithdrawnPatents,
  onDeletePatent,
  userRole
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const renderPatentsView = (patents: Patent[]) => {
    if (viewMode === 'table') {
      return (
        <PatentTableView
          patents={patents}
          onDeletePatent={userRole === 'admin' ? onDeletePatent : undefined}
          userRole={userRole}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patents.length > 0 ? (
          patents.map((patent) => (
            <PatentCard 
              key={patent.id} 
              patent={patent} 
              onDelete={userRole === 'admin' ? () => onDeletePatent(patent.id) : undefined} 
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No patents found</p>
            </Card>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            Table
          </Button>
        </div>
      </div>

      <Tabs defaultValue="in-progress">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="withdrawn">Withdrawn</TabsTrigger>
        </TabsList>
        
        <TabsContent value="in-progress" className="mt-6">
          {renderPatentsView(getInProgressPatents())}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {renderPatentsView(getCompletedPatents())}
        </TabsContent>
        
        <TabsContent value="withdrawn" className="mt-6">
          {renderPatentsView(getWithdrawnPatents())}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatentListTabs;
