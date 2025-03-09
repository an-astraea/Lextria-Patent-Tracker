import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Patent } from '@/lib/types';
import { fetchPatentsAndEmployees } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowDown, ArrowUp, CalendarClock, CheckCircle2, Clock, FileEdit, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, Search } from 'lucide-react';
import PatentCard from '@/components/PatentCard';
import { toast } from 'sonner';

interface DashboardCardProps {
  title: string;
  value: number | string;
  loading: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, loading }) => {
  return (
    <Card className="bg-white dark:bg-secondary">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [allPatents, setAllPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof Patent | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [employeeOptions, setEmployeeOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Get user role from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Filter patents based on user role
  const filterPatentsByUserRole = (patents: Patent[]) => {
    if (!user) return patents;

    switch (user.role) {
      case 'drafter':
        return patents.filter(
          (patent) =>
            patent.ps_drafter_assgn === user.full_name ||
            patent.cs_drafter_assgn === user.full_name ||
            patent.fer_drafter_assgn === user.full_name
        );
      case 'filer':
        return patents.filter(
          (patent) =>
            patent.ps_filer_assgn === user.full_name ||
            patent.cs_filer_assgn === user.full_name ||
            patent.fer_filer_assgn === user.full_name
        );
      default:
        return patents;
    }
  };

  useEffect(() => {
    const fetchPatentData = async () => {
      try {
        setLoading(true);
        const response = await fetchPatentsAndEmployees();
        
        if (response) {
          if ('patents' in response && Array.isArray(response.patents)) {
            setAllPatents(response.patents);
            setFilteredPatents(response.patents);
          } else if (Array.isArray(response)) {
            setAllPatents(response);
            setFilteredPatents(response);
          } else {
            setAllPatents([]);
            setFilteredPatents([]);
          }
        } else {
          setAllPatents([]);
          setFilteredPatents([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
        setAllPatents([]);
        setFilteredPatents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatentData();
  }, []);

  useEffect(() => {
    if (allPatents.length > 0) {
      // Apply user role filter
      let filtered = filterPatentsByUserRole(allPatents);

      // Apply status filter
      if (selectedStatus) {
        filtered = filtered.filter((patent) => {
          switch (selectedStatus) {
            case 'withdrawn':
              return patent.withdrawn === true;
            case 'completed':
              return patent.completed === true;
            case 'idf_sent':
              return patent.idf_sent === true;
            case 'invoice_sent':
              return patent.invoice_sent === true;
            default:
              return true;
          }
        });
      }

      // Apply employee filter
      if (selectedEmployee) {
        filtered = filtered.filter(
          (patent) =>
            patent.ps_drafter_assgn === selectedEmployee ||
            patent.ps_filer_assgn === selectedEmployee ||
            patent.cs_drafter_assgn === selectedEmployee ||
            patent.cs_filer_assgn === selectedEmployee ||
            patent.fer_drafter_assgn === selectedEmployee ||
            patent.fer_filer_assgn === selectedEmployee
        );
      }

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (patent) =>
            patent.tracking_id.toLowerCase().includes(term) ||
            patent.patent_title.toLowerCase().includes(term) ||
            patent.patent_applicant.toLowerCase().includes(term)
        );
      }

      setFilteredPatents(filtered);
    }
  }, [allPatents, searchTerm, user, selectedStatus, selectedEmployee]);

  useEffect(() => {
    const extractEmployeeOptions = async () => {
      try {
        setLoading(true);
        const response = await fetchPatentsAndEmployees();

        if (response && response.employees) {
          const uniqueEmployeeOptions = [
            ...new Set(response.employees.map((emp) => emp.full_name)),
          ].map((name) => ({ value: name, label: name }));
          setEmployeeOptions(uniqueEmployeeOptions);
        } else {
          setEmployeeOptions([]);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employee options');
        setEmployeeOptions([]);
      } finally {
        setLoading(false);
      }
    };

    extractEmployeeOptions();
  }, []);

  const handleSort = (column: keyof Patent) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedPatents = React.useMemo(() => {
    if (!sortColumn) return filteredPatents;

    return [...filteredPatents].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return -1;
      if (bValue === null || bValue === undefined) return 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [filteredPatents, sortColumn, sortDirection]);

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('created')) {
      return <User className="h-4 w-4 text-blue-500" />;
    } else if (eventType.includes('assigned')) {
      return <User className="h-4 w-4 text-purple-500" />;
    } else if (eventType.includes('deadline')) {
      return <CalendarClock className="h-4 w-4 text-orange-500" />;
    } else if (eventType.includes('draft_completed') || eventType.includes('filing_completed')) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (eventType.includes('approved')) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    } else if (eventType.includes('draft')) {
      return <FileEdit className="h-4 w-4 text-amber-500" />;
    } else if (eventType.includes('filing') || eventType.includes('file')) {
      return <FileText className="h-4 w-4 text-sky-500" />;
    } else {
      return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Patents"
          value={allPatents.length}
          loading={loading}
        />
        <DashboardCard
          title="Patents Assigned to You"
          value={filterPatentsByUserRole(allPatents).length}
          loading={loading}
        />
        <DashboardCard
          title="Completed Patents"
          value={allPatents.filter((patent) => patent.completed).length}
          loading={loading}
        />
        <DashboardCard
          title="Withdrawn Patents"
          value={allPatents.filter((patent) => patent.withdrawn).length}
          loading={loading}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Updates</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patents..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedStatus(null)}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus('withdrawn')}>
              Withdrawn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus('completed')}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus('idf_sent')}>
              IDF Sent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus('invoice_sent')}>
              Invoice Sent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Select
          onValueChange={(value) => setSelectedEmployee(value)}
          defaultValue={selectedEmployee || ''}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Employees</SelectItem>
            {employeeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPatents.map((patent) => (
            <PatentCard key={patent.id} patent={patent} isCompact={true} />
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Updates</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPatents.slice(0, 6).map((patent) => (
            <PatentCard key={patent.id} patent={patent} isCompact={true} showReviewBadge={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
