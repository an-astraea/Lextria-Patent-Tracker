import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, fetchFilerFERAssignments, completeFilerTask, completeFERFilerTask } from '@/lib/api';
import { Patent, FEREntry } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { CheckCircle2, Loader2, RefreshCcw } from 'lucide-react';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { format, isAfter, parseISO } from 'date-fns';
import FormSelection from '@/components/patent/FormSelection';

const Filings = () => {
  const [assignedPatents, setAssignedPatents] = useState<Patent[]>([]);
  const [completedPatents, setCompletedPatents] = useState<Patent[]>([]);
  const [ferAssignments, setFerAssignments] = useState<FEREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedForms, setSelectedForms] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Redirect if not a filer
  React.useEffect(() => {
    if (!user || user.role !== 'filer') {
      toast.error('Access denied. Filer access required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const fetchFilings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch assigned patents
      const assignedResponse = await fetchFilerAssignments(user.id);
      if (assignedResponse && assignedResponse.patents) {
        setAssignedPatents(assignedResponse.patents);
      }
      
      // Fetch completed patents
      const completedResponse = await fetchFilerCompletedAssignments(user.id);
      if (completedResponse && completedResponse.patents) {
        setCompletedPatents(completedResponse.patents);
      }
      
      // Fetch FER assignments
      const ferResponse = await fetchFilerFERAssignments(user.id);
      if (ferResponse && ferResponse.patents) {
        // Extract FER entries from patents
        const ferEntries: FEREntry[] = [];
        ferResponse.patents.forEach(patent => {
          if (patent.fer_entries) {
            patent.fer_entries.forEach(entry => {
              if (entry.fer_filer_assgn === user.full_name && entry.fer_filing_status === 0) {
                ferEntries.push({...entry, patent});
              }
            });
          }
        });
        setFerAssignments(ferEntries);
      }
    } catch (error) {
      console.error('Error fetching filings:', error);
      toast.error('Failed to load filing assignments');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchFilings();
  }, [user]);
  
  const handleSelectForm = (formName: string, checked: boolean) => {
    setSelectedForms(prev => ({
      ...prev,
      [formName]: checked
    }));
  };
  
  const completeFiling = async (patentId: string, taskType: 'ps' | 'cs' | 'fer') => {
    setCompleting(patentId);
    try {
      // Only pass form data for CS filings
      const formData = taskType === 'cs' ? selectedForms : undefined;
      
      const result = await completeFilerTask(patentId, taskType, formData);
      if (result.success) {
        toast.success('Filing completed and submitted for review');
        setSelectedForms({}); // Reset selected forms
        fetchFilings(); // Refresh data
      } else {
        toast.error('Failed to complete filing');
      }
    } catch (error) {
      console.error('Error completing filing:', error);
      toast.error('An error occurred while completing the filing');
    } finally {
      setCompleting(null);
    }
  };
  
  const completeFERFiling = async (ferEntry: FEREntry) => {
    if (!ferEntry.id) {
      toast.error('Invalid FER entry');
      return;
    }
    
    setCompleting(ferEntry.id);
    try {
      const result = await completeFERFilerTask(ferEntry);
      if (result.success) {
        toast.success('FER filing completed and submitted for review');
        fetchFilings(); // Refresh data
      } else {
        toast.error('Failed to complete FER filing');
      }
    } catch (error) {
      console.error('Error completing FER filing:', error);
      toast.error('An error occurred while completing the FER filing');
    } finally {
      setCompleting(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader title="Filings" subtitle="Manage your filing assignments" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="focus:outline-none">Pending ({assignedPatents.length + ferAssignments.length})</TabsTrigger>
          <TabsTrigger value="completed" className="focus:outline-none">Completed ({completedPatents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <LoadingState message="Loading assignments..." />
          ) : (
            <>
              {assignedPatents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedPatents.map(patent => (
                    <Card key={patent.id} className="shadow-md">
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold">{patent.patent_title}</h3>
                          <RefreshCcw 
                            className="h-5 w-5 cursor-pointer hover:text-blue-500" 
                            onClick={() => fetchFilings()} 
                          />
                        </div>
                        <p className="text-gray-500">Tracking ID: {patent.tracking_id}</p>
                        <p>Applicant: {patent.patent_applicant}</p>
                        <p>Filing Date: {patent.date_of_filing ? format(parseISO(patent.date_of_filing), 'PPP') : 'Not Filed'}</p>
                        
                        <Button 
                          variant="primary" 
                          className="w-full mt-4"
                          disabled={completing === patent.id}
                          onClick={() => completeFiling(patent.id, 'ps')}
                        >
                          {completing === patent.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Complete PS Filing
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="primary" 
                          className="w-full mt-2"
                          disabled={completing === patent.id}
                          onClick={() => completeFiling(patent.id, 'cs')}
                        >
                          {completing === patent.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Complete CS Filing
                            </>
                          )}
                        </Button>
                        
                        {/* Form Selection Component */}
                        <FormSelection 
                          onSelectForm={handleSelectForm}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No Provisional Specification or Complete Specification filings assigned" 
                  message="Check back later for new assignments." 
                />
              )}
              
              {ferAssignments.length > 0 ? (
                <>
                  <h2 className="text-xl font-semibold mt-6">FER Filing Assignments</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ferAssignments.map(ferEntry => (
                      <Card key={ferEntry.id} className="shadow-md">
                        <CardContent className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold">
                              {ferEntry.patent ? ferEntry.patent.patent_title : 'Unknown Patent'}
                            </h3>
                            <RefreshCcw 
                              className="h-5 w-5 cursor-pointer hover:text-blue-500" 
                              onClick={() => fetchFilings()} 
                            />
                          </div>
                          <p className="text-gray-500">FER Number: {ferEntry.fer_number}</p>
                          <p>
                            Patent Applicant:{' '}
                            {ferEntry.patent ? ferEntry.patent.patent_applicant : 'Unknown'}
                          </p>
                          
                          <Button 
                            variant="primary" 
                            className="w-full mt-4"
                            disabled={completing === ferEntry.id}
                            onClick={() => completeFERFiling(ferEntry)}
                          >
                            {completing === ferEntry.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Completing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Complete FER Filing
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState 
                  title="No First Examination Report (FER) filings assigned" 
                  message="Check back later for new FER assignments." 
                />
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <LoadingState message="Loading completed assignments..." />
          ) : (
            <>
              {completedPatents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedPatents.map(patent => (
                    <Card key={patent.id} className="shadow-md">
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold">{patent.patent_title}</h3>
                          <RefreshCcw 
                            className="h-5 w-5 cursor-pointer hover:text-blue-500" 
                            onClick={() => fetchFilings()} 
                          />
                        </div>
                        <p className="text-gray-500">Tracking ID: {patent.tracking_id}</p>
                        <p>Applicant: {patent.patent_applicant}</p>
                        <p>Filing Date: {patent.date_of_filing ? format(parseISO(patent.date_of_filing), 'PPP') : 'Not Filed'}</p>
                        <Badge variant="outline">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Filing Completed
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No completed filings" 
                  message="Once you complete filings, they will appear here." 
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Filings;
