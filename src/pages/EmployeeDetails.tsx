
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Patent, Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { fetchEmployeeWithPatentCounts, fetchEmployeePatents } from '@/lib/api/employee-patents-api';
import SearchFilters from '@/components/common/SearchFilters';
import PatentCard from '@/components/PatentCard';
import PatentListTabs from '@/components/patents/PatentListTabs';
import { Badge } from '@/components/ui/badge';

const EmployeeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState<(Employee & {patentCounts?: {total: number; drafting: number; filing: number; completed: number}}) | null>(null);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch employee details with patent counts
        const employeeData = await fetchEmployeeWithPatentCounts(id);
        if (employeeData) {
          setEmployee(employeeData);
          
          // Fetch full patent details
          const patentsData = await fetchEmployeePatents(employeeData.full_name);
          setPatents(patentsData);
          setFilteredPatents(patentsData);
        } else {
          toast.error("Employee not found");
          navigate('/employees');
        }
      } catch (error) {
        console.error("Error loading employee data:", error);
        toast.error("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };
    
    loadEmployeeData();
  }, [id, navigate]);
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredPatents(patents);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = patents.filter(patent => 
      patent.tracking_id.toLowerCase().includes(lowercaseQuery) ||
      patent.patent_title.toLowerCase().includes(lowercaseQuery) ||
      patent.patent_applicant.toLowerCase().includes(lowercaseQuery) ||
      patent.client_id.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredPatents(filtered);
  };
  
  const getInProgressPatents = () => {
    return filteredPatents.filter(patent => 
      !patent.withdrawn && 
      !(
        ((patent.ps_drafter_assgn === employee?.full_name && patent.ps_drafting_status === 1) || patent.ps_drafter_assgn !== employee?.full_name) &&
        ((patent.ps_filer_assgn === employee?.full_name && patent.ps_filing_status === 1) || patent.ps_filer_assgn !== employee?.full_name) &&
        ((patent.cs_drafter_assgn === employee?.full_name && patent.cs_drafting_status === 1) || patent.cs_drafter_assgn !== employee?.full_name) &&
        ((patent.cs_filer_assgn === employee?.full_name && patent.cs_filing_status === 1) || patent.cs_filer_assgn !== employee?.full_name) &&
        ((patent.fer_drafter_assgn === employee?.full_name && patent.fer_drafter_status === 1) || patent.fer_drafter_assgn !== employee?.full_name) &&
        ((patent.fer_filer_assgn === employee?.full_name && patent.fer_filing_status === 1) || patent.fer_filer_assgn !== employee?.full_name)
      )
    );
  };
  
  const getCompletedPatents = () => {
    return filteredPatents.filter(patent => 
      !patent.withdrawn && 
      ((patent.ps_drafter_assgn === employee?.full_name && patent.ps_drafting_status === 1) || patent.ps_drafter_assgn !== employee?.full_name) &&
      ((patent.ps_filer_assgn === employee?.full_name && patent.ps_filing_status === 1) || patent.ps_filer_assgn !== employee?.full_name) &&
      ((patent.cs_drafter_assgn === employee?.full_name && patent.cs_drafting_status === 1) || patent.cs_drafter_assgn !== employee?.full_name) &&
      ((patent.cs_filer_assgn === employee?.full_name && patent.cs_filing_status === 1) || patent.cs_filer_assgn !== employee?.full_name) &&
      ((patent.fer_drafter_assgn === employee?.full_name && patent.fer_drafter_status === 1) || patent.fer_drafter_assgn !== employee?.full_name) &&
      ((patent.fer_filer_assgn === employee?.full_name && patent.fer_filing_status === 1) || patent.fer_filer_assgn !== employee?.full_name)
    );
  };
  
  const getWithdrawnPatents = () => {
    return filteredPatents.filter(patent => patent.withdrawn);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground">Employee not found</p>
        <Button className="mt-4" onClick={() => navigate('/employees')}>Back to Employees</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/employees')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Employee info card */}
        <Card className="md:w-1/3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Employee Details</CardTitle>
              <Badge variant={employee.role === 'admin' ? 'default' : employee.role === 'drafter' ? 'secondary' : 'outline'} className="capitalize">
                {employee.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{employee.full_name}</h3>
              <p className="text-sm text-muted-foreground">ID: {employee.emp_id}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Phone:</span>
                <span className="text-sm">{employee.ph_no}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Patent Assignments</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold">{employee.patentCounts?.total || 0}</p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">In Progress</p>
                  <p className="text-xl font-semibold">{(employee.patentCounts?.drafting || 0) + (employee.patentCounts?.filing || 0)}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-xl font-semibold">{employee.patentCounts?.completed || 0}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Withdrawn</p>
                  <p className="text-xl font-semibold">{getWithdrawnPatents().length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Patents list */}
        <div className="md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Assigned Patents</CardTitle>
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SearchFilters 
                  onSearch={handleSearch} 
                  placeholder="Search patents..."
                  searchFields={[
                    { value: 'tracking_id', label: 'Tracking ID' },
                    { value: 'patent_title', label: 'Title' },
                    { value: 'client_id', label: 'Client ID' },
                    { value: 'patent_applicant', label: 'Applicant' }
                  ]}
                />
                
                <PatentListTabs 
                  filteredPatents={filteredPatents}
                  getInProgressPatents={getInProgressPatents}
                  getCompletedPatents={getCompletedPatents}
                  getWithdrawnPatents={getWithdrawnPatents}
                  onDeletePatent={() => {}} // Read-only view, no delete functionality
                  userRole="viewer" // Special role to hide delete buttons
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
