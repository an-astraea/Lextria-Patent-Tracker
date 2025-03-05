
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { fetchDrafterAssignments, fetchDrafterCompletedAssignments, completeDrafterTask } from '@/lib/api';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import RefreshButton from '@/components/approvals/RefreshButton';
import LoadingSpinner from '@/components/approvals/LoadingSpinner';
import EmptyApprovals from '@/components/approvals/EmptyApprovals';

const Drafts = () => {
  const navigate = useNavigate();
  const [activePatents, setActivePatents] = useState<Patent[]>([]);
  const [completedPatents, setCompletedPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  React.useEffect(() => {
    if (!user || user.role !== 'drafter') {
      toast.error('Access denied. Drafter privileges required.');
      navigate('/dashboard');
    } else if (!initialLoadComplete) {
      loadPatents();
    }
  }, [user, navigate, initialLoadComplete]);

  const loadPatents = async (isRefresh = false) => {
    if (!user || user.role !== 'drafter') return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [activeData, completedData] = await Promise.all([
        fetchDrafterAssignments(user.full_name),
        fetchDrafterCompletedAssignments(user.full_name)
      ]);
      
      const sortedActivePatents = activeData.sort((a, b) => {
        const getQueueOrder = (patent: Patent) => {
          if (patent.ps_drafter_assgn === user.full_name && patent.ps_drafting_status === 0) {
            return 1;
          } else if (patent.cs_drafter_assgn === user.full_name && patent.cs_drafting_status === 0) {
            return 2;
          } else if (patent.fer_drafter_assgn === user.full_name && patent.fer_drafter_status === 0) {
            return 3;
          }
          return 4;
        };
        
        return getQueueOrder(a) - getQueueOrder(b);
      });
      
      setActivePatents(sortedActivePatents);
      setCompletedPatents(completedData);
      setInitialLoadComplete(true);
    } catch (error) {
      console.error('Error loading drafter assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadPatents(true);
  };

  const handleComplete = async (patent: Patent) => {
    if (!user) return;
    
    try {
      const success = await completeDrafterTask(patent, user.full_name);
      if (success) {
        toast.success('Drafting task completed and sent for review');
        
        // Update local state to reflect changes without needing to reload
        const updatedPatent = { ...patent };
        
        if (patent.ps_drafter_assgn === user.full_name) {
          updatedPatent.ps_drafting_status = 1;
          updatedPatent.ps_review_draft_status = 1;
        } else if (patent.cs_drafter_assgn === user.full_name) {
          updatedPatent.cs_drafting_status = 1;
          updatedPatent.cs_review_draft_status = 1;
        } else if (patent.fer_drafter_assgn === user.full_name) {
          updatedPatent.fer_drafter_status = 1;
          updatedPatent.fer_review_draft_status = 1;
        }
        
        // Remove from active patents
        setActivePatents(prevPatents => prevPatents.filter(p => p.id !== patent.id));
        
        // Add to completed patents
        setCompletedPatents(prevPatents => [updatedPatent, ...prevPatents]);
      }
    } catch (error) {
      console.error('Error completing drafting task:', error);
      toast.error('Failed to complete drafting task');
    }
  };

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline set';
    return new Date(dateString).toLocaleDateString();
  };

  const isTaskAvailable = (patent: Patent) => {
    if (patent.ps_drafter_assgn === user?.full_name && patent.ps_drafting_status === 0) {
      return true;
    } 
    
    if (patent.cs_drafter_assgn === user?.full_name && patent.cs_drafting_status === 0) {
      return !patent.ps_drafter_assgn || patent.ps_drafting_status === 1;
    }
    
    if (patent.fer_drafter_assgn === user?.full_name && patent.fer_drafter_status === 0) {
      const psCompleted = !patent.ps_drafter_assgn || patent.ps_drafting_status === 1;
      const csCompleted = !patent.cs_drafter_assgn || patent.cs_drafting_status === 1;
      return psCompleted && csCompleted;
    }
    
    return false;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Drafting Assignments</h1>
        <RefreshButton onRefresh={handleRefresh} loading={refreshing} />
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Tasks ({activePatents.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Tasks ({completedPatents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {loading ? (
            <LoadingSpinner />
          ) : activePatents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePatents.map(patent => (
                <Card key={patent.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <div className="truncate">{patent.patent_title}</div>
                      <StatusBadge status={isTaskAvailable(patent) ? 'active' : 'pending'} />
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
                          Complete & Submit for Review
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
            <EmptyApprovals />
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {loading ? (
            <LoadingSpinner />
          ) : completedPatents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedPatents.map(patent => (
                <Card key={patent.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <div className="truncate">{patent.patent_title}</div>
                      <StatusBadge status="completed" />
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
            <EmptyApprovals />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Drafts;
