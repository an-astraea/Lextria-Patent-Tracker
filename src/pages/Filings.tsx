
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPatents, updatePatent } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Patent } from '@/lib/types';
import PatentCard from '@/components/PatentCard';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import PageHeader from '@/components/common/PageHeader';
import FormRequirementsList from '@/components/patent/FormRequirementsList';

const Filings: React.FC = () => {
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [selectedForms, setSelectedForms] = useState<Record<string, boolean>>({});
  const [processingSubmit, setProcessingSubmit] = useState(false);
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  const { data: patents, isLoading, refetch } = useQuery({
    queryKey: ['patents'],
    queryFn: fetchPatents,
  });
  
  // Filter patents based on the user's role and assignment
  const filteredPatents = React.useMemo(() => {
    if (!patents || !user) return [];
    
    if (user.role === 'admin') {
      // Admin sees all patents
      return patents;
    } else if (user.role === 'filer') {
      // Filer sees patents assigned to them
      return patents.filter(patent => 
        patent.ps_filer_assgn === user.full_name || 
        patent.cs_filer_assgn === user.full_name || 
        patent.fer_filer_assgn === user.full_name
      );
    }
    
    return [];
  }, [patents, user]);
  
  // Group patents by stage
  const patentGroups = React.useMemo(() => {
    const psFilingPending = filteredPatents.filter(p => 
      p.ps_drafting_status === 1 && 
      p.ps_review_draft_status === 0 && 
      p.ps_filing_status === 0 && 
      p.ps_filer_assgn === user?.full_name
    );
    
    const csFilingPending = filteredPatents.filter(p => 
      p.cs_drafting_status === 1 && 
      p.cs_review_draft_status === 0 && 
      p.cs_filing_status === 0 && 
      p.cs_filer_assgn === user?.full_name
    );
    
    const ferFilingPending = filteredPatents.filter(p => 
      p.fer_drafter_status === 1 && 
      p.fer_review_draft_status === 0 && 
      p.fer_filing_status === 0 && 
      p.fer_filer_assgn === user?.full_name
    );
    
    const psCompleted = filteredPatents.filter(p => 
      p.ps_filing_status === 1 && 
      p.ps_filer_assgn === user?.full_name
    );
    
    const csCompleted = filteredPatents.filter(p => 
      p.cs_filing_status === 1 && 
      p.cs_filer_assgn === user?.full_name
    );
    
    const ferCompleted = filteredPatents.filter(p => 
      p.fer_filing_status === 1 && 
      p.fer_filer_assgn === user?.full_name
    );
    
    return {
      psFilingPending,
      csFilingPending,
      ferFilingPending,
      psCompleted,
      csCompleted,
      ferCompleted
    };
  }, [filteredPatents, user]);
  
  // Reset selected forms when a new patent is selected
  useEffect(() => {
    if (selectedPatent) {
      const initialForms: Record<string, boolean> = {};
      
      // Find all form_* properties in the patent and set their initial values
      Object.entries(selectedPatent).forEach(([key, value]) => {
        if (key.startsWith('form_')) {
          initialForms[key] = Boolean(value);
        }
      });
      
      setSelectedForms(initialForms);
    } else {
      setSelectedForms({});
    }
  }, [selectedPatent]);
  
  const handleSelectPatent = (patent: Patent) => {
    setSelectedPatent(patent);
  };
  
  const handleFormChange = (formName: string, checked: boolean) => {
    setSelectedForms(prev => ({
      ...prev,
      [formName]: checked
    }));
  };
  
  const handleSubmitFiling = async () => {
    if (!selectedPatent) return;
    
    try {
      setProcessingSubmit(true);
      
      let updateData: Partial<Patent> = {
        ...selectedForms
      };
      
      // Determine which filing status to update based on the user's assignment
      if (selectedPatent.ps_filer_assgn === user?.full_name && selectedPatent.ps_filing_status === 0) {
        updateData.ps_filing_status = 1;
        updateData.ps_review_file_status = 1; // Set for admin review
      } else if (selectedPatent.cs_filer_assgn === user?.full_name && selectedPatent.cs_filing_status === 0) {
        updateData.cs_filing_status = 1;
        updateData.cs_review_file_status = 1; // Set for admin review
      } else if (selectedPatent.fer_filer_assgn === user?.full_name && selectedPatent.fer_filing_status === 0) {
        updateData.fer_filing_status = 1;
        updateData.fer_review_file_status = 1; // Set for admin review
      }
      
      await updatePatent(selectedPatent.id, updateData as any);
      
      toast.success('Filing submitted successfully.');
      refetch();
      setSelectedPatent(null);
    } catch (error) {
      console.error('Error submitting filing:', error);
      toast.error('Failed to submit filing.');
    } finally {
      setProcessingSubmit(false);
    }
  };
  
  const handleUpdateForms = async () => {
    if (!selectedPatent) return;
    
    try {
      setProcessingSubmit(true);
      
      await updatePatent(selectedPatent.id, selectedForms as any);
      
      toast.success('Forms updated successfully.');
      refetch();
      setSelectedPatent(null);
    } catch (error) {
      console.error('Error updating forms:', error);
      toast.error('Failed to update forms.');
    } finally {
      setProcessingSubmit(false);
    }
  };
  
  // Determine the current stage for the selected patent for form selection
  const getCurrentStage = (): 'ps' | 'cs' | 'fer' => {
    if (!selectedPatent) return 'ps';
    
    if (
      (selectedPatent.ps_filing_status === 0 && selectedPatent.ps_filer_assgn === user?.full_name) ||
      (selectedPatent.ps_filing_status === 1 && selectedPatent.ps_filer_assgn === user?.full_name)
    ) {
      return 'ps';
    } else if (
      (selectedPatent.cs_filing_status === 0 && selectedPatent.cs_filer_assgn === user?.full_name) ||
      (selectedPatent.cs_filing_status === 1 && selectedPatent.cs_filer_assgn === user?.full_name)
    ) {
      return 'cs';
    } else {
      return 'fer';
    }
  };
  
  // Check if the patent can be submitted based on the user's assignment and patent status
  const canSubmitFiling = (): boolean => {
    if (!selectedPatent || !user) return false;
    
    return (
      (selectedPatent.ps_filer_assgn === user.full_name && selectedPatent.ps_filing_status === 0) ||
      (selectedPatent.cs_filer_assgn === user.full_name && selectedPatent.cs_filing_status === 0) ||
      (selectedPatent.fer_filer_assgn === user.full_name && selectedPatent.fer_filing_status === 0)
    );
  };
  
  // Check if the forms can be updated (editing forms after submission)
  const canUpdateForms = (): boolean => {
    if (!selectedPatent || !user) return false;
    
    return (
      (selectedPatent.ps_filer_assgn === user.full_name && selectedPatent.ps_filing_status === 1) ||
      (selectedPatent.cs_filer_assgn === user.full_name && selectedPatent.cs_filing_status === 1) ||
      (selectedPatent.fer_filer_assgn === user.full_name && selectedPatent.fer_filing_status === 1)
    );
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Filings"
        subtitle="Manage patent filings and form submissions"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">Pending Filings</TabsTrigger>
              <TabsTrigger value="completed">Completed Filings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Provisional Specification Filings</CardTitle>
                  <CardDescription>
                    Patents pending PS filing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {patentGroups.psFilingPending.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patentGroups.psFilingPending.map(patent => (
                        <PatentCard
                          key={patent.id}
                          patent={patent}
                          onSelect={() => handleSelectPatent(patent)}
                          isSelected={selectedPatent?.id === patent.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      title="No pending PS filings"
                      message="You don't have any pending provisional specification filings."
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Complete Specification Filings</CardTitle>
                  <CardDescription>
                    Patents pending CS filing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {patentGroups.csFilingPending.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patentGroups.csFilingPending.map(patent => (
                        <PatentCard
                          key={patent.id}
                          patent={patent}
                          onSelect={() => handleSelectPatent(patent)}
                          isSelected={selectedPatent?.id === patent.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      title="No pending CS filings"
                      message="You don't have any pending complete specification filings."
                    />
                  )}
                </CardContent>
              </Card>
              
              {patentGroups.ferFilingPending.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>FER Filings</CardTitle>
                    <CardDescription>
                      Patents pending FER filing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patentGroups.ferFilingPending.map(patent => (
                        <PatentCard
                          key={patent.id}
                          patent={patent}
                          onSelect={() => handleSelectPatent(patent)}
                          isSelected={selectedPatent?.id === patent.id}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-6">
              {patentGroups.psCompleted.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Completed PS Filings</CardTitle>
                    <CardDescription>
                      Successfully filed provisional specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patentGroups.psCompleted.map(patent => (
                        <PatentCard
                          key={patent.id}
                          patent={patent}
                          onSelect={() => handleSelectPatent(patent)}
                          isSelected={selectedPatent?.id === patent.id}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {patentGroups.csCompleted.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Completed CS Filings</CardTitle>
                    <CardDescription>
                      Successfully filed complete specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patentGroups.csCompleted.map(patent => (
                        <PatentCard
                          key={patent.id}
                          patent={patent}
                          onSelect={() => handleSelectPatent(patent)}
                          isSelected={selectedPatent?.id === patent.id}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {patentGroups.ferCompleted.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Completed FER Filings</CardTitle>
                    <CardDescription>
                      Successfully filed FER responses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patentGroups.ferCompleted.map(patent => (
                        <PatentCard
                          key={patent.id}
                          patent={patent}
                          onSelect={() => handleSelectPatent(patent)}
                          isSelected={selectedPatent?.id === patent.id}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {patentGroups.psCompleted.length === 0 && patentGroups.csCompleted.length === 0 && patentGroups.ferCompleted.length === 0 && (
                <EmptyState 
                  title="No completed filings"
                  message="You haven't completed any filings yet."
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Filing Forms</CardTitle>
              <CardDescription>
                {selectedPatent 
                  ? `Select forms for ${selectedPatent.patent_title}`
                  : 'Select a patent to start'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPatent ? (
                <div className="space-y-6">
                  <FormRequirementsList 
                    patent={selectedPatent}
                    onChange={handleFormChange}
                    stage={getCurrentStage()}
                  />
                  
                  <div className="flex flex-col space-y-3 mt-6">
                    {canSubmitFiling() && (
                      <Button 
                        onClick={handleSubmitFiling}
                        disabled={processingSubmit}
                        className="w-full"
                      >
                        {processingSubmit ? 'Submitting...' : 'Submit Filing'}
                      </Button>
                    )}
                    
                    {canUpdateForms() && (
                      <Button 
                        onClick={handleUpdateForms}
                        disabled={processingSubmit}
                        variant="outline"
                        className="w-full"
                      >
                        {processingSubmit ? 'Updating...' : 'Update Forms'}
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedPatent(null)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Select a patent from the list to view and manage forms</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Filings;
