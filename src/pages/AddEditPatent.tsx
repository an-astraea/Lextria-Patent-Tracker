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
import { fetchEmployees, createEmployee, updateEmployee, fetchEmployeeById } from '@/lib/api/employee-api';
import { EmployeeFormData } from '@/lib/types';

const AddEditEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<EmployeeFormData>({
    emp_id: '',
    full_name: '',
    email: '',
    ph_no: '',
    password: '',
    role: 'drafter'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadEmployee();
    }
  }, [id, isEditing]);

  const loadEmployee = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const employee = await fetchEmployeeById(id);
      if (employee) {
        setFormData({
          emp_id: employee.emp_id,
          full_name: employee.full_name,
          email: employee.email,
          ph_no: employee.ph_no,
          role: employee.role as 'admin' | 'drafter' | 'filer',
          password: '' // Don't load existing password
        });
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      toast.error('Failed to load employee details');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPassword = () => {
    setIsGeneratingPassword(true);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
    setIsGeneratingPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password && !isEditing) {
      toast.error('Password is required for new employees');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isEditing) {
        const success = await updateEmployee(id!, formData);
        if (success) {
          toast.success('Employee updated successfully');
          navigate('/employees');
        }
      } else {
        const newEmployee = await createEmployee(formData);
        if (newEmployee) {
          toast.success('Employee created successfully');
          navigate('/employees');
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} employee`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update employee information' : 'Create a new employee account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emp_id">Employee ID</Label>
                <Input
                  id="emp_id"
                  value={formData.emp_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, emp_id: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'admin' | 'drafter' | 'filer' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="drafter">Drafter</SelectItem>
                    <SelectItem value="filer">Filer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ph_no">Phone Number</Label>
              <Input
                id="ph_no"
                value={formData.ph_no}
                onChange={(e) => setFormData(prev => ({ ...prev, ph_no: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password {isEditing && '(leave blank to keep current)'}</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={generateRandomPassword}
                  disabled={isGeneratingPassword}
                >
                  {isGeneratingPassword ? 'Generating...' : 'Generate'}
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required={!isEditing}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Employee' : 'Create Employee')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEditEmployee;
