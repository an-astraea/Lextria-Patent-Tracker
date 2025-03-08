import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { fetchPatentById } from '@/lib/api';
import { Patent } from '@/lib/types';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import PatentNotes from '@/components/patent/PatentNotes';

const PatentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patent, setPatent] = React.useState<Patent | null>(null);
  const [loading, setLoading] = React.useState(true);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  React.useEffect(() => {
    const fetchPatent = async () => {
      try {
        if (id) {
          const foundPatent = await fetchPatentById(id);
          setPatent(foundPatent || null);
        }
      } catch (error) {
        console.error('Error fetching patent:', error);
        toast.error('Failed to load patent details');
      } finally {
        setLoading(false);
      }
    };

    fetchPatent();
  }, [id]);

  const handleDelete = () => {
    toast.success('Patent deleted successfully');
    navigate('/patents');
  };

  const handleNotesUpdated = (notes: string) => {
    if (patent) {
      setPatent({ ...patent, notes });
    }
  };

  const canEditNotes = React.useMemo(() => {
    if (!user || !patent) return false;
    
    return (
      user.role === 'admin' || 
      (user.role === 'drafter' && (
        patent.ps_drafter_assgn === user.full_name ||
        patent.cs_drafter_assgn === user.full_name ||
        patent.fer_drafter_assgn === user.full_name
      ))
    );
  }, [user, patent]);

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patent) {
    return (
      <div className="text-center my-12">
        <h2 className="text-2xl font-bold">Patent not found</h2>
        <p className="text-muted-foreground mt-2">The patent you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/patents')} className="mt-4">
          Back to Patents
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold truncate">{patent.patent_title}</h1>
        </div>
        
        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/patents/edit/${patent.id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Patent Information</CardTitle>
            <CardDescription>Details of patent {patent.tracking_id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Tracking ID</div>
                <div>{patent.tracking_id}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Client ID</div>
                <div>{patent.client_id}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Applicant</div>
                <div>{patent.patent_applicant}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Application No.</div>
                <div>{patent.application_no || 'Not assigned yet'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Filing Date</div>
                <div>{new Date(patent.date_of_filing).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Created At</div>
                <div>{new Date(patent.created_at).toLocaleString()}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm font-medium text-muted-foreground">Applicant Address</div>
                <div>{patent.applicant_addr}</div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Inventors</div>
              {patent.inventors && patent.inventors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patent.inventors.map((inventor) => (
                    <Card key={inventor.id} className="bg-secondary/50">
                      <CardContent className="p-4">
                        <div className="font-medium">{inventor.inventor_name}</div>
                        <div className="text-sm text-muted-foreground">{inventor.inventor_addr}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No inventors listed</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Inventor Phone</div>
              <div>{patent.inventor_ph_no}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Inventor Email</div>
              <div>{patent.inventor_email}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <PatentNotes 
        patent={patent} 
        onNotesUpdated={handleNotesUpdated} 
        canEdit={canEditNotes}
      />
      
      <Tabs defaultValue="provisional">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="provisional">Provisional Spec</TabsTrigger>
          <TabsTrigger value="complete">Complete Spec</TabsTrigger>
          <TabsTrigger value="fer">FER</TabsTrigger>
        </TabsList>
        
        <TabsContent value="provisional" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Provisional Specification</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={patent.ps_drafting_status ? "secondary" : "outline"}>
                  {patent.ps_drafting_status ? "Drafted" : "Drafting Pending"}
                </Badge>
                <Badge variant={patent.ps_review_draft_status ? "secondary" : "outline"}>
                  {patent.ps_review_draft_status ? "Draft Reviewed" : "Draft Review Pending"}
                </Badge>
                <Badge variant={patent.ps_filing_status ? "secondary" : "outline"}>
                  {patent.ps_filing_status ? "Filed" : "Filing Pending"}
                </Badge>
                <Badge variant={patent.ps_review_file_status ? "secondary" : "outline"}>
                  {patent.ps_review_file_status ? "Filing Reviewed" : "Filing Review Pending"}
                </Badge>
                <Badge variant={patent.ps_completion_status ? "secondary" : "outline"}>
                  {patent.ps_completion_status ? "Completed" : "Incomplete"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Drafter</div>
                  <div>{patent.ps_drafter_assgn || 'Not assigned'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Drafting Deadline</div>
                  <div>{patent.ps_drafter_deadline ? new Date(patent.ps_drafter_deadline).toLocaleDateString() : 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Filer</div>
                  <div>{patent.ps_filer_assgn || 'Not assigned'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Filing Deadline</div>
                  <div>{patent.ps_filer_deadline ? new Date(patent.ps_filer_deadline).toLocaleDateString() : 'Not set'}</div>
                </div>
              </div>
              
              {patent.ps_filing_status ? (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Forms</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <div className={`h-4 w-4 rounded-full ${patent.form_01 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Form 01 - Application</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`h-4 w-4 rounded-full ${patent.form_02_ps ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Form 02 - Provisional Spec</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`h-4 w-4 rounded-full ${patent.form_26 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Form 26 - Power of Attorney</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="complete" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Specification</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={patent.cs_drafting_status ? "secondary" : "outline"}>
                  {patent.cs_drafting_status ? "Drafted" : "Drafting Pending"}
                </Badge>
                <Badge variant={patent.cs_review_draft_status ? "secondary" : "outline"}>
                  {patent.cs_review_draft_status ? "Draft Reviewed" : "Draft Review Pending"}
                </Badge>
                <Badge variant={patent.cs_filing_status ? "secondary" : "outline"}>
                  {patent.cs_filing_status ? "Filed" : "Filing Pending"}
                </Badge>
                <Badge variant={patent.cs_review_file_status ? "secondary" : "outline"}>
                  {patent.cs_review_file_status ? "Filing Reviewed" : "Filing Review Pending"}
                </Badge>
                <Badge variant={patent.cs_completion_status ? "secondary" : "outline"}>
                  {patent.cs_completion_status ? "Completed" : "Incomplete"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Drafter</div>
                  <div>{patent.cs_drafter_assgn || 'Not assigned'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Drafting Deadline</div>
                  <div>{patent.cs_drafter_deadline ? new Date(patent.cs_drafter_deadline).toLocaleDateString() : 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Filer</div>
                  <div>{patent.cs_filer_assgn || 'Not assigned'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Filing Deadline</div>
                  <div>{patent.cs_filer_deadline ? new Date(patent.cs_filer_deadline).toLocaleDateString() : 'Not set'}</div>
                </div>
              </div>
              
              {patent.cs_filing_status ? (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Forms</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {patent.form_01 && <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Form 01</span>
                    </div>}
                    {patent.form_02_cs && <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Form 02 - Complete Spec</span>
                    </div>}
                    {patent.form_9 && <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Form 9</span>
                    </div>}
                    {patent.form_9a && <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Form 9A</span>
                    </div>}
                    {patent.form_18 && <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Form 18</span>
                    </div>}
                    {patent.form_18a && <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Form 18A</span>
                    </div>}
                    {patent.form_13 && <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Form 13</span>
                    </div>}
                    {patent.form_26 && <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Form 26</span>
                    </div>}
                    
                    {Object.entries(patent).filter(([key, value]) => 
                      key.startsWith('form_') && value === true
                    ).length > 8 && (
                      <div className="flex items-center space-x-2 col-span-full">
                        <div className="h-4 w-4 rounded-full bg-green-500"></div>
                        <span>
                          {Object.entries(patent).filter(([key, value]) => 
                            key.startsWith('form_') && value === true
                          ).length} Forms Submitted
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {patent.other_forms && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-muted-foreground">Other Forms / Notes</div>
                      <div className="mt-1 text-sm">{patent.other_forms}</div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fer" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>First Examination Report (FER)</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={patent.fer_status ? "secondary" : "outline"}>
                  {patent.fer_status ? "FER Enabled" : "No FER"}
                </Badge>
                {patent.fer_status ? (
                  <>
                    <Badge variant={patent.fer_drafter_status ? "secondary" : "outline"}>
                      {patent.fer_drafter_status ? "FER Drafted" : "FER Drafting Pending"}
                    </Badge>
                    <Badge variant={patent.fer_review_draft_status ? "secondary" : "outline"}>
                      {patent.fer_review_draft_status ? "FER Draft Reviewed" : "FER Draft Review Pending"}
                    </Badge>
                    <Badge variant={patent.fer_filing_status ? "secondary" : "outline"}>
                      {patent.fer_filing_status ? "FER Filed" : "FER Filing Pending"}
                    </Badge>
                    <Badge variant={patent.fer_review_file_status ? "secondary" : "outline"}>
                      {patent.fer_review_file_status ? "FER Filing Reviewed" : "FER Filing Review Pending"}
                    </Badge>
                    <Badge variant={patent.fer_completion_status ? "secondary" : "outline"}>
                      {patent.fer_completion_status ? "FER Completed" : "FER Incomplete"}
                    </Badge>
                  </>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {patent.fer_status ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">FER Drafter</div>
                    <div>{patent.fer_drafter_assgn || 'Not assigned'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">FER Drafting Deadline</div>
                    <div>{patent.fer_drafter_deadline ? new Date(patent.fer_drafter_deadline).toLocaleDateString() : 'Not set'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">FER Filer</div>
                    <div>{patent.fer_filer_assgn || 'Not assigned'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">FER Filing Deadline</div>
                    <div>{patent.fer_filer_deadline ? new Date(patent.fer_filer_deadline).toLocaleDateString() : 'Not set'}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">FER not required or not yet initiated for this patent</p>
                  {user?.role === 'admin' && (
                    <Button className="mt-4" onClick={() => toast.info('FER would be enabled in a real application')}>
                      Enable FER
                    </Button>
                  )}
                </div>
              )}
              
              {patent.fer_history && patent.fer_history.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">FER History</div>
                  <div className="space-y-3">
                    {patent.fer_history.map((history, index) => (
                      <Card key={history.id || index} className="bg-secondary/50">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Drafter:</span> {history.fer_drafter_assgn}
                            </div>
                            <div>
                              <span className="font-medium">Deadline:</span> {history.fer_drafter_deadline ? new Date(history.fer_drafter_deadline).toLocaleDateString() : 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Filer:</span> {history.fer_filer_assgn}
                            </div>
                            <div>
                              <span className="font-medium">Deadline:</span> {history.fer_filer_deadline ? new Date(history.fer_filer_deadline).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatentDetails;

