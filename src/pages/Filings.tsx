
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Edit, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const Filings = () => {
  const navigate = useNavigate();
  const [filings, setFilings] = React.useState<Patent[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  React.useEffect(() => {
    // This would be replaced with an actual API call
    const fetchFilings = async () => {
      try {
        // For now, use the mock data
        const { patents } = await import('@/lib/data');
        
        // Filter patents that are assigned to the current filer
        const userFilings = patents.filter(patent => 
          (patent.ps_filing_status === 0 && patent.ps_filer_assgn === user.full_name) ||
          (patent.cs_filing_status === 0 && patent.cs_filer_assgn === user.full_name) ||
          (patent.fer_filing_status === 0 && patent.fer_filer_assgn === user.full_name)
        );
        
        setFilings(userFilings);
      } catch (error) {
        console.error('Error fetching filings:', error);
        toast.error('Failed to load filings');
      } finally {
        setLoading(false);
      }
    };

    fetchFilings();
  }, [user?.full_name]);

  const handleComplete = (id: string) => {
    // This would update the filing status in a real application
    toast.success('Filing marked as complete and sent for review');
    
    // Update local state to reflect the change
    setFilings(filings.filter(filing => filing.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Filings</h1>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {filings.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <p className="text-muted-foreground">No filings assigned to you</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filings.map((filing) => (
                <Card key={filing.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">{filing.patent_title}</CardTitle>
                    <CardDescription>{filing.tracking_id}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Applicant:</span> {filing.patent_applicant}
                      </div>
                      <div>
                        <span className="font-medium">Filing Date:</span> {new Date(filing.date_of_filing).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Deadline:</span>{' '}
                        {new Date(
                          filing.ps_filer_assgn === user.full_name
                            ? filing.ps_filer_deadline
                            : filing.cs_filer_assgn === user.full_name
                            ? filing.cs_filer_deadline
                            : filing.fer_filer_deadline
                        ).toLocaleDateString()}
                      </div>
                      
                      {/* Form checkboxes for CS filing */}
                      {filing.cs_filer_assgn === user.full_name && (
                        <div className="mt-4 space-y-2 border-t pt-2">
                          <div className="text-sm font-medium">Required Forms:</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="form_26" defaultChecked={filing.form_26 || false} />
                              <label htmlFor="form_26" className="text-sm">Form 26</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="form_18" defaultChecked={filing.form_18 || false} />
                              <label htmlFor="form_18" className="text-sm">Form 18</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="form_18a" defaultChecked={filing.form_18a || false} />
                              <label htmlFor="form_18a" className="text-sm">Form 18A</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="form_9" defaultChecked={filing.form_9 || false} />
                              <label htmlFor="form_9" className="text-sm">Form 9</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="form_9a" defaultChecked={filing.form_9a || false} />
                              <label htmlFor="form_9a" className="text-sm">Form 9A</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="form_13" defaultChecked={filing.form_13 || false} />
                              <label htmlFor="form_13" className="text-sm">Form 13</label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="px-6 pb-6 mt-auto space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2" 
                      onClick={() => navigate(`/patents/${filing.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button 
                      className="w-full flex items-center gap-2" 
                      onClick={() => handleComplete(filing.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Complete Filing
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

export default Filings;
