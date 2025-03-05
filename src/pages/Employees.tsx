
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Employee } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { fetchPatentsAndEmployees, deleteEmployee } from '@/lib/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Employees = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  
  // Get user role from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Fetch employees using the optimized function
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const { employees } = await fetchPatentsAndEmployees();
        setEmployees(employees);
        setFilteredEmployees(employees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      getData();
    }
  }, [user]);
  
  // Apply filters on change, but search only when the search button is clicked
  useEffect(() => {
    let filtered = employees;
    
    // Apply role filter if selected
    if (roleFilter) {
      filtered = filtered.filter(emp => emp.role === roleFilter);
    }
    
    // Apply search query only when search is activated
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (employee) =>
          employee.full_name.toLowerCase().includes(query) ||
          employee.emp_id.toLowerCase().includes(query) ||
          employee.email.toLowerCase().includes(query) ||
          employee.ph_no.toLowerCase().includes(query)
      );
    }
    
    setFilteredEmployees(filtered);
  }, [searchQuery, employees, roleFilter]);
  
  // Handle search execution (only on button click)
  const handleSearch = () => {
    setSearchQuery(pendingSearchQuery);
  };
  
  const handleDelete = async (id: string) => {
    try {
      const success = await deleteEmployee(id);
      if (success) {
        setEmployees(employees.filter(emp => emp.id !== id));
        setFilteredEmployees(filteredEmployees.filter(emp => emp.id !== id));
        toast.success('Employee deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
    setEmployeeToDelete(null);
  };
  
  const confirmDelete = (id: string) => {
    setEmployeeToDelete(id);
  };
  
  const cancelDelete = () => {
    setEmployeeToDelete(null);
  };
  
  if (user?.role !== 'admin') {
    return null; // Don't render anything if not admin
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
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
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-10"
            value={pendingSearchQuery}
            onChange={(e) => setPendingSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        
        <Button variant="secondary" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter Roles
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRoleFilter(null)}>
              All Roles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter('admin')}>
              Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter('drafter')}>
              Drafter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter('filer')}>
              Filer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                    onClick={() => confirmDelete(employee.id)} 
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
      
      <AlertDialog open={!!employeeToDelete} onOpenChange={() => !employeeToDelete && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => employeeToDelete && handleDelete(employeeToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Employees;
