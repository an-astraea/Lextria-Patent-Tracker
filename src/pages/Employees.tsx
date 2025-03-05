
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Employee } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { employees } from '@/lib/data';
import { toast } from 'sonner';

const Employees = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>(employees);
  
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
  
  // Handle search
  React.useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      setFilteredEmployees(employees);
      return;
    }
    
    const filtered = employees.filter(
      (employee) =>
        employee.full_name.toLowerCase().includes(query) ||
        employee.emp_id.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query)
    );
    
    setFilteredEmployees(filtered);
  }, [searchQuery]);
  
  const handleDelete = (id: string) => {
    // In a real app, you would make an API call
    // For now, just update the local state and show a toast
    setFilteredEmployees(filteredEmployees.filter(emp => emp.id !== id));
    toast.success('Employee deleted successfully');
  };
  
  if (user?.role !== 'admin') {
    return null; // Don't render anything if not admin
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        <Button onClick={() => navigate('/employees/add')} className="sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <Card key={employee.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{employee.full_name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {employee.emp_id}</p>
                    </div>
                    <div className="capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        employee.role === 'admin' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : employee.role === 'drafter'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      }`}>
                        {employee.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Email:</span> {employee.email}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Phone:</span> {employee.ph_no}
                    </div>
                  </div>
                </div>
                
                <div className="border-t flex">
                  <Button 
                    onClick={() => navigate(`/employees/edit/${employee.id}`)} 
                    variant="ghost" 
                    className="flex-1 rounded-none h-12"
                  >
                    Edit
                  </Button>
                  <div className="w-px bg-border h-12"></div>
                  <Button 
                    onClick={() => handleDelete(employee.id)} 
                    variant="ghost" 
                    className="flex-1 rounded-none h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No employees found matching the search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
