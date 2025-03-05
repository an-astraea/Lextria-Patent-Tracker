
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Edit, CheckCircle, Clock, ListChecks, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, completeFilerTask } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Filings = () => {
  const navigate = useNavigate();
  const [activeAssignments, setActiveAssignments] = useState<Patent[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formStates, setFormStates] = useState<Record<string, Record<string, boolean>>>({});
  const [patentToComplete, setPatentToComplete] = useState<Patent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActive, setFilteredActive] = useState<Patent[]>([]);
  const [filteredCompleted, setFilteredCompleted] = useState<Patent[]>([]);

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
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
        setFilteredActive(active);
        setCompletedAssignments(completed);
        setFilteredCompleted(completed);
      } catch (error) {
        console.error('Error fetching filings:', error);
        toast.error('Failed to load filings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.full_name]);

  // Handle search filtering
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      setFilteredActive(activeAssignments);
      setFilteredCompleted(completedAssignments);
      return;
    }
    
    const filterPatents = (patents: Patent[]) => {
      return patents.filter(patent => 
        patent.patent_title.toLowerCase().includes(query) || 
        patent.tracking_id.toLowerCase().includes(query) || 
        patent.patent_applicant.toLowerCase().includes(query) || 
        patent.client_id.toLowerCase().includes(query)
      );
    };
    
    setFilteredActive(filterPatents(activeAssignments));
    setFilteredCompleted(filterPatents(completedAssignments));
  }, [searchQuery, activeAssignments, completedAssignments]);

  const handleFormChange = (patentId: string, formName: string, checked: boolean) => {
    setFormStates(prev => ({
      ...prev,
      [patentId]: {
        ...(prev[patentId] || {}),
        [formName]: checked
      }
    }));
  };

  const openCompleteDialog = (patent: Patent) => {
    setPatentToComplete(patent);
  };

  const closeCompleteDialog = () => {
    setPatentToComplete(null);
  };

  const handleComplete = async () => {
    if (!patentToComplete || !user) return;
    
    try {
      // For CS filings, include form data
      const formData = patentToComplete.cs_filer_assgn === user.full_name 
        ? formStates[patentToComplete.id] 
        : undefined;
      
      const success = await completeFilerTask(patentToComplete, user.full_name, formData);
      
      if (success) {
        toast.success('Filing marked as complete and sent for review');
        
        // Update local state to reflect the change
        setActiveAssignments(activeAssignments.filter(item => item.id !== patentToComplete.id));
        setFilteredActive(filteredActive.filter(item => item.id !== patentToComplete.id));
        
        const updatedPatent = {
          ...patentToComplete,
          ps_filing_status: patentToComplete.ps_filer_assgn === user.full_name ? 1 : patentToComplete.ps_filing_status,
          cs_filing_status: patentToComplete.cs_filer_assgn === user.full_name ? 1 : patentToComplete.cs_filing_status,
          fer_filing_status: patentToComplete.fer_filer_assgn === user.full_name ? 1 : patentToComplete.fer_filing_status
        };
        
        // For CS filings, update the form values
        if (patentToComplete.cs_filer_assgn === user.full_name && formStates[patentToComplete.id]) {
          Object.assign(updatedPatent, formStates[patentToComplete.id]);
        }
        
        setCompletedAssignments([...completedAssignments, updatedPatent]);
        setFilteredCompleted([...filteredCompleted, updatedPatent]);
        closeCompleteDialog();
      }
    } catch (error) {
      console.error('Error completing filing:', error);
      toast.error('Failed to complete filing');
    }
  };

  // Check if any forms are selected for CS filing
  const hasSelectedForms = (patentId: string): boolean => {
    if (!formStates[patentId]) return false;
    return Object.values(formStates[patentId]).some(selected => selected);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Filings</h1>
        <div className="relative mt-2 sm:mt-0">
          <input
            type="text"
            placeholder="Search filings..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
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
              {filteredActive.length === 0 ? (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center">
                      <p className="text-muted-foreground">No active filing assignments</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActive.map((filing) => (
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
                              
                              {filing.cs_filer_assgn === user.full_name && !hasSelectedForms(filing.id) && (
                                <div className="mt-2 text-amber-600 flex items-center gap-1 text-xs">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Please select at least one form to complete filing</span>
                                </div>
                              )}
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
                          onClick={() => openCompleteDialog(filing)}
                          disabled={filing.cs_filer_assgn === user.full_name && !hasSelectedForms(filing.id)}
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
              {filteredCompleted.length === 0 ? (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center">
                      <p className="text-muted-foreground">No completed filing assignments</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompleted.map((filing) => (
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
                            <span className={`${
                              (filing.ps_filer_assgn === user.full_name && filing.ps_review_file_status === 1) ||
                              (filing.cs_filer_assgn === user.full_name && filing.cs_review_file_status === 1) ||
                              (filing.fer_filer_assgn === user.full_name && filing.fer_review_file_status === 1)
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}>
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
      
      {/* Confirmation Dialog for Completing a Filing */}
      <Dialog open={!!patentToComplete} onOpenChange={(open) => !open && closeCompleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Filing</DialogTitle>
            <DialogDescription>
              {patentToComplete?.cs_filer_assgn === user?.full_name
                ? "Are you sure you want to complete this filing with the selected forms? This will mark your filing task as complete and send it for approval."
                : "Are you sure you want to complete this filing? This will mark your filing task as complete and send it for approval."}
            </DialogDescription>
          </DialogHeader>
          
          {patentToComplete?.cs_filer_assgn === user?.full_name && patentToComplete && (
            <div className="space-y-2 py-2">
              <h4 className="text-sm font-medium">Selected Forms:</h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                {formStates[patentToComplete.id]?.form_26 && <div>✓ Form 26</div>}
                {formStates[patentToComplete.id]?.form_18 && <div>✓ Form 18</div>}
                {formStates[patentToComplete.id]?.form_18a && <div>✓ Form 18A</div>}
                {formStates[patentToComplete.id]?.form_9 && <div>✓ Form 9</div>}
                {formStates[patentToComplete.id]?.form_9a && <div>✓ Form 9A</div>}
                {formStates[patentToComplete.id]?.form_13 && <div>✓ Form 13</div>}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeCompleteDialog}>Cancel</Button>
            <Button onClick={handleComplete}>
              Complete and Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Filings;
