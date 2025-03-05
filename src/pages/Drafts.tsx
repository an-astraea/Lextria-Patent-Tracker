
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Edit } from 'lucide-react';

const Drafts = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = React.useState<Patent[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  React.useEffect(() => {
    // This would be replaced with an actual API call
    const fetchDrafts = async () => {
      try {
        // For now, use the mock data
        const { patents } = await import('@/lib/data');
        
        // Filter patents that are assigned to the current drafter
        const userDrafts = patents.filter(patent => 
          (patent.ps_drafting_status === 0 && patent.ps_drafter_assgn === user.full_name) ||
          (patent.cs_drafting_status === 0 && patent.cs_drafter_assgn === user.full_name) ||
          (patent.fer_drafter_status === 0 && patent.fer_drafter_assgn === user.full_name)
        );
        
        setDrafts(userDrafts);
      } catch (error) {
        console.error('Error fetching drafts:', error);
        toast.error('Failed to load drafts');
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [user?.full_name]);

  const handleComplete = (id: string) => {
    // This would update the draft status in a real application
    toast.success('Draft marked as complete and sent for review');
    
    // Update local state to reflect the change
    setDrafts(drafts.filter(draft => draft.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Drafts</h1>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {drafts.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <p className="text-muted-foreground">No drafts assigned to you</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.map((draft) => (
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
                      className="w-full" 
                      onClick={() => handleComplete(draft.id)}
                    >
                      Complete Draft
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Drafts;
