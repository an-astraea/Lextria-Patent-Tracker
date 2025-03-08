import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, completeFilerTask } from '@/lib/api';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ClipboardList, CheckCircle, Clock, FileText } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';

const Filings = () => {
  const [pending, setPending] = useState<Patent[]>([]);
  const [completed, setCompleted] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePatent, setActivePatent] = useState<Patent | null>(null);
  const [formValues, setFormValues] = useState<{[key: string]: boolean}>({});
  const [otherForms, setOtherForms] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Redirect if not filer
  useEffect(() => {
    if (user?.role !== 'filer' && user?.role !== 'admin') {
      toast.error('Access denied. Filer privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const pendingAssignments = await fetchFilerAssignments(user.full_name);
        const completedAssignments = await fetchFilerCompletedAssignments(user.full_name);
        
        setPending(pendingAssignments);
        setCompleted(completedAssignments);
      } catch (error) {
        console.error('Error loading filer assignments:', error);
        toast.error('Failed to load assignment data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  const handleOpenPatent = (patent: Patent) => {
    setActivePatent(patent);
    
    // Reset form values
    setFormValues({});
    setOtherForms(patent.other_forms || '');
    
    // Determine which stage this patent is in for this filer
    if (user?.full_name === patent.ps_filer_assgn && patent.ps_filing_status === 0) {
      // PS filing stage - pre-populate with existing values
      const formState: {[key: string]: boolean} = {};
      if (patent.form_01) formState.form_01 = true;
      if (patent.form_02_ps) formState.form_02_ps = true;
      // Add other PS forms as needed
      setFormValues(formState);
    } else if (user?.full_name === patent.cs_filer_assgn && patent.cs_filing_status === 0) {
      // CS filing stage - pre-populate with existing values
      const formState: {[key: string]: boolean} = {};
      if (patent.form_01) formState.form_01 = true;
      if (patent.form_02_cs) formState.form_02_cs = true;
      if (patent.form_03) formState.form_03 = true;
      if (patent.form_04) formState.form_04 = true;
      if (patent.form_18) formState.form_18 = true;
      if (patent.form_18a) formState.form_18a = true;
      // Add other CS forms as needed
      setFormValues(formState);
    } else if (user?.full_name === patent.fer_filer_assgn && patent.fer_filing_status === 0) {
      // FER filing stage - pre-populate with existing values
      const formState: {[key: string]: boolean} = {};
      if (patent.form_13) formState.form_13 = true;
      // Add other FER forms as needed
      setFormValues(formState);
    }
  };
  
  const handleClosePatent = () => {
    setActivePatent(null);
    setFormValues({});
    setOtherForms('');
  };
  
  const handleFormChange = (formId: string, checked: boolean) => {
    setFormValues(prev => ({
      ...prev,
      [formId]: checked
    }));
  };
  
  const handleSubmit = async () => {
    if (!activePatent || !user) return;
    
    try {
      setSubmitting(true);
      
      // Build form data
      const formData = {
        ...formValues,
        other_forms: otherForms || null
      };
      
      const success = await completeFilerTask(activePatent, user.full_name, formData);
      
      if (success) {
        toast.success('Filing completed and submitted for review');
        
        // Update lists
        const pendingAssignments = await fetchFilerAssignments(user.full_name);
        const completedAssignments = await fetchFilerCompletedAssignments(user.full_name);
        
        setPending(pendingAssignments);
        setCompleted(completedAssignments);
        
        handleClosePatent();
      } else {
        toast.error('Failed to complete filing');
      }
    } catch (error) {
      console.error('Error completing filing:', error);
      toast.error('An error occurred while submitting the forms');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to determine which form checkboxes to show based on patent stage
  const renderFormCheckboxes = () => {
    if (!activePatent || !user) return null;
    
    // PS Filing stage
    if (user.full_name === activePatent.ps_filer_assgn && activePatent.ps_filing_status === 0) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Provisional Specification Forms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="form_01" 
                checked={formValues.form_01 || false}
                onCheckedChange={(checked) => handleFormChange('form_01', checked as boolean)}
              />
              <label htmlFor="form_01" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Form 1 - Application for Patent
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="form_02_ps" 
                checked={formValues.form_02_ps || false}
                onCheckedChange={(checked) => handleFormChange('form_02_ps', checked as boolean)}
              />
              <label htmlFor="form_02_ps" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Form 2 - Provisional Specification
              </label>
            </div>
            {/* Add any additional PS specific forms here */}
          </div>
        </div>
      );
    }
    
    // CS Filing stage
    if (user.full_name === activePatent.cs_filer_assgn && activePatent.cs_filing_status === 0) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Complete Specification Forms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="form_01" 
                checked={formValues.form_01 || false}
                onCheckedChange={(checked) => handleFormChange('form_01', checked as boolean)}
              />
              <label htmlFor="form_01" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Form 1 - Application for Patent
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="form_02_cs" 
                checked={formValues.form_02_cs || false}
                onCheckedChange={(checked) => handleFormChange('form_02_cs', checked as boolean)}
              />
              <label htmlFor="form_02_cs" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Form 2 - Complete Specification
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="form_03" 
                checked={formValues.form_03 || false}
                onCheckedChange={(checked) => handleFormChange('form_03', checked as boolean)}
              />
              <label htmlFor="form_03" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Form 3 - Declaration of Inventorship
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="form_04" 
                checked={formValues.form_04 || false}
                onCheckedChange={(checked) => handleFormChange('form_04', checked as boolean)}
              />
              <label htmlFor="form_04" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Form 4 - Request for Early Publication
              </label>
            </div>
            {/* Add other CS-specific forms here */}
          </div>
        </div>
      );
    }
    
    // FER Filing stage
    if (user.full_name === activePatent.fer_filer_assgn && activePatent.fer_filing_status === 0) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">FER Response Forms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="form_13" 
                checked={formValues.form_13 || false}
                onCheckedChange={(checked) => handleFormChange('form_13', checked as boolean)}
              />
              <label htmlFor="form_13" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Form 13 - FER Response
              </label>
            </div>
            {/* Add any additional FER-specific forms here */}
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  const renderPatentList = () => (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pending" className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Pending ({pending.length})
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Completed ({completed.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending">
        {pending.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pending.map(patent => (
              <Card key={patent.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOpenPatent(patent)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{patent.patent_title}</CardTitle>
                  <CardDescription>ID: {patent.tracking_id}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm">
                    <p>Applicant: {patent.patent_applicant}</p>
                    <p>Client: {patent.client_id}</p>
                    
                    {/* Show which filing stage this patent is in for this filer */}
                    {user?.full_name === patent.ps_filer_assgn && patent.ps_filing_status === 0 && (
                      <div className="mt-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        PS Filing Stage
                      </div>
                    )}
                    {user?.full_name === patent.cs_filer_assgn && patent.cs_filing_status === 0 && (
                      <div className="mt-2 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        CS Filing Stage
                      </div>
                    )}
                    {user?.full_name === patent.fer_filer_assgn && patent.fer_filing_status === 0 && (
                      <div className="mt-2 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                        FER Filing Stage
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Fill Forms
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="w-10 h-10 text-muted-foreground" />}
            title="No pending assignments"
            message="You don't have any pending filing assignments at the moment."
          />
        )}
      </TabsContent>
      
      <TabsContent value="completed">
        {completed.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completed.map(patent => (
              <Card key={patent.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{patent.patent_title}</CardTitle>
                  <CardDescription>ID: {patent.tracking_id}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm">
                    <p>Applicant: {patent.patent_applicant}</p>
                    <p>Client: {patent.client_id}</p>
                    
                    {/* Show which filing was completed by this filer */}
                    {user?.full_name === patent.ps_filer_assgn && patent.ps_filing_status === 1 && (
                      <div className="mt-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        PS Filing Completed
                        {patent.ps_review_file_status === 0 ? " - Approved" : " - Under Review"}
                      </div>
                    )}
                    {user?.full_name === patent.cs_filer_assgn && patent.cs_filing_status === 1 && (
                      <div className="mt-2 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        CS Filing Completed
                        {patent.cs_review_file_status === 0 ? " - Approved" : " - Under Review"}
                      </div>
                    )}
                    {user?.full_name === patent.fer_filer_assgn && patent.fer_filing_status === 1 && (
                      <div className="mt-2 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                        FER Filing Completed
                        {patent.fer_review_file_status === 0 ? " - Approved" : " - Under Review"}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/patents/${patent.id}`)}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CheckCircle className="w-10 h-10 text-muted-foreground" />}
            title="No completed assignments"
            message="You haven't completed any filing assignments yet."
          />
        )}
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <PageHeader
        title="Patent Filings"
        subtitle="Manage your patent filing assignments"
      />
      
      {loading ? (
        <LoadingState size="lg" text="Loading filing assignments..." className="py-12" />
      ) : (
        <>
          {activePatent ? (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Complete Filing: {activePatent.patent_title}</CardTitle>
                    <CardDescription className="mt-2">
                      Tracking ID: {activePatent.tracking_id} | Applicant: {activePatent.patent_applicant}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleClosePatent}>
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {renderFormCheckboxes()}
                  
                  <div className="space-y-2">
                    <label htmlFor="other_forms" className="text-sm font-medium">
                      Other Forms (specify):
                    </label>
                    <textarea
                      id="other_forms"
                      className="w-full h-24 px-3 py-2 border rounded-md"
                      value={otherForms}
                      onChange={(e) => setOtherForms(e.target.value)}
                      placeholder="List any other forms not mentioned above..."
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="flex items-center"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Filing
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            renderPatentList()
          )}
        </>
      )}
    </div>
  );
};

export default Filings;
