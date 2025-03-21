import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, FileText, AlertTriangle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchPatentById, fetchEmployees, completeDrafterTask, completeFilerTask, updatePatentForms } from '@/lib/api';
import { Patent } from '@/lib/types';
import PatentBasicInfo from '@/components/patent/PatentBasicInfo';
import InventorsList from '@/components/patent/InventorsList';
import PatentStatusSection from '@/components/patent/PatentStatusSection';
import PatentTimeline from '@/components/patent/PatentTimeline';
import PatentNotes from '@/components/patent/PatentNotes';
import AssignmentDetails from '@/components/patent/AssignmentDetails';
import FormRequirementsList from '@/components/FormRequirementsList';
import FEREntriesSection from '@/components/patent/FEREntriesSection';
import TimelineDialog from '@/components/TimelineDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipProvider } from '@/components/ui/tooltip';

const PatentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
    }
  }, []);
  
  const [patent, setPatent] = useState<Patent | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'complete-draft' | 'complete-file'>('complete-draft');
  const [isCompletingDraft, setIsCompletingDraft] = useState(false);
  const [isCompletingFiling, setIsCompletingFiling] = useState(false);
  const [timelineMilestones, setTimelineMilestones] = useState<any[]>([]);
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  
  const [formValues, setFormValues] = useState<Record<string, boolean>>({});
  const [showFilingDialog, setShowFilingDialog] = useState(false);

  const fetchPatentData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const patentData = await fetchPatentById(id);
      setPatent(patentData);
      
      if (patentData) {
        const initialFormValues: Record<string, boolean> = {};
        Object.entries(patentData).forEach(([key, value]) => {
          if (key.startsWith('form_')) {
            initialFormValues[key] = !!value;
          }
        });
        setFormValues(initialFormValues);
      }
    } catch (error) {
      console.error('Error fetching patent data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patent details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const employeesData = await fetchEmployees();
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchPatentData();
    loadEmployees();
  }, [id]);

  const handleFormUpdate = (formName: string, value: boolean) => {
    console.log('Updating form value:', formName, value);
    setFormValues(prev => ({
      ...prev,
      [formName]: value
    }));
  };

  const saveFormValues = async () => {
    if (!patent?.id) return;
    
    try {
      console.log('Saving form values:', formValues);
      await updatePatentForms(patent.id, formValues);
      toast({
        title: 'Success',
        description: 'Form requirements updated successfully',
      });
      await fetchPatentData();
    } catch (error) {
      console.error('Error updating form requirements:', error);
      toast({
        title: 'Error',
        description: 'Failed to update form requirements',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteDrafting = () => {
    setDialogType('complete-draft');
    setIsDialogOpen(true);
  };

  const handleCompleteFiling = () => {
    setDialogType('complete-file');
    setShowFilingDialog(true);
  };

  const confirmCompleteDrafting = async () => {
    if (!patent || !user) return;
    
    setIsCompletingDraft(true);
    try {
      const success = await completeDrafterTask(patent, user.full_name);
      if (success) {
        toast({
          title: 'Success',
          description: 'Drafting marked as completed and submitted for review',
        });
        await fetchPatentData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to complete drafting task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error completing drafting task:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while completing the drafting task',
        variant: 'destructive',
      });
    } finally {
      setIsCompletingDraft(false);
      setIsDialogOpen(false);
    }
  };

  const confirmCompleteFiling = async () => {
    if (!patent || !user) return;
    
    setIsCompletingFiling(true);
    try {
      console.log('Completing filing with form values:', formValues);
      const success = await completeFilerTask(patent, user.full_name, formValues);
      if (success) {
        toast({
          title: 'Success',
          description: 'Filing marked as completed and submitted for review',
        });
        await fetchPatentData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to complete filing task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error completing filing task:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while completing the filing task',
        variant: 'destructive',
      });
    } finally {
      setIsCompletingFiling(false);
      setShowFilingDialog(false);
    }
  };

  const isAssignedDrafter = () => {
    if (!patent || !user) return false;
    
    return (
      user.role === 'drafter' && (
        (patent.ps_drafter_assgn === user.full_name && patent.ps_drafting_status === 0) ||
        (patent.cs_drafter_assgn === user.full_name && patent.cs_drafting_status === 0) ||
        (patent.fer_drafter_assgn === user.full_name && patent.fer_drafter_status === 0)
      )
    );
  };

  const isAssignedFiler = () => {
    if (!patent || !user) return false;
    
    return (
      user.role === 'filer' && (
        (patent.ps_filer_assgn === user.full_name && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1) ||
        (patent.cs_filer_assgn === user.full_name && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1) ||
        (patent.fer_filer_assgn === user.full_name && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1)
      )
    );
  };

  const handleFERDraftCompletion = async (fer: any) => {
    if (!patent || !user) return;

    try {
      const updatedPatent = await completeDrafterTask(patent, user.full_name);

      if (updatedPatent) {
        toast({
          title: 'Success',
          description: 'FER Draft Completion marked as completed and submitted for review',
        });
        await fetchPatentData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to complete FER draft completion task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error completing FER draft completion task:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while completing the FER draft completion task',
        variant: 'destructive',
      });
    }
  };

  const handleFERFilingCompletion = async (fer: any) => {
    if (!patent || !user) return;

    try {
      const updatedPatent = await completeFilerTask(patent, user.full_name, formValues);

      if (updatedPatent) {
        toast({
          title: 'Success',
          description: 'FER Filing Completion marked as completed and submitted for review',
        });
        await fetchPatentData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to complete FER filing completion task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error completing FER filing completion task:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while completing the FER filing completion task',
        variant: 'destructive',
      });
    }
  };

  const handleFERDraftApproval = async (fer: any) => {
    if (!patent || !user) return;

    try {
      const updatedPatent = await completeDrafterTask(patent, user.full_name);

      if (updatedPatent) {
        toast({
          title: 'Success',
          description: 'FER Draft Approval marked as completed',
        });
        await fetchPatentData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to complete FER draft approval task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error completing FER draft approval task:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while completing the FER draft approval task',
        variant: 'destructive',
      });
    }
  };

  const handleFERFilingApproval = async (fer: any) => {
    if (!patent || !user) return;

    try {
      const updatedPatent = await completeFilerTask(patent, user.full_name, formValues);

      if (updatedPatent) {
        toast({
          title: 'Success',
          description: 'FER Filing Approval marked as completed',
        });
        await fetchPatentData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to complete FER filing approval task',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error completing FER filing approval task:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while completing the FER filing approval task',
        variant: 'destructive',
      });
    }
  };

  const getDrafterCompletionField = () => {
    if (!patent || !user) return null;
    
    if (patent.ps_drafter_assgn === user.full_name && patent.ps_drafting_status === 0) {
      return 'PS Drafting';
    } else if (patent.cs_drafter_assgn === user.full_name && patent.cs_drafting_status === 0) {
      return 'CS Drafting';
    } else if (patent.fer_drafter_assgn === user.full_name && patent.fer_drafter_status === 0) {
      return 'FER Drafting';
    }
    
    return null;
  };

  const getFilerCompletionField = () => {
    if (!patent || !user) return null;
    
    if (patent.ps_filer_assgn === user.full_name && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1) {
      return 'PS Filing';
    } else if (patent.cs_filer_assgn === user.full_name && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1) {
      return 'CS Filing';
    } else if (patent.fer_filer_assgn === user.full_name && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1) {
      return 'FER Filing';
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading patent details...</p>
        </div>
      </div>
    );
  }

  if (!patent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-semibold text-center">Patent Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          The patent you're looking for could not be found or has been removed from the system.
        </p>
        <Button onClick={() => navigate('/patents')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patents
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 pb-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/patents')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Patent Details</h1>
          </div>
          
          <div className="flex gap-2">
            {user?.role === 'admin' && (
              <Button 
                onClick={() => navigate(`/patents/edit/${patent.id}`)}
               

