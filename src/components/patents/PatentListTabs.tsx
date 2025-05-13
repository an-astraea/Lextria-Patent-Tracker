
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Edit, Eye, Trash2 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

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
  const [activeTab, setActiveTab] = useState("all");
  
  const patentsToShow = () => {
    switch (activeTab) {
      case "inProgress":
        return getInProgressPatents();
      case "completed":
        return getCompletedPatents();
      case "withdrawn":
        return getWithdrawnPatents();
      default:
        return filteredPatents;
    }
  };

  const renderPatentsList = () => {
    const patents = patentsToShow();
    
    if (patents.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No patents found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {patents.map(patent => (
          <div key={patent.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border p-4 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{patent.patent_title}</h3>
                <StatusBadge status={patent.status || 'pending'} />
              </div>
              <div className="text-sm text-muted-foreground">
                <div>ID: {patent.tracking_id}</div>
                <div>Applicant: {patent.patent_applicant}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Link to={`/patents/${patent.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Link>
              {userRole === 'admin' && (
                <>
                  <Link to={`/patents/edit/${patent.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDeletePatent(patent.id)}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="all">All Patents</TabsTrigger>
        <TabsTrigger value="inProgress">In Progress</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="withdrawn">Withdrawn</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="pt-4">
        {renderPatentsList()}
      </TabsContent>
      <TabsContent value="inProgress" className="pt-4">
        {renderPatentsList()}
      </TabsContent>
      <TabsContent value="completed" className="pt-4">
        {renderPatentsList()}
      </TabsContent>
      <TabsContent value="withdrawn" className="pt-4">
        {renderPatentsList()}
      </TabsContent>
    </Tabs>
  );
};

export default PatentListTabs;
