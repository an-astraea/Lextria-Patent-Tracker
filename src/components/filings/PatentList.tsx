
import React from 'react';
import { Patent } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, RefreshCw, FileText } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import PatentCard from './PatentCard';

interface PatentListProps {
  pending: Patent[];
  completed: Patent[];
  user: any;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onPatentSelect: (patent: Patent) => void;
}

const PatentList: React.FC<PatentListProps> = ({
  pending,
  completed,
  user,
  lastUpdated,
  onRefresh,
  onPatentSelect
}) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        <TabsContent value="pending">
          {pending.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pending.map(patent => (
                <PatentCard 
                  key={patent.id}
                  patent={patent}
                  user={user}
                  onClick={() => onPatentSelect(patent)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="w-10 h-10 text-muted-foreground" />}
              title="No pending assignments"
              message="You don't have any pending filing assignments at the moment."
            />
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completed.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completed.map(patent => (
                <PatentCard 
                  key={patent.id}
                  patent={patent}
                  user={user}
                  isComplete={true}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="w-10 h-10 text-muted-foreground" />}
              title="No completed assignments"
              message="You haven't completed any filing assignments yet."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatentList;
