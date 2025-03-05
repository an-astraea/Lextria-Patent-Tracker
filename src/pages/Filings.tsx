import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Edit, CheckCircle, Clock, ListChecks } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, completeFilerTask } from '@/lib/api';

const Filings = () => {
  const navigate = useNavigate();
  const [activeAssignments, setActiveAssignments] = React.useState<Patent[]>([]);
  const [completedAssignments, setCompletedAssignments] = React.useState<Patent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [formStates, setFormStates] = React.useState<Record<string, Record<string, boolean>>>({});

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const active = await fetchFilerAssignments(user.full_name);
        const completed = await fetchFilerCompletedAssignments(user.full_name);
        
        // Initialize form states for CS filings
        const initialFormStates: Record<string, Record<string, boolean>> = {};
        active.forEach(patent => {
          if (patent.cs_filer_assgn === user.full_name) {
            initialFormStates[patent.id] = {
              form_26: patent.form_26 || false,
              form_18: patent.form_18 || false,
              form_18a: patent.form_18a || false,
              form_9: patent.form_9 || false,
              form_9a: patent.form_9a || false,
              form_13: patent.form_13 || false
            };
          }
        });
        
        setFormStates(initialFormStates);
        setActiveAssignments(active);
        setCompletedAssignments(completed);
      } catch (error) {
        console.error('Error fetching filings:', error);
        toast.error('Failed to load filings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.full_name]);

  const handleFormChange = (patentId: string, formName: string, checked: boolean) => {
    setFormStates(prev => ({
      ...prev,
      [patentId]: {
        ...(prev[patentId] || {}),
        [formName]: checked
      }
    }));
  };

  const handleComplete = async (patent: Patent) => {
    try {
      // For CS filings, include form data
      const formData = patent.cs_filer_assgn === user?.full_name 
        ? formStates[patent.id] 
        : undefined;
      
      const success = await completeFilerTask(patent, user?.full_name, formData);
      
      if (success) {
        toast.success('Filing marked as complete and sent for review');
        
        // Update local state to reflect the change
        setActiveAssignments(activeAssignments.filter(item => item.id !== patent.id));
        
        const updatedPatent = {
          ...patent,
          ps_filing_status: patent.ps_filer_assgn === user?.full_name ? 1 : patent.ps_filing_status,
          cs_filing_status: patent.cs_filer_assgn === user?.full_name ? 1 : patent.cs_filing_status,
          fer_filing_status: patent.fer_filer_assgn === user?.full_name ? 1 : patent.fer_filing_status
        };
        
        // For CS filings, update the form values
        if (patent.cs_filer_assgn === user?.full_name && formStates[patent.id]) {
          Object.assign(updatedPatent, formStates[patent.id]);
        }
        
        setCompletedAssignments([...completedAssignments, updatedPatent]);
      }
    } catch (error) {
      console.error('Error completing filing:', error);
      toast.error('Failed to complete filing');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Filings</h1>
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
                      <p className="text-muted-foreground">No active filing assignments</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeAssignments.map((filing) => (
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
                          <div>
                            <span className="font-medium">Task:</span>{' '}
                            {filing.ps_filer_assgn === user.full_name
                              ? "Provisional Specification Filing"
                              : filing.cs_filer_assgn === user.full_name
                              ? "Complete Specification Filing"
                              : "FER Response Filing"}
                          </div>
                          
                          {/* Form checkboxes for CS filing */}
                          {filing.cs_filer_assgn === user.full_name && (
                            <div className="mt-4 space-y-2 border-t pt-2">
                              <div className="text-sm font-medium">Required Forms:</div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`form_26_${filing.id}`} 
                                    checked={formStates[filing.id]?.form_26 || false} 
                                    onCheckedChange={(checked) => 
                                      handleFormChange(filing.id, 'form_26', checked === true)
                                    }
                                  />
                                  <label htmlFor={`form_26_${filing.id}`} className="text-sm">Form 26</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`form_18_${filing.id}`} 
                                    checked={formStates[filing.id]?.form_18 || false} 
                                    onCheckedChange={(checked) => 
                                      handleFormChange(filing.id, 'form_18', checked === true)
                                    }
                                  />
                                  <label htmlFor={`form_18_${filing.id}`} className="text-sm">Form 18</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`form_18a_${filing.id}`} 
                                    checked={formStates[filing.id]?.form_18a || false} 
                                    onCheckedChange={(checked) => 
                                      handleFormChange(filing.id, 'form_18a', checked === true)
                                    }
                                  />
                                  <label htmlFor={`form_18a_${filing.id}`} className="text-sm">Form 18A</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`form_9_${filing.id}`} 
                                    checked={formStates[filing.id]?.form_9 || false} 
                                    onCheckedChange={(checked) => 
                                      handleFormChange(filing.id, 'form_9', checked === true)
                                    }
                                  />
                                  <label htmlFor={`form_9_${filing.id}`} className="text-sm">Form 9</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`form_9a_${filing.id}`} 
                                    checked={formStates[filing.id]?.form_9a || false} 
                                    onCheckedChange={(checked) => 
                                      handleFormChange(filing.id, 'form_9a', checked === true)
                                    }
                                  />
                                  <label htmlFor={`form_9a_${filing.id}`} className="text-sm">Form 9A</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`form_13_${filing.id}`} 
                                    checked={formStates[filing.id]?.form_13 || false} 
                                    onCheckedChange={(checked) => 
                                      handleFormChange(filing.id, 'form_13', checked === true)
                                    }
                                  />
                                  <label htmlFor={`form_13_${filing.id}`} className="text-sm">Form 13</label>
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
                          onClick={() => handleComplete(filing)}
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
                      <p className="text-muted-foreground">No completed filing assignments</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedAssignments.map((filing) => (
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
                            <span className="font-medium">Completed Task:</span>{' '}
                            {filing.ps_filer_assgn === user.full_name
                              ? "Provisional Specification Filing"
                              : filing.cs_filer_assgn === user.full_name
                              ? "Complete Specification Filing"
                              : "FER Response Filing"}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>{' '}
                            <span className="text-amber-600">
                              {(filing.ps_filer_assgn === user.full_name && filing.ps_review_file_status === 1) ||
                              (filing.cs_filer_assgn === user.full_name && filing.cs_review_file_status === 1) ||
                              (filing.fer_filer_assgn === user.full_name && filing.fer_review_file_status === 1)
                                ? "Approved"
                                : "Pending Approval"}
                            </span>
                          </div>
                          
                          {/* Show completed forms for CS filing */}
                          {filing.cs_filer_assgn === user.full_name && (
                            <div className="mt-4 space-y-2 border-t pt-2">
                              <div className="text-sm font-medium">Submitted Forms:</div>
                              <div className="grid grid-cols-2 gap-2">
                                {filing.form_26 && <div className="text-sm">✓ Form 26</div>}
                                {filing.form_18 && <div className="text-sm">✓ Form 18</div>}
                                {filing.form_18a && <div className="text-sm">✓ Form 18A</div>}
                                {filing.form_9 && <div className="text-sm">✓ Form 9</div>}
                                {filing.form_9a && <div className="text-sm">✓ Form 9A</div>}
                                {filing.form_13 && <div className="text-sm">✓ Form 13</div>}
                                {!filing.form_26 && !filing.form_18 && !filing.form_18a && 
                                 !filing.form_9 && !filing.form_9a && !filing.form_13 && 
                                 <div className="text-sm col-span-2">No forms were submitted</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <div className="px-6 pb-6 mt-auto">
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center gap-2" 
                          onClick={() => navigate(`/patents/${filing.id}`)}
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

export default Filings;
