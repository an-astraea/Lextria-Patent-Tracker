
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, completeFilerTask } from '@/lib/api';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ClipboardList, CheckCircle, Clock, FileText, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';

const CACHE_KEY_PENDING = 'patent_filer_pending';
const CACHE_KEY_COMPLETED = 'patent_filer_completed';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const Filings = () => {
  const [pending, setPending] = useState<Patent[]>([]);
  const [completed, setCompleted] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [activePatent, setActivePatent] = useState<Patent | null>(null);
  const [formValues, setFormValues] = useState<{[key: string]: boolean}>({});
  const [otherForms, setOtherForms] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
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
  
  const loadCachedData = useCallback(() => {
    try {
      // Try to load from cache first
      const pendingCacheString = localStorage.getItem(CACHE_KEY_PENDING);
      const completedCacheString = localStorage.getItem(CACHE_KEY_COMPLETED);
      const pendingTimestampString = localStorage.getItem(`${CACHE_KEY_PENDING}_timestamp`);
      const completedTimestampString = localStorage.getItem(`${CACHE_KEY_COMPLETED}_timestamp`);
      
      const pendingTimestamp = pendingTimestampString ? parseInt(pendingTimestampString) : 0;
      const completedTimestamp = completedTimestampString ? parseInt(completedTimestampString) : 0;
      const now = Date.now();
      
      // Check if cache is still valid (not expired)
      const isPendingValid = now - pendingTimestamp < CACHE_EXPIRATION;
      const isCompletedValid = now - completedTimestamp < CACHE_EXPIRATION;
      
      // Set cached data if valid
      if (pendingCacheString && isPendingValid) {
        const pendingCache = JSON.parse(pendingCacheString);
        setPending(pendingCache);
        setLastUpdated(new Date(pendingTimestamp));
      }
      
      if (completedCacheString && isCompletedValid) {
        const completedCache = JSON.parse(completedCacheString);
        setCompleted(completedCache);
        if (!lastUpdated && !pendingCacheString) {
          setLastUpdated(new Date(completedTimestamp));
        }
      }
      
      // Return whether we could use cache for everything
      return isPendingValid && isCompletedValid && pendingCacheString && completedCacheString;
    } catch (error) {
      console.error('Error loading cached data:', error);
      return false;
    }
  }, [lastUpdated]);
  
  // Fetch data from API and update cache
  const fetchData = useCallback(async (showLoading = true) => {
    if (!user) return;
    
    try {
      if (showLoading) setLoading(true);
      
      // Fetch data in parallel using Promise.all
      const [pendingAssignments, completedAssignments] = await Promise.all([
        fetchFilerAssignments(user.full_name),
        fetchFilerCompletedAssignments(user.full_name)
      ]);
      
      // Update state
      setPending(pendingAssignments);
      setCompleted(completedAssignments);
      setLastUpdated(new Date());
      
      // Cache the data with timestamp
      localStorage.setItem(CACHE_KEY_PENDING, JSON.stringify(pendingAssignments));
      localStorage.setItem(CACHE_KEY_COMPLETED, JSON.stringify(completedAssignments));
      localStorage.setItem(`${CACHE_KEY_PENDING}_timestamp`, Date.now().toString());
      localStorage.setItem(`${CACHE_KEY_COMPLETED}_timestamp`, Date.now().toString());
      
      if (showLoading) {
        setInitialLoadDone(true);
      }
    } catch (error) {
      console.error('Error loading filer assignments:', error);
      toast.error('Failed to load assignment data');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user]);
  
  // Initial load - try cache first, then API
  useEffect(() => {
    if (!user || initialLoadDone) return;
    
    const usedCache = loadCachedData();
    
    if (usedCache) {
      // If we used cache successfully, set loading to false and then refresh in background
      setLoading(false);
      setInitialLoadDone(true);
      fetchData(false); // Silent refresh in background without showing loading state
    } else {
      // If no cache or expired, fetch from API with loading state
      fetchData(true);
    }
  }, [user, fetchData, initialLoadDone, loadCachedData]);
  
  // Initialize form values with existing data from patent
  const handleOpenPatent = (patent: Patent) => {
    setActivePatent(patent);
    
    // Reset form values
    const formState: {[key: string]: boolean} = {};
    
    // Pre-populate all common form values from the patent
    if (patent.form_01) formState.form_01 = true;
    if (patent.form_03) formState.form_03 = true;
    if (patent.form_05) formState.form_05 = true;
    if (patent.form_26) formState.form_26 = true;
    if (patent.form_28) formState.form_28 = true;
    
    // Determine which stage-specific forms to pre-populate
    if (user?.full_name === patent.ps_filer_assgn && patent.ps_filing_status === 0) {
      // PS filing stage - add PS specific forms
      if (patent.form_02_ps) formState.form_02_ps = true;
      if (patent.form_04) formState.form_04 = true;
    } else if (user?.full_name === patent.cs_filer_assgn && patent.cs_filing_status === 0) {
      // CS filing stage - add CS specific forms
      if (patent.form_02_cs) formState.form_02_cs = true;
      if (patent.form_18) formState.form_18 = true;
      if (patent.form_18a) formState.form_18a = true;
    } else if (user?.full_name === patent.fer_filer_assgn && patent.fer_filing_status === 0) {
      // FER filing stage - add FER specific forms
      if (patent.form_13) formState.form_13 = true;
    }
    
    setFormValues(formState);
    setOtherForms(patent.other_forms || '');
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
  
  const handleRefresh = () => {
    fetchData(true);
  };
  
  const handleSubmit = async () => {
    if (!activePatent || !user) return;
    
    try {
      setSubmitting(true);
      
      // Build form data
      const formData: Record<string, any> = {
        ...formValues,
        other_forms: otherForms || null
      };
      
      const success = await completeFilerTask(activePatent, user.full_name, formData);
      
      if (success) {
        toast.success('Filing completed and submitted for review');
        
        // Update cache by fetching fresh data
        await fetchData(false);
        
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
    
    // Common forms that appear in all filing stages
    const commonForms = (
      <div className="space-y-4 mt-6 pt-4 border-t">
        <h3 className="text-lg font-medium">Common Forms</h3>
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
              id="form_05" 
              checked={formValues.form_05 || false}
              onCheckedChange={(checked) => handleFormChange('form_05', checked as boolean)}
            />
            <label htmlFor="form_05" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Form 5 - Declaration of Inventorship
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="form_26" 
              checked={formValues.form_26 || false}
              onCheckedChange={(checked) => handleFormChange('form_26', checked as boolean)}
            />
            <label htmlFor="form_26" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Form 26 - Power of Attorney
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="form_28" 
              checked={formValues.form_28 || false}
              onCheckedChange={(checked) => handleFormChange('form_28', checked as boolean)}
            />
            <label htmlFor="form_28" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Form 28 - Small Entity Declaration
            </label>
          </div>
        </div>
      </div>
    );
    
    // PS Filing stage
    if (user.full_name === activePatent.ps_filer_assgn && activePatent.ps_filing_status === 0) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Provisional Specification Forms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
          {commonForms}
          <div className="space-y-2 mt-6 pt-4 border-t">
            <h3 className="text-lg font-medium">Other Forms</h3>
            <Textarea
              placeholder="Specify any other forms used..."
              value={otherForms}
              onChange={(e) => setOtherForms(e.target.value)}
              className="min-h-[100px]"
            />
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
                id="form_18" 
                checked={formValues.form_18 || false}
                onCheckedChange={(checked) => handleFormChange('form_18', checked as boolean)}
              />
              <label htmlFor="form_18" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Form 18 - Request for Examination
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="form_18a" 
                checked={formValues.form_18a || false}
                onCheckedChange={(checked) => handleFormChange('form_18a', checked as boolean)}
              />
              <label htmlFor="form_18a" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Form 18A - Expedited Examination
              </label>
            </div>
          </div>
          {commonForms}
          <div className="space-y-2 mt-6 pt-4 border-t">
            <h3 className="text-lg font-medium">Other Forms</h3>
            <Textarea
              placeholder="Specify any other forms used..."
              value={otherForms}
              onChange={(e) => setOtherForms(e.target.value)}
              className="min-h-[100px]"
            />
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
          </div>
          {commonForms}
          <div className="space-y-2 mt-6 pt-4 border-t">
            <h3 className="text-lg font-medium">Other Forms</h3>
            <Textarea
              placeholder="Specify any other forms used..."
              value={otherForms}
              onChange={(e) => setOtherForms(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  const renderPatentList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="pending" className="w-full">
          <div className="flex justify-between items-center mb-4">
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
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
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
                            {patent.ps_review_file_status === 0 ? " - Approved" : " - Pending Review"}
                          </div>
                        )}
                        {user?.full_name === patent.cs_filer_assgn && patent.cs_filing_status === 1 && (
                          <div className="mt-2 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            CS Filing Completed
                            {patent.cs_review_file_status === 0 ? " - Approved" : " - Pending Review"}
                          </div>
                        )}
                        {user?.full_name === patent.fer_filer_assgn && patent.fer_filing_status === 1 && (
                          <div className="mt-2 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                            FER Filing Completed
                            {patent.fer_review_file_status === 0 ? " - Approved" : " - Pending Review"}
                          </div>
                        )}
                      </div>
                    </CardContent>
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
      </div>
    </div>
  );
  
  // Main render
  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Filings"
        description="Manage your patent filing assignments"
        icon={<FileText className="w-6 h-6" />}
      />
      
      {loading && !initialLoadDone ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingState size="lg" text="Loading filing assignments..." />
        </div>
      ) : (
        <>
          {!activePatent ? (
            renderPatentList()
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filing Forms</CardTitle>
                  <CardDescription>
                    Complete the necessary filing forms for {activePatent.patent_title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Patent Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Tracking ID:</span> {activePatent.tracking_id}
                      </div>
                      <div>
                        <span className="font-medium">Applicant:</span> {activePatent.patent_applicant}
                      </div>
                      <div>
                        <span className="font-medium">Client ID:</span> {activePatent.client_id}
                      </div>
                      <div>
                        <span className="font-medium">Application No:</span> {activePatent.application_no || 'Not assigned yet'}
                      </div>
                    </div>
                  </div>
                  
                  {renderFormCheckboxes()}
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={handleClosePatent} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Filing'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Filings;
