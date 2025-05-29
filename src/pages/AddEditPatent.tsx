import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { PatentFormData } from '@/lib/types';
import { toast } from 'sonner';
import { createEmployee, updateEmployee, fetchEmployeeById } from '@/lib/api';

const AddEditEmployee = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<PatentFormData>({
    emp_id: '',
    full_name: '',
    email: '',
    ph_no: '',
    password: '',
    role: 'drafter', // Default to drafter
  });
  
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Get user role from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Redirect if not admin
  React.useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Generate unique employee ID
  useEffect(() => {
    if (!isEditing) {
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 1000);
      setFormData(prev => ({ ...prev, emp_id: `EMP-${timestamp}-${randomNum}` }));
    }
  }, [isEditing]);
  
  // Fetch employee data if editing
  useEffect(() => {
    const fetchEmployee = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const employee = await fetchEmployeeById(id);
          if (employee) {
            setFormData({
              emp_id: employee.emp_id,
              full_name: employee.full_name,
              email: employee.email,
              ph_no: employee.ph_no,
              password: '', // Don't show existing password
              role: employee.role,
            });
          } else {
            toast.error('Employee not found');
            navigate('/employees');
          }
        } catch (error) {
          console.error('Error fetching employee:', error);
          toast.error('Failed to load employee details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEmployee();
  }, [id, isEditing, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as 'admin' | 'drafter' | 'reviewer' }));
  };
  
  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      setFormError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    
    if (!formData.ph_no.trim()) {
      setFormError('Phone number is required');
      return false;
    }
    
    if (!isEditing && !formData.password.trim()) {
      setFormError('Password is required');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditing && id) {
        // Create a copy of the form data that matches EmployeeFormData
        const employeeData: PatentFormData = {
          emp_id: formData.emp_id,
          full_name: formData.full_name,
          email: formData.email,
          ph_no: formData.ph_no,
          role: formData.role,
          password: formData.password
        };
        
        // Only include password if it's provided (not empty)
        if (!formData.password.trim()) {
          delete employeeData.password;
        }
        
        const success = await updateEmployee(id, employeeData);
        if (success) {
          toast.success('Employee updated successfully');
          navigate('/employees');
        }
      } else {
        const newEmployee = await createEmployee(formData);
        if (newEmployee) {
          toast.success('Employee added successfully');
          navigate('/employees');
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} employee`);
    } finally {
      setLoading(false);
    }
  };
  
  if (user?.role !== 'admin') {
    return null; // Don't render anything if not admin
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit' : 'Add'} Employee</h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEditing ? 'Update' : 'New'} Employee Information</CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Make changes to the employee information below.' 
                : 'Enter the details for the new employee.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emp_id">Employee ID</Label>
                <Input
                  id="emp_id"
                  name="emp_id"
                  value={formData.emp_id}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  placeholder="Employee ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="drafter">Drafter</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ph_no">Phone Number</Label>
              <Input
                id="ph_no"
                name="ph_no"
                value={formData.ph_no}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={isEditing ? 'Enter new password' : 'Enter password'}
                required={!isEditing}
              />
            </div>
            
            {formError && (
              <div className="text-destructive text-sm">{formError}</div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate('/employees')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEditing ? 'Update' : 'Create'} Employee</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddEditEmployee;
