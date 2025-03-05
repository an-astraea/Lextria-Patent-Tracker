
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Edit, Check, Clock, ListChecks } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchDrafterAssignments, fetchDrafterCompletedAssignments, completeDrafterTask } from '@/lib/api';

const Drafts = () => {
  const navigate = useNavigate();
  const [activeAssignments, setActiveAssignments] = React.useState<Patent[]>([]);
  const [completedAssignments, setCompletedAssignments] = React.useState<Patent[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const active = await fetchDrafterAssignments(user.full_name);
        const completed = await fetchDrafterCompletedAssignments(user.full_name);
        
        setActiveAssignments(active);
        setCompletedAssignments(completed);
      } catch (error) {
        console.error('Error fetching drafts:', error);
        toast.error('Failed to load drafts');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.full_name]);

  const handleComplete = async (patent: Patent) => {
    try {
      const success = await completeDrafterTask(patent, user?.full_name);
      
      if (success) {
        toast.success('Draft marked as complete and sent for review');
        
        // Update local state to reflect the change
        setActiveAssignments(activeAssignments.filter(item => item.id !== patent.id));
        setCompletedAssignments([...completedAssignments, {
          ...patent,
          ps_drafting_status: patent.ps_drafter_assgn === user?.full_name ? 1 : patent.ps_drafting_status,
          cs_drafting_status: patent.cs_drafter_assgn === user?.full_name ? 1 : patent.cs_drafting_status,
          fer_drafter_status: patent.fer_drafter_assgn === user?.full_name ? 1 : patent.fer_drafter_status
        }]);
      }
    } catch (error) {
      console.error('Error completing draft:', error);
      toast.error('Failed to complete draft');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Drafts</h1>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Active Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span>Completed</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="pt-4">
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {activeAssignments.length === 0 ? (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center">
                      <p className="text-muted-foreground">No active drafting assignments</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeAssignments.map((draft) => (
                    <Card key={draft.id} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">{draft.patent_title}</CardTitle>
                        <CardDescription>{draft.tracking_id}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Applicant:</span> {draft.patent_applicant}
                          </div>
                          <div>
                            <span className="font-medium">Filing Date:</span> {new Date(draft.date_of_filing).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Deadline:</span>{' '}
                            {new Date(
                              draft.ps_drafter_assgn === user.full_name
                                ? draft.ps_drafter_deadline
                                : draft.cs_drafter_assgn === user.full_name
                                ? draft.cs_drafter_deadline
                                : draft.fer_drafter_deadline
                            ).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Task:</span>{' '}
                            {draft.ps_drafter_assgn === user.full_name
                              ? "Provisional Specification Drafting"
                              : draft.cs_drafter_assgn === user.full_name
                              ? "Complete Specification Drafting"
                              : "FER Response Drafting"}
                          </div>
                        </div>
                      </CardContent>
                      <div className="px-6 pb-6 mt-auto space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center gap-2" 
                          onClick={() => navigate(`/patents/${draft.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                          View Details
                        </Button>
                        <Button 
                          className="w-full flex items-center gap-2" 
                          onClick={() => handleComplete(draft)}
                        >
                          <Check className="h-4 w-4" />
                          Complete Draft
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="pt-4">
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {completedAssignments.length === 0 ? (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center">
                      <p className="text-muted-foreground">No completed drafting assignments</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedAssignments.map((draft) => (
                    <Card key={draft.id} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">{draft.patent_title}</CardTitle>
                        <CardDescription>{draft.tracking_id}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Applicant:</span> {draft.patent_applicant}
                          </div>
                          <div>
                            <span className="font-medium">Filing Date:</span> {new Date(draft.date_of_filing).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Completed Task:</span>{' '}
                            {draft.ps_drafter_assgn === user.full_name
                              ? "Provisional Specification Drafting"
                              : draft.cs_drafter_assgn === user.full_name
                              ? "Complete Specification Drafting"
                              : "FER Response Drafting"}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>{' '}
                            <span className="text-amber-600">
                              {(draft.ps_drafter_assgn === user.full_name && draft.ps_review_draft_status === 1) ||
                              (draft.cs_drafter_assgn === user.full_name && draft.cs_review_draft_status === 1) ||
                              (draft.fer_drafter_assgn === user.full_name && draft.fer_review_draft_status === 1)
                                ? "Approved"
                                : "Pending Approval"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="px-6 pb-6 mt-auto">
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center gap-2" 
                          onClick={() => navigate(`/patents/${draft.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Drafts;
