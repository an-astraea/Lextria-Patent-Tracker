
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { fetchEmployees } from '@/lib/api/employee-api';
import { createPatent, updatePatent, fetchPatentById } from '@/lib/api/patent-api';
import { PatentFormData, Employee } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

const AddEditPatent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

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

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
    if (isEditing && id) {
      loadPatent();
    }
  }, [id, isEditing]);

  const loadEmployees = async () => {
    try {
      const employeeData = await fetchEmployees();
      setEmployees(employeeData);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const loadPatent = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const patent = await fetchPatentById(id);
      if (patent) {
        setFormData({
          tracking_id: patent.tracking_id,
          patent_applicant: patent.patent_applicant,
          client_id: patent.client_id,
          application_no: patent.application_no || '',
          date_of_filing: patent.date_of_filing || '',
          patent_title: patent.patent_title,
          applicant_addr: patent.applicant_addr,
          inventor_ph_no: patent.inventor_ph_no,
          inventor_email: patent.inventor_email,
          ps_drafter_assgn: patent.ps_drafter_assgn || '',
          ps_drafter_deadline: patent.ps_drafter_deadline || '',
          ps_filer_assgn: patent.ps_filer_assgn || '',
          ps_filer_deadline: patent.ps_filer_deadline || '',
          cs_drafter_assgn: patent.cs_drafter_assgn || '',
          cs_drafter_deadline: patent.cs_drafter_deadline || '',
          cs_filer_assgn: patent.cs_filer_assgn || '',
          cs_filer_deadline: patent.cs_filer_deadline || '',
          fer_status: patent.fer_status,
          fer_drafter_assgn: patent.fer_drafter_assgn || '',
          fer_drafter_deadline: patent.fer_drafter_deadline || '',
          fer_filer_assgn: patent.fer_filer_assgn || '',
          fer_filer_deadline: patent.fer_filer_deadline || '',
          inventors: patent.inventors && patent.inventors.length > 0 
            ? patent.inventors.map(inv => ({ inventor_name: inv.inventor_name, inventor_addr: inv.inventor_addr }))
            : [{ inventor_name: '', inventor_addr: '' }]
        });
      }
    } catch (error) {
      console.error('Error loading patent:', error);
      toast.error('Failed to load patent details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tracking_id || !formData.patent_title || !formData.patent_applicant) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isEditing) {
        const result = await updatePatent(id!, formData);
        if (result.success) {
          toast.success('Patent updated successfully');
          navigate('/patents');
        } else {
          toast.error(result.message || 'Failed to update patent');
        }
      } else {
        const result = await createPatent(formData);
        if (result.success) {
          toast.success('Patent created successfully');
          navigate('/patents');
        } else {
          toast.error(result.message || 'Failed to create patent');
        }
      }
    } catch (error) {
      console.error('Error saving patent:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} patent`);
    } finally {
      setIsLoading(false);
    }
  };

  const addInventor = () => {
    setFormData(prev => ({
      ...prev,
      inventors: [...prev.inventors, { inventor_name: '', inventor_addr: '' }]
    }));
  };

  const removeInventor = (index: number) => {
    if (formData.inventors.length > 1) {
      setFormData(prev => ({
        ...prev,
        inventors: prev.inventors.filter((_, i) => i !== index)
      }));
    }
  };

  const updateInventor = (index: number, field: 'inventor_name' | 'inventor_addr', value: string) => {
    setFormData(prev => ({
      ...prev,
      inventors: prev.inventors.map((inv, i) => 
        i === index ? { ...inv, [field]: value } : inv
      )
    }));
  };

  const drafters = employees.filter(emp => emp.role === 'drafter');
  const filers = employees.filter(emp => emp.role === 'filer');

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Patent' : 'Add New Patent'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update patent information' : 'Create a new patent application'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tracking_id">Tracking ID *</Label>
                <Input
                  id="tracking_id"
                  value={formData.tracking_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, tracking_id: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id">Client ID *</Label>
                <Input
                  id="client_id"
                  value={formData.client_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patent_title">Patent Title *</Label>
              <Input
                id="patent_title"
                value={formData.patent_title}
                onChange={(e) => setFormData(prev => ({ ...prev, patent_title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patent_applicant">Patent Applicant *</Label>
              <Input
                id="patent_applicant"
                value={formData.patent_applicant}
                onChange={(e) => setFormData(prev => ({ ...prev, patent_applicant: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="application_no">Application Number</Label>
                <Input
                  id="application_no"
                  value={formData.application_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, application_no: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_filing">Date of Filing</Label>
                <Input
                  id="date_of_filing"
                  type="date"
                  value={formData.date_of_filing}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_of_filing: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicant_addr">Applicant Address</Label>
              <Textarea
                id="applicant_addr"
                value={formData.applicant_addr}
                onChange={(e) => setFormData(prev => ({ ...prev, applicant_addr: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inventor_ph_no">Inventor Phone</Label>
                <Input
                  id="inventor_ph_no"
                  value={formData.inventor_ph_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, inventor_ph_no: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventor_email">Inventor Email</Label>
                <Input
                  id="inventor_email"
                  type="email"
                  value={formData.inventor_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, inventor_email: e.target.value }))}
                />
              </div>
            </div>

            {/* Inventors Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Inventors</Label>
                <Button type="button" variant="outline" size="sm" onClick={addInventor}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Inventor
                </Button>
              </div>
              
              {formData.inventors.map((inventor, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor={`inventor_name_${index}`}>Inventor Name</Label>
                    <Input
                      id={`inventor_name_${index}`}
                      value={inventor.inventor_name}
                      onChange={(e) => updateInventor(index, 'inventor_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`inventor_addr_${index}`}>Inventor Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`inventor_addr_${index}`}
                        value={inventor.inventor_addr}
                        onChange={(e) => updateInventor(index, 'inventor_addr', e.target.value)}
                        className="flex-1"
                      />
                      {formData.inventors.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeInventor(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PS Assignments */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Provisional Specification (PS) Assignments</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ps_drafter_assgn">PS Drafter</Label>
                  <Select value={formData.ps_drafter_assgn} onValueChange={(value) => setFormData(prev => ({ ...prev, ps_drafter_assgn: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select drafter" />
                    </SelectTrigger>
                    <SelectContent>
                      {drafters.map(drafter => (
                        <SelectItem key={drafter.id} value={drafter.full_name}>
                          {drafter.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ps_drafter_deadline">PS Drafter Deadline</Label>
                  <Input
                    id="ps_drafter_deadline"
                    type="date"
                    value={formData.ps_drafter_deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, ps_drafter_deadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ps_filer_assgn">PS Filer</Label>
                  <Select value={formData.ps_filer_assgn} onValueChange={(value) => setFormData(prev => ({ ...prev, ps_filer_assgn: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select filer" />
                    </SelectTrigger>
                    <SelectContent>
                      {filers.map(filer => (
                        <SelectItem key={filer.id} value={filer.full_name}>
                          {filer.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ps_filer_deadline">PS Filer Deadline</Label>
                  <Input
                    id="ps_filer_deadline"
                    type="date"
                    value={formData.ps_filer_deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, ps_filer_deadline: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* CS Assignments */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Complete Specification (CS) Assignments</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cs_drafter_assgn">CS Drafter</Label>
                  <Select value={formData.cs_drafter_assgn} onValueChange={(value) => setFormData(prev => ({ ...prev, cs_drafter_assgn: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select drafter" />
                    </SelectTrigger>
                    <SelectContent>
                      {drafters.map(drafter => (
                        <SelectItem key={drafter.id} value={drafter.full_name}>
                          {drafter.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cs_drafter_deadline">CS Drafter Deadline</Label>
                  <Input
                    id="cs_drafter_deadline"
                    type="date"
                    value={formData.cs_drafter_deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, cs_drafter_deadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cs_filer_assgn">CS Filer</Label>
                  <Select value={formData.cs_filer_assgn} onValueChange={(value) => setFormData(prev => ({ ...prev, cs_filer_assgn: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select filer" />
                    </SelectTrigger>
                    <SelectContent>
                      {filers.map(filer => (
                        <SelectItem key={filer.id} value={filer.full_name}>
                          {filer.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cs_filer_deadline">CS Filer Deadline</Label>
                  <Input
                    id="cs_filer_deadline"
                    type="date"
                    value={formData.cs_filer_deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, cs_filer_deadline: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* FER Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="fer_status"
                  checked={formData.fer_status === 1}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fer_status: checked ? 1 : 0 }))}
                />
                <Label htmlFor="fer_status">Enable FER (First Examination Report)</Label>
              </div>

              {formData.fer_status === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="fer_drafter_assgn">FER Drafter</Label>
                    <Select value={formData.fer_drafter_assgn} onValueChange={(value) => setFormData(prev => ({ ...prev, fer_drafter_assgn: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select drafter" />
                      </SelectTrigger>
                      <SelectContent>
                        {drafters.map(drafter => (
                          <SelectItem key={drafter.id} value={drafter.full_name}>
                            {drafter.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fer_drafter_deadline">FER Drafter Deadline</Label>
                    <Input
                      id="fer_drafter_deadline"
                      type="date"
                      value={formData.fer_drafter_deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, fer_drafter_deadline: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fer_filer_assgn">FER Filer</Label>
                    <Select value={formData.fer_filer_assgn} onValueChange={(value) => setFormData(prev => ({ ...prev, fer_filer_assgn: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select filer" />
                      </SelectTrigger>
                      <SelectContent>
                        {filers.map(filer => (
                          <SelectItem key={filer.id} value={filer.full_name}>
                            {filer.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fer_filer_deadline">FER Filer Deadline</Label>
                    <Input
                      id="fer_filer_deadline"
                      type="date"
                      value={formData.fer_filer_deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, fer_filer_deadline: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate('/patents')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Patent' : 'Create Patent')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEditPatent;
