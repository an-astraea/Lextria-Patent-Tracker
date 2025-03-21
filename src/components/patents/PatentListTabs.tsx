
import React from 'react';
import { Patent } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatentCard from '@/components/PatentCard';

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
  return (
    <Tabs defaultValue="in-progress">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="withdrawn">Withdrawn</TabsTrigger>
      </TabsList>
      
      <TabsContent value="in-progress" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getInProgressPatents().length > 0 ? (
            getInProgressPatents().map((patent) => (
              <PatentCard 
                key={patent.id} 
                patent={patent} 
                onDelete={userRole === 'admin' ? () => onDeletePatent(patent.id) : undefined} 
              />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No patents in progress</p>
              </Card>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="completed" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCompletedPatents().length > 0 ? (
            getCompletedPatents().map((patent) => (
              <PatentCard 
                key={patent.id} 
                patent={patent} 
                onDelete={userRole === 'admin' ? () => onDeletePatent(patent.id) : undefined} 
              />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No completed patents</p>
              </Card>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="withdrawn" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getWithdrawnPatents().length > 0 ? (
            getWithdrawnPatents().map((patent) => (
              <PatentCard 
                key={patent.id} 
                patent={patent} 
                onDelete={userRole === 'admin' ? () => onDeletePatent(patent.id) : undefined} 
              />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No withdrawn patents</p>
              </Card>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PatentListTabs;
