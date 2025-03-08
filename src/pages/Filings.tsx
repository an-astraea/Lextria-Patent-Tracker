import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patent } from '@/lib/types';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, completeFilerTask } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const Filings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingAssignments, setPendingAssignments] = useState<Patent[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  
  // Form fields for CS filing
  const formFields = [
    'form_26',
    'form_18',
    'form_18a',
    'form_09',
    'form_09a',
    'form_13'
  ];

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      if (user) {
        const pending = await fetchFilerAssignments(user.full_name);
        const completed = await fetchFilerCompletedAssignments(user.full_name);
        
        setPendingAssignments(pending);
        setCompletedAssignments(completed);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const getPatentStage = (patent: Patent): string => {
    if (patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 0) {
      return 'Provisional Specification Filing';
    } else if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
      return 'Complete Specification Filing';
    } else if (patent.fer_filer_assgn === user?.full_name && patent.fer_filing_status === 0) {
      return 'FER Filing';
    } else if (patent.ps_filer_assgn === user?.full_name && patent.ps_filing_status === 1) {
      return 'Provisional Specification Filing (Completed)';
    } else if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 1) {
      return 'Complete Specification Filing (Completed)';
    } else if (patent.fer_filer_assgn === user?.full_name && patent.fer_filing_status === 1) {
      return 'FER Filing (Completed)';
    }
    return 'Unknown Stage';
  };

  const getDeadline = (patent: Patent): string => {
    if (patent.ps_filer_assgn === user?.full_name) {
      return patent.ps_filer_deadline;
    } else if (patent.cs_filer_assgn === user?.full_name) {
      return patent.cs_filer_deadline;
    } else if (patent.fer_filer_assgn === user?.full_name) {
      return patent.fer_filer_deadline;
    }
    return '';
  };

  const isDeadlineSoon = (deadline: string): boolean => {
    if (!deadline) return false;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 3 && diffDays >= 0;
  };

  const isDeadlinePassed = (deadline: string): boolean => {
    if (!deadline) return false;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    return deadlineDate < today;
  };

  const handlePatentSelect = (patent: Patent) => {
    setSelectedPatent(patent);
    
    // Initialize selected forms based on patent's current form status
    const initialSelectedForms = formFields.filter(field => {
      const key = field as keyof Patent;
      return patent[key] === true;
    });
    
    setSelectedForms(initialSelectedForms);
  };

  const handleFormToggle = (formName: string) => {
    setSelectedForms(prev => 
      prev.includes(formName)
        ? prev.filter(f => f !== formName)
        : [...prev, formName]
    );
  };

  const handleCompleteFilingTask = async (
    patent: Patent,
    currentView: 'pending' | 'completed'
  ) => {
    if (currentView === 'completed') return;

    const formData: Record<string, boolean> = {};

    if (patent.cs_filer_assgn === user?.full_name && patent.cs_filing_status === 0) {
      // Form updates only needed for CS filing
      formFields.forEach((field) => {
        formData[field] = selectedForms.includes(field);
      });
    }

    const success = await completeFilerTask(patent, user?.full_name || '', formData);

    if (success) {
      toast.success("Filing task marked as completed and sent for review");
      fetchAssignments();
    }
  };

  const renderPatentCard = (patent: Patent, currentView: 'pending' | 'completed') => {
    const stage = getPatentStage(patent);
    const deadline = getDeadline(patent);
    const isSelected = selectedPatent?.id === patent.id;
    
    return (
      <Card 
        key={patent.id} 
        className={`mb-4 ${isSelected ? 'border-primary' : ''}`}
        onClick={() => handlePatentSelect(patent)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{patent.patent_title}</CardTitle>
              <CardDescription>ID: {patent.tracking_id}</CardDescription>
            </div>
            <Badge variant={currentView === 'pending' ? "outline" : "success"}>
              {currentView === 'pending' ? "Pending" : "Completed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Applicant:</span> {patent.patent_applicant}
            </div>
            <div>
              <span className="font-medium">Client ID:</span> {patent.client_id}
            </div>
            <div>
              <span className="font-medium">Stage:</span> {stage}
            </div>
            <div>
              <span className="font-medium">Deadline:</span>{' '}
              <span className={`
                ${isDeadlinePassed(deadline) ? 'text-red-500 font-bold' : ''}
                ${isDeadlineSoon(deadline) && !isDeadlinePassed(deadline) ? 'text-amber-500 font-bold' : ''}
              `}>
                {deadline ? formatDate(deadline) : 'Not set'}
                {isDeadlinePassed(deadline) && ' (Overdue)'}
                {isDeadlineSoon(deadline) && !isDeadlinePassed(deadline) && ' (Soon)'}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/patents/${patent.id}`);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {currentView === 'pending' && (
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteFilingTask(patent, currentView);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  const renderPatentDetails = () => {
    if (!selectedPatent) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <FileText className="h-16 w-16 mb-4" />
          <p>Select a patent to view details</p>
        </div>
      );
    }

    const stage = getPatentStage(selectedPatent);
    const deadline = getDeadline(selectedPatent);
    const isCS = selectedPatent.cs_filer_assgn === user?.full_name && selectedPatent.cs_filing_status === 0;
    
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{selectedPatent.patent_title}</h2>
          <p className="text-muted-foreground">ID: {selectedPatent.tracking_id}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="text-muted-foreground">Applicant</Label>
            <p className="font-medium">{selectedPatent.patent_applicant}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Client ID</Label>
            <p className="font-medium">{selectedPatent.client_id}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Stage</Label>
            <p className="font-medium">{stage}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Deadline</Label>
            <p className={`font-medium ${isDeadlinePassed(deadline) ? 'text-red-500' : isDeadlineSoon(deadline) ? 'text-amber-500' : ''}`}>
              {deadline ? formatDate(deadline) : 'Not set'}
              {isDeadlinePassed(deadline) && ' (Overdue)'}
              {isDeadlineSoon(deadline) && !isDeadlinePassed(deadline) && ' (Soon)'}
            </p>
          </div>
        </div>
        
        {isCS && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Required Forms</h3>
            <div className="grid grid-cols-2 gap-2">
              {formFields.map(form => (
                <div key={form} className="flex items-center space-x-2">
                  <Checkbox 
                    id={form} 
                    checked={selectedForms.includes(form)}
                    onCheckedChange={() => handleFormToggle(form)}
                  />
                  <Label htmlFor={form} className="cursor-pointer">
                    {form.replace('_', ' ').toUpperCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Inventors</h3>
          {selectedPatent.inventors && selectedPatent.inventors.length > 0 ? (
            <div className="space-y-2">
              {selectedPatent.inventors.map((inventor, index) => (
                <div key={inventor.id} className="p-2 bg-muted rounded-md">
                  <p className="font-medium">{inventor.inventor_name}</p>
                  <p className="text-sm text-muted-foreground">{inventor.inventor_addr}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No inventors listed</p>
          )}
        </div>
        
        <div className="mt-auto">
          <Button 
            className="w-full"
            onClick={() => handleCompleteFilingTask(selectedPatent, 'pending')}
            disabled={selectedPatent.ps_filing_status === 1 || selectedPatent.cs_filing_status === 1 || selectedPatent.fer_filing_status === 1}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Completed
          </Button>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Please log in to view your filing assignments.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Filing Assignments</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading assignments...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Tabs defaultValue="pending">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="pending" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Pending
                  {pendingAssignments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{pendingAssignments.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                  {completedAssignments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{completedAssignments.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="m-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {pendingAssignments.length > 0 ? (
                    pendingAssignments.map(patent => renderPatentCard(patent, 'pending'))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <CheckCircle className="h-16 w-16 mb-4" />
                      <p>No pending filing assignments</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="completed" className="m-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {completedAssignments.length > 0 ? (
                    completedAssignments.map(patent => renderPatentCard(patent, 'completed'))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <AlertCircle className="h-16 w-16 mb-4" />
                      <p>No completed filing assignments</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:col-span-2">
            <Card className="h-[calc(100vh-180px)]">
              <CardHeader className="pb-2">
                <CardTitle>Patent Details</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] overflow-auto">
                {renderPatentDetails()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filings;
