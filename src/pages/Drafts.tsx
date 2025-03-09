import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { fetchDrafterAssignments, fetchDrafterCompletedAssignments, completeDrafterTask } from '@/lib/api';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { CheckCircle2, Loader2, RefreshCcw } from 'lucide-react';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { format, isAfter, parseISO } from 'date-fns';

const Drafts = () => {
  const [assignedPatents, setAssignedPatents] = useState<Patent[]>([]);
  const [completedPatents, setCompletedPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Redirect if not a drafter
  React.useEffect(() => {
    if (!user || user.role !== 'drafter') {
      toast.error('Access denied. Drafter access required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const fetchDrafts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch assigned patents
      const assignedResponse = await fetchDrafterAssignments(user.id);
      
      // Sort by deadline (closest first)
      const sortedAssigned = assignedResponse.patents ? 
        [...assignedResponse.patents].sort((a, b) => {
          const dateA = getEarliestDeadline(a);
          const dateB = getEarliestDeadline(b);
          
          if (!dateA) return 1;
          if (!dateB) return -1;
          
          return dateA.getTime() - dateB.getTime();
        }) : 
        [];
      
      setAssignedPatents(sortedAssigned);
      
      // Fetch completed patents
      const completedResponse = await fetchDrafterCompletedAssignments(user.id);
      if (completedResponse.patents) {
        setCompletedPatents(completedResponse.patents);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load draft assignments');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchDrafts();
  }, [user]);
  
  const getEarliestDeadline = (patent: Patent): Date | null => {
    const dates = [
      patent.ps_drafter_deadline && patent.ps_drafting_status === 0 ? new Date(patent.ps_drafter_deadline) : null,
      patent.cs_drafter_deadline && patent.cs_drafting_status === 0 ? new Date(patent.cs_drafter_deadline) : null,
      patent.fer_drafter_deadline && patent.fer_drafter_status === 0 ? new Date(patent.fer_drafter_deadline) : null
    ].filter(Boolean) as Date[];
    
    return dates.length > 0 ? 
      dates.reduce((earliest, current) => current < earliest ? current : earliest) : 
      null;
  };
  
  const completeDrafting = async (patentId: string, taskType: 'ps' | 'cs' | 'fer') => {
    setCompleting(patentId);
    try {
      const result = await completeDrafterTask(patentId, taskType);
      if (result.success) {
        toast.success('Draft completed and submitted for review');
        fetchDrafts(); // Refresh data
      } else {
        toast.error('Failed to complete draft');
      }
    } catch (error) {
      console.error('Error completing draft:', error);
      toast.error('An error occurred while completing the draft');
    } finally {
      setCompleting(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader title="Drafting Assignments" subtitle="Manage and complete your drafting tasks" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="focus:outline-none">Pending ({assignedPatents.length})</TabsTrigger>
          <TabsTrigger value="completed" className="focus:outline-none">Completed ({completedPatents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <LoadingState message="Loading assigned drafts..." />
          ) : assignedPatents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedPatents.map(patent => (
                <Card key={patent.id} className="bg-white shadow-sm">
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{patent.patent_title}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => fetchDrafts()}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-500">Tracking ID: {patent.tracking_id}</p>
                    
                    {/* Display the earliest deadline */}
                    {getEarliestDeadline(patent) && (
                      <p className="text-sm text-blue-500">
                        Deadline: {format(getEarliestDeadline(patent)!, 'yyyy-MM-dd')}
                      </p>
                    )}
                    
                    {/* Determine the task type based on status flags */}
                    {patent.ps_drafting_status === 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        disabled={!!completing}
                        onClick={() => completeDrafting(patent.id, 'ps')}
                      >
                        {completing === patent.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            Complete PS Draft
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                    
                    {patent.cs_drafting_status === 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        disabled={!!completing}
                        onClick={() => completeDrafting(patent.id, 'cs')}
                      >
                        {completing === patent.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            Complete CS Draft
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                    
                    {patent.fer_drafter_status === 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        disabled={!!completing}
                        onClick={() => completeDrafting(patent.id, 'fer')}
                      >
                        {completing === patent.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            Complete FER Draft
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No Drafting Assignments"
              description="You currently have no patents assigned for drafting."
              buttonText="Refresh"
              onButtonClick={fetchDrafts}
            />
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <LoadingState message="Loading completed drafts..." />
          ) : completedPatents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedPatents.map(patent => (
                <Card key={patent.id} className="bg-white shadow-sm">
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{patent.patent_title}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => fetchDrafts()}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">Tracking ID: {patent.tracking_id}</p>
                    <p className="text-sm text-green-600">Draft Completed</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No Completed Drafts"
              description="You have not completed any drafting assignments yet."
              buttonText="Refresh"
              onButtonClick={fetchDrafts}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Drafts;
