
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { fetchDrafterAssignments, fetchDrafterCompletedAssignments, completeDrafterTask } from '@/lib/api';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';

const Drafts = () => {
  const navigate = useNavigate();
  const [activePatents, setActivePatents] = useState<Patent[]>([]);
  const [completedPatents, setCompletedPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Redirect if not drafter
  React.useEffect(() => {
    if (!user || user.role !== 'drafter') {
      toast.error('Access denied. Drafter privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadPatents = async () => {
      if (user && user.role === 'drafter') {
        try {
          setLoading(true);
          const [activeData, completedData] = await Promise.all([
            fetchDrafterAssignments(user.full_name),
            fetchDrafterCompletedAssignments(user.full_name)
          ]);
          
          // Sort by queue logic
          const sortedActivePatents = activeData.sort((a, b) => {
            const getQueueOrder = (patent: Patent) => {
              if (patent.ps_drafter_assgn === user.full_name && patent.ps_drafting_status === 0) {
                return 1; // PS has highest priority
              } else if (patent.cs_drafter_assgn === user.full_name && patent.cs_drafting_status === 0) {
                return 2; // CS has second priority
              } else if (patent.fer_drafter_assgn === user.full_name && patent.fer_drafter_status === 0) {
                return 3; // FER has lowest priority
              }
              return 4; // Default
            };
            
            return getQueueOrder(a) - getQueueOrder(b);
          });
          
          setActivePatents(sortedActivePatents);
          setCompletedPatents(completedData);
        } catch (error) {
          console.error('Error loading drafter assignments:', error);
          toast.error('Failed to load assignments');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadPatents();
  }, [user, refreshKey]);

  const handleComplete = async (patent: Patent) => {
    if (!user) return;
    
    try {
      const success = await completeDrafterTask(patent, user.full_name);
      if (success) {
        toast.success('Drafting task completed and sent for review');
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error completing drafting task:', error);
      toast.error('Failed to complete drafting task');
    }
  };

  // Determine which task is active for this drafter
  const getTaskType = (patent: Patent) => {
    if (patent.ps_drafter_assgn === user?.full_name && patent.ps_drafting_status === 0) {
      return 'Provisional Specification';
    } else if (patent.cs_drafter_assgn === user?.full_name && patent.cs_drafting_status === 0) {
      return 'Complete Specification';
    } else if (patent.fer_drafter_assgn === user?.full_name && patent.fer_drafter_status === 0) {
      return 'First Examination Report';
    }
    return 'Unknown Task';
  };

  // Get the deadline for the active task
  const getDeadline = (patent: Patent) => {
    if (patent.ps_drafter_assgn === user?.full_name && patent.ps_drafting_status === 0) {
      return patent.ps_drafter_deadline;
    } else if (patent.cs_drafter_assgn === user?.full_name && patent.cs_drafting_status === 0) {
      return patent.cs_drafter_deadline;
    } else if (patent.fer_drafter_assgn === user?.full_name && patent.fer_drafter_status === 0) {
      return patent.fer_drafter_deadline;
    }
    return null;
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline set';
    return new Date(dateString).toLocaleDateString();
  };

  // Check if a task is available based on queue order
  const isTaskAvailable = (patent: Patent) => {
    if (patent.ps_drafter_assgn === user?.full_name && patent.ps_drafting_status === 0) {
      return true; // PS is always available if assigned
    } 
    
    if (patent.cs_drafter_assgn === user?.full_name && patent.cs_drafting_status === 0) {
      // CS is available if PS is not assigned or PS is completed
      return !patent.ps_drafter_assgn || patent.ps_drafting_status === 1;
    }
    
    if (patent.fer_drafter_assgn === user?.full_name && patent.fer_drafter_status === 0) {
      // FER is available if PS and CS are not assigned or they are completed
      const psCompleted = !patent.ps_drafter_assgn || patent.ps_drafting_status === 1;
      const csCompleted = !patent.cs_drafter_assgn || patent.cs_drafting_status === 1;
      return psCompleted && csCompleted;
    }
    
    return false;
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Drafting Assignments</h1>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Tasks ({activePatents.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Tasks ({completedPatents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : activePatents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePatents.map(patent => (
                <Card key={patent.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <div className="truncate">{patent.patent_title}</div>
                      <StatusBadge type={isTaskAvailable(patent) ? 'active' : 'pending'} />
                    </CardTitle>
                    <CardDescription>ID: {patent.tracking_id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Applicant:</span> {patent.patent_applicant}</div>
                      <div><span className="font-medium">Task:</span> {getTaskType(patent)}</div>
                      <div><span className="font-medium">Client ID:</span> {patent.client_id}</div>
                      <div><span className="font-medium">Deadline:</span> {formatDate(getDeadline(patent))}</div>
                      
                      <div className="pt-2 flex justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/patents/${patent.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleComplete(patent)}
                          disabled={!isTaskAvailable(patent)}
                        >
                          Complete & Submit
                        </Button>
                      </div>
                      
                      {!isTaskAvailable(patent) && (
                        <div className="text-amber-600 font-medium text-xs mt-1">
                          Waiting for previous stage to be completed
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-gray-500">No active drafting tasks found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : completedPatents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedPatents.map(patent => (
                <Card key={patent.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <div className="truncate">{patent.patent_title}</div>
                      <StatusBadge type="completed" />
                    </CardTitle>
                    <CardDescription>ID: {patent.tracking_id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Applicant:</span> {patent.patent_applicant}</div>
                      <div><span className="font-medium">Client ID:</span> {patent.client_id}</div>
                      <div><span className="font-medium">Filing Date:</span> {formatDate(patent.date_of_filing)}</div>
                      
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/patents/${patent.id}`)}
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-gray-500">No completed drafting tasks found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Drafts;
