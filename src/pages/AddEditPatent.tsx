import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  fetchPatentById, 
  fetchEmployees, 
  createPatent, 
  updatePatent,
  createInventor,
  createFEREntry,
  updateFEREntry,
  deleteFEREntry
} from '@/lib/api';
import { Patent, PatentFormData, Employee, FEREntry, handleEmployeesResponse, handlePatentResponse, handleFERResponse, createDummyInventorId } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

const AddEditPatent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Redirect if not admin
  React.useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PatentFormData>({
    tracking_id: '',
    patent_applicant: '',
    client_id: '',
    application_no: '',
    date_of_filing: '',
    patent_title: '',
    applicant_addr: '',
    inventor_ph_no: '',
    inventor_email: '',
    ps_drafter_assgn: '',
    ps_drafter_deadline: '',
    ps_filer_assgn: '',
    ps_filer_deadline: '',
    cs_drafter_assgn: '',
    cs_drafter_deadline: '',
    cs_filer_assgn: '',
    cs_filer_deadline: '',
    fer_status: 0,
    fer_drafter_assgn: '',
    fer_drafter_deadline: '',
    fer_filer_assgn: '',
    fer_filer_deadline: '',
    inventors: [{ inventor_name: '', inventor_addr: '' }]
  });
  
  // Additional state for FER entries management
  const [ferEntries, setFerEntries] = useState<FEREntry[]>([]);
  const [isFERDialogOpen, setIsFERDialogOpen] = useState(false);
  const [isEditingFER, setIsEditingFER] = useState(false);
  const [selectedFER, setSelectedFER] = useState<FEREntry | null>(null);
  const [ferDrafter, setFERDrafter] = useState('');
  const [ferDrafterDeadline, setFERDrafterDeadline] = useState('');
  const [ferFiler, setFERFiler] = useState('');
  const [ferFilerDeadline, setFERFilerDeadline] = useState('');
  const [ferDate, setFERDate] = useState('');
  const [isProcessingFER, setIsProcessingFER] = useState(false);
  
  // FER delete confirmation dialog
  const [deleteFERDialogOpen, setDeleteFERDialogOpen] = useState(false);
  const [ferToDelete, setFERToDelete] = useState<FEREntry | null>(null);
  
  // Generate unique tracking ID
  useEffect(() => {
    if (!isEditing) {
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 1000);
      setFormData(prev => ({ ...prev, tracking_id: `PAT-${timestamp}-${randomNum}` }));
    }
  }, [isEditing]);
  
  // Fetch employees for dropdown menus
  useEffect(() => {
    const getEmployees = async () => {
      try {
        const employeeData = await fetchEmployees();
        const employees = handleEmployeesResponse(employeeData);
        setEmployees(employees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees data');
      }
    };
    
    getEmployees();
  }, []);
  
  // Load patent data if in edit mode
  useEffect(() => {
    const fetchPatentData = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const patentData = await fetchPatentById(id);
          const patent = handlePatentResponse(patentData);
        
          if (patent) {
            setFormData({
              tracking_id: patent.tracking_id || '',
              patent_applicant: patent.patent_applicant || '',
              client_id: patent.client_id || '',
              application_no: patent.application_no || '',
              date_of_filing: patent.date_of_filing ? patent.date_of_filing.substring(0, 10) : '',
              patent_title: patent.patent_title || '',
              applicant_addr: patent.applicant_addr || '',
              inventor_ph_no: patent.inventor_ph_no || '',
              inventor_email: patent.inventor_email || '',
              ps_drafter_assgn: patent.ps_drafter_assgn || '',
              ps_drafter_deadline: patent.ps_drafter_deadline ? patent.ps_drafter_deadline.substring(0, 10) : '',
              ps_filer_assgn: patent.ps_filer_assgn || '',
              ps_filer_deadline: patent.ps_filer_deadline ? patent.ps_filer_deadline.substring(0, 10) : '',
              cs_drafter_assgn: patent.cs_drafter_assgn || '',
              cs_drafter_deadline: patent.cs_drafter_deadline ? patent.cs_drafter_deadline.substring(0, 10) : '',
              cs_filer_assgn: patent.cs_filer_assgn || '',
              cs_filer_deadline: patent.cs_filer_deadline ? patent.cs_filer_deadline.substring(0, 10) : '',
              fer_status: patent.fer_status,
              fer_drafter_assgn: patent.fer_drafter_assgn || '',
              fer_drafter_deadline: patent.fer_drafter_deadline ? patent.fer_drafter_deadline.substring(0, 10) : '',
              fer_filer_assgn: patent.fer_filer_assgn || '',
              fer_filer_deadline: patent.fer_filer_deadline ? patent.fer_filer_deadline.substring(0, 10) : '',
              inventors: patent.inventors ? patent.inventors.map(inv => ({
                inventor_name: inv.inventor_name,
                inventor_addr: inv.inventor_addr
              })) : [{ inventor_name: '', inventor_addr: '' }]
            });
          
            // Set FER entries
            if (patent.fer_entries && patent.fer_entries.length > 0) {
              setFerEntries(patent.fer_entries);
            }
          } else {
            toast.error('Patent not found');
            navigate('/patents');
          }
        } catch (error) {
          console.error('Error fetching patent data:', error);
          toast.error('Failed to load patent data');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchPatentData();
  }, [id, isEditing, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInventorChange = (index: number, field: 'inventor_name' | 'inventor_addr', value: string) => {
    const updatedInventors = [...formData.inventors];
    updatedInventors[index] = { ...updatedInventors[index], [field]: value };
    setFormData(prev => ({ ...prev, inventors: updatedInventors }));
  };
  
  const addInventor = () => {
    setFormData(prev => ({
      ...prev,
      inventors: [...prev.inventors, { inventor_name: '', inventor_addr: '' }]
    }));
  };
  
  const removeInventor = (index: number) => {
    if (formData.inventors.length > 1) {
      const updatedInventors = [...formData.inventors];
      updatedInventors.splice(index, 1);
      setFormData(prev => ({ ...prev, inventors: updatedInventors }));
    } else {
      toast.error('At least one inventor is required');
    }
  };
  
  // FER management functions
  const handleAddFER = () => {
    setIsEditingFER(false);
    setSelectedFER(null);
    setFERDrafter('');
    setFERDrafterDeadline('');
    setFERFiler('');
    setFERFilerDeadline('');
    setFERDate('');
    setIsFERDialogOpen(true);
  };
  
  const handleEditFER = (fer: FEREntry) => {
    setIsEditingFER(true);
    setSelectedFER(fer);
    setFERDrafter(fer.fer_drafter_assgn || '');
    setFERDrafterDeadline(fer.fer_drafter_deadline ? fer.fer_drafter_deadline.split('T')[0] : '');
    setFERFiler(fer.fer_filer_assgn || '');
    setFERFilerDeadline(fer.fer_filer_deadline ? fer.fer_filer_deadline.split('T')[0] : '');
    setFERDate(fer.fer_date ? fer.fer_date.split('T')[0] : '');
    setIsFERDialogOpen(true);
  };
  
  const handleDeleteFER = (fer: FEREntry) => {
    setFERToDelete(fer);
    setDeleteFERDialogOpen(true);
  };
  
  const confirmDeleteFER = async () => {
    if (!ferToDelete) return;
    
    try {
      const success = await deleteFEREntry(ferToDelete.id);
      if (success) {
        // Update local state to remove the deleted FER
        setFerEntries(prev => prev.filter(fer => fer.id !== ferToDelete.id));
        toast.success('FER entry deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting FER entry:', error);
      toast.error('Failed to delete FER entry');
    } finally {
      setDeleteFERDialogOpen(false);
      setFERToDelete(null);
    }
  };
  
  const handleSaveFER = async () => {
    if (!id) {
      toast.error("Cannot add FER entries to a patent that hasn't been saved");
      return;
    }
    
    setIsProcessingFER(true);
    
    try {
      if (isEditingFER && selectedFER) {
        // Update existing FER
        const ferData: Partial<FEREntry> = {
          fer_drafter_assgn: ferDrafter || null,
          fer_drafter_deadline: ferDrafterDeadline || null,
          fer_filer_assgn: ferFiler || null,
          fer_filer_deadline: ferFilerDeadline || null,
          fer_date: ferDate || null
        };
      
        const success = await updateFEREntry(selectedFER.id, ferData);
        if (success) {
          // Update local state
          setFerEntries(prev => 
            prev.map(fer => fer.id === selectedFER.id ? { ...fer, ...ferData } : fer)
          );
          toast.success('FER updated successfully');
        }
      } else {
        // Create new FER
        const nextFERNumber = ferEntries.length > 0 
          ? Math.max(...ferEntries.map(fer => fer.fer_number)) + 1 
          : 1;
      
        const newFER = await createFEREntry(id, nextFERNumber);
      
        if (newFER) {
          const safeFER = handleFERResponse(newFER);
          if (safeFER) {
            setFerEntries(prev => [...prev, safeFER]);
            toast.success('New FER created successfully');
          }
        }
      }
    
      // Close dialog
      setIsFERDialogOpen(false);
    } catch (error) {
      console.error('Error saving FER:', error);
      toast.error('Failed to save FER');
    } finally {
      setIsProcessingFER(false);
    }
  };
  
  const validateForm = () => {
    // Basic validation
    if (!formData.patent_applicant || !formData.client_id || 
        !formData.patent_title || !formData.applicant_addr) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    // Validate inventors
    for (const inventor of formData.inventors) {
      if (!inventor.inventor_name || !inventor.inventor_addr) {
        toast.error('Please fill in all inventor details');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    try {
      setLoading(true);
    
      if (isEditing && id) {
        // Update existing patent
        // Convert inventor data to match Patent type
        const patentData: Partial<Patent> = {
          ...formData,
          inventors: formData.inventors.map(inv => ({
            ...inv,
            id: createDummyInventorId(),
            tracking_id: formData.tracking_id
          }))
        };
      
        const success = await updatePatent(id, patentData);
        if (success) {
          toast.success('Patent updated successfully');
          navigate('/patents');
        }
      } else {
        // Create new patent
        // Convert inventor data to match Patent type
        const patentData: Partial<Patent> = {
          ...formData,
          inventors: formData.inventors.map(inv => ({
            ...inv,
            id: createDummyInventorId(),
            tracking_id: formData.tracking_id
          }))
        };
      
        const newPatent = await createPatent(patentData);
        const patent = handlePatentResponse(newPatent);
      
        if (patent) {
          // If FER status is enabled, create the first FER entry
          if (patent.fer_status === 1 && patent.id) {
            await createFEREntry(patent.id, 1); // First FER number
          }
        
          toast.success('Patent created successfully');
          navigate('/patents');
        }
      }
    } catch (error) {
      console.error('Error saving patent:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} patent`);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter employees by role for dropdowns
  const drafters = employees.filter(emp => emp.role === 'drafter').map(emp => emp.full_name);
  const filers = employees.filter(emp => emp.role === 'filer').map(emp => emp.full_name);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Patent' : 'Add New Patent'}</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Patent Information</CardTitle>
            <CardDescription>Basic details about the patent application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tracking_id">Tracking ID *</Label>
                <Input 
                  id="tracking_id" 
                  name="tracking_id" 
                  value={formData.tracking_id} 
                  onChange={handleChange} 
                  required
                  readOnly={isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client_id">Client ID *</Label>
                <Input 
                  id="client_id" 
                  name="client_id" 
                  value={formData.client_id} 
                  onChange={handleChange} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patent_applicant">Patent Applicant *</Label>
                <Input 
                  id="patent_applicant" 
                  name="patent_applicant" 
                  value={formData.patent_applicant} 
                  onChange={handleChange} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="application_no">Application No.</Label>
                <Input 
                  id="application_no" 
                  name="application_no" 
                  value={formData.application_no} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_of_filing">Date of Filing</Label>
                <Input 
                  id="date_of_filing" 
                  name="date_of_filing" 
                  type="date" 
                  value={formData.date_of_filing} 
                  onChange={handleChange}
                  placeholder="Will be set automatically upon filing"
                />
                {!formData.date_of_filing && (
                  <p className="text-sm text-gray-500">
                    Will be set automatically when filing is completed
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patent_title">Patent Title *</Label>
                <Input 
                  id="patent_title" 
                  name="patent_title" 
                  value={formData.patent_title} 
                  onChange={handleChange} 
                  required
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="applicant_addr">Applicant Address *</Label>
                <Textarea 
                  id="applicant_addr" 
                  name="applicant_addr" 
                  value={formData.applicant_addr} 
                  onChange={handleChange} 
                  required
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inventor_ph_no">Inventor Phone *</Label>
                <Input 
                  id="inventor_ph_no" 
                  name="inventor_ph_no" 
                  value={formData.inventor_ph_no} 
                  onChange={handleChange} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inventor_email">Inventor Email *</Label>
                <Input 
                  id="inventor_email" 
                  name="inventor_email" 
                  type="email" 
                  value={formData.inventor_email} 
                  onChange={handleChange} 
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Inventors</CardTitle>
            <CardDescription>Details of the inventors associated with this patent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.inventors.map((inventor, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-md relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`inventor_name_${index}`}>Inventor Name *</Label>
                    <Input 
                      id={`inventor_name_${index}`} 
                      value={inventor.inventor_name} 
                      onChange={(e) => handleInventorChange(index, 'inventor_name', e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`inventor_addr_${index}`}>Inventor Address *</Label>
                    <Input 
                      id={`inventor_addr_${index}`} 
                      value={inventor.inventor_addr} 
                      onChange={(e) => handleInventorChange(index, 'inventor_addr', e.target.value)} 
                      required
                    />
                  </div>
                </div>
                
                {formData.inventors.length > 1 && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2" 
                    onClick={() => removeInventor(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addInventor} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Inventor
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Provisional Specification</CardTitle>
            <CardDescription>Assign drafter and filer for provisional specification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ps_drafter_assgn">PS Drafter</Label>
                <Select 
                  value={formData.ps_drafter_assgn || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, ps_drafter_assgn: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select drafter" />
                  </SelectTrigger>
                  <SelectContent>
                    {drafters.length > 0 ? (
                      drafters.map(drafter => (
                        <SelectItem key={drafter} value={drafter}>{drafter}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-drafters">No drafters available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ps_drafter_deadline">PS Drafter Deadline</Label>
                <Input 
                  id="ps_drafter_deadline" 
                  name="ps_drafter_deadline" 
                  type="date" 
                  value={formData.ps_drafter_deadline || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, ps_drafter_deadline: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ps_filer_assgn">PS Filer</Label>
                <Select 
                  value={formData.ps_filer_assgn || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, ps_filer_assgn: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select filer" />
                  </SelectTrigger>
                  <SelectContent>
                    {filers.length > 0 ? (
                      filers.map(filer => (
                        <SelectItem key={filer} value={filer}>{filer}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-filers">No filers available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ps_filer_deadline">PS Filer Deadline</Label>
                <Input 
                  id="ps_filer_deadline" 
                  name="ps_filer_deadline" 
                  type="date" 
                  value={formData.ps_filer_deadline || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, ps_filer_deadline: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Complete Specification</CardTitle>
            <CardDescription>Assign drafter and filer for complete specification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cs_drafter_assgn">CS Drafter</Label>
                <Select 
                  value={formData.cs_drafter_assgn || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cs_drafter_assgn: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select drafter" />
                  </SelectTrigger>
                  <SelectContent>
                    {drafters.length > 0 ? (
                      drafters.map(drafter => (
                        <SelectItem key={drafter} value={drafter}>{drafter}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-drafters">No drafters available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cs_drafter_deadline">CS Drafter Deadline</Label>
                <Input 
                  id="cs_drafter_deadline" 
                  name="cs_drafter_deadline" 
                  type="date" 
                  value={formData.cs_drafter_deadline || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, cs_drafter_deadline: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cs_filer_assgn">CS Filer</Label>
                <Select 
                  value={formData.cs_filer_assgn || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cs_filer_assgn: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select filer" />
                  </SelectTrigger>
                  <SelectContent>
                    {filers.length > 0 ? (
                      filers.map(filer => (
                        <SelectItem key={filer} value={filer}>{filer}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-filers">No filers available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cs_filer_deadline">CS Filer Deadline</Label>
                <Input 
                  id="cs_filer_deadline" 
                  name="cs_filer_deadline" 
                  type="date" 
                  value={formData.cs_filer_deadline || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, cs_filer_deadline: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>First Examination Report (FER)</CardTitle>
            <CardDescription>Enable and assign FER if needed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="fer_status"
                checked={!!formData.fer_status}
                onChange={(e) => setFormData(prev => ({ ...prev, fer_status: e.target.checked ? 1 : 0 }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="fer_status">Enable FER</Label>
            </div>
            
            {formData.fer_status ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fer_drafter_assgn">FER Drafter</Label>
                  <Select 
                    value={formData.fer_drafter_assgn || undefined}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fer_drafter_assgn: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select drafter" />
                    </SelectTrigger>
                    <SelectContent>
                      {drafters.length > 0 ? (
                        drafters.map(drafter => (
                          <SelectItem key={drafter} value={drafter}>{drafter}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-drafters">No drafters available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fer_drafter_deadline">FER Drafter Deadline</Label>
                  <Input 
                    id="fer_drafter_deadline" 
                    name="fer_drafter_deadline" 
                    type="date" 
                    value={formData.fer_drafter_deadline || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, fer_drafter_deadline: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fer_filer_assgn">FER Filer</Label>
                  <Select 
                    value={formData.fer_filer_assgn || undefined}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fer_filer_assgn: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select filer" />
                    </SelectTrigger>
                    <SelectContent>
                      {filers.length > 0 ? (
                        filers.map(filer => (
                          <SelectItem key={filer} value={filer}>{filer}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-filers">No filers available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fer_filer_deadline">FER Filer Deadline</Label>
                  <Input 
                    id="fer_filer_deadline" 
                    name="fer_filer_deadline" 
                    type="date" 
                    value={formData.fer_filer_deadline || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, fer_filer_deadline: e.target.value }))}
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">FER is currently disabled. Check the box above to enable.</p>
            )}
          </CardContent>
        </Card>
        
        {/* FER Entries Card - Only show in edit mode when fer_status is enabled */}
        {isEditing && formData.fer_status === 1 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>FER Entries</CardTitle>
                <CardDescription>First Examination Reports for this patent</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddFER}
              >
                <Plus className="h-4 w-4 mr-1" /> Add FER
              </Button>
            </CardHeader>
            <CardContent>
              {ferEntries.length > 0 ? (
                <ScrollArea className="h-[300px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">FER #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Drafter</TableHead>
                        <TableHead>Filer</TableHead>
                        <TableHead>Draft Status</TableHead>
