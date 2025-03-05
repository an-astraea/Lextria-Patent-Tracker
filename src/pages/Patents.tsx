
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { patents } from '@/lib/data';
import { PatentCard } from '@/components/PatentCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Patents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredPatents, setFilteredPatents] = React.useState<Patent[]>(patents);
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Handle search
  React.useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      setFilteredPatents(patents);
      return;
    }
    
    const filtered = patents.filter(
      (patent) =>
        patent.patent_title.toLowerCase().includes(query) ||
        patent.tracking_id.toLowerCase().includes(query) ||
        patent.patent_applicant.toLowerCase().includes(query) ||
        patent.client_id.toLowerCase().includes(query) ||
        (patent.application_no && patent.application_no.toLowerCase().includes(query))
    );
    
    setFilteredPatents(filtered);
  }, [searchQuery]);
  
  const getInProgressPatents = () => {
    return filteredPatents.filter(patent => 
      !patent.ps_completion_status || 
      !patent.cs_completion_status || 
      (patent.fer_status && !patent.fer_completion_status)
    );
  };
  
  const getCompletedPatents = () => {
    return filteredPatents.filter(patent => 
      patent.ps_completion_status && 
      patent.cs_completion_status && 
      (!patent.fer_status || patent.fer_completion_status)
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Patents</h1>
        {user?.role === 'admin' && (
          <Button onClick={() => navigate('/patents/add')} className="sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Patent
          </Button>
        )}
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patents..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="in-progress">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="in-progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getInProgressPatents().length > 0 ? (
              getInProgressPatents().map((patent) => (
                <PatentCard key={patent.id} patent={patent} />
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
                <PatentCard key={patent.id} patent={patent} />
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
      </Tabs>
    </div>
  );
};

export default Patents;
