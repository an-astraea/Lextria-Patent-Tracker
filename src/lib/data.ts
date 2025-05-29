import { supabase } from "@/integrations/supabase/client";
import { Patent, Employee, FERHistory, FEREntry, Inventor, PatentFormData, EmployeeFormData } from "./types";

import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  CheckSquare,
  Calendar,
  Settings,
  Bell,
  Search,
  Building2,
  Upload
} from 'lucide-react';

export const adminNavItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Patents',
    icon: FileText,
    href: '/patents',
  },
  {
    label: 'Employees',
    icon: Users,
    href: '/employees',
  },
  {
    label: 'Approvals',
    icon: CheckSquare,
    href: '/approvals',
  },
  {
    label: 'Client Dashboard',
    icon: Building2,
    href: '/clients',
  },
  {
    label: 'Bulk Upload',
    icon: Upload,
    href: '/bulk-upload',
  }
];

export const drafterNavItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Patents',
    icon: FileText,
    href: '/patents',
  },
  {
    label: 'My Drafts',
    icon: FileSearch2,
    href: '/drafts',
  }
];

export const filerNavItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Patents',
    icon: FileText,
    href: '/patents',
  },
  {
    label: 'My Filings',
    icon: CheckSquare,
    href: '/filings',
  },
  {
    label: 'Approvals',
    icon: UserCheck,
    href: '/approvals',
  },
  {
    label: 'Client Dashboard',
    icon: Building2,
    href: '/clients',
  }
];

// Sample patents data
export const patents: Patent[] = [
  {
    id: "1",
    tracking_id: "PAT-001",
    patent_applicant: "Tech Solutions Inc.",
    client_id: "CLIENT-001",
    application_no: "APP12345",
    date_of_filing: "2023-01-15",
    patent_title: "Advanced Machine Learning Algorithm for Data Processing",
    applicant_addr: "123 Innovation Way, Tech Park, CA 95123",
    inventor_ph_no: "+1-555-123-4567",
    inventor_email: "inventor@techsolutions.com",
    ps_drafting_status: 1,
    ps_drafter_assgn: "John Doe",
    ps_drafter_deadline: "2023-01-01",
    ps_review_draft_status: 0,
    ps_filing_status: 1,
    ps_filer_assgn: "Jane Smith",
    ps_filer_deadline: "2023-01-10",
    ps_review_file_status: 0,
    ps_completion_status: 1,
    cs_drafting_status: 1,
    cs_drafter_assgn: "John Doe",
    cs_drafter_deadline: "2023-02-01",
    cs_review_draft_status: 0,
    cs_filing_status: 0,
    cs_filer_assgn: "Jane Smith",
    cs_filer_deadline: "2023-02-15",
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 1,
    fer_drafter_status: 0,
    fer_drafter_assgn: "John Doe",
    fer_drafter_deadline: "2023-03-01",
    fer_filing_status: 0,
    fer_filer_assgn: "Jane Smith",
    fer_filer_deadline: "2023-03-15",
    form_1: true,
    form_2: true,
    form_3: false,
    form_4: false,
    form_5: false,
    form_26: true,
    form_18: true,
    form_18a: false,
    form_9: true,
    form_9a: false,
    form_13: false,
    created_at: "2022-12-15T10:00:00Z",
    updated_at: "2023-02-20T15:30:00Z",
    inventors: [
      {
        id: "1",
        tracking_id: "PAT-001",
        inventor_name: "Dr. Robert Chen",
        inventor_addr: "456 Research Blvd, Innovation City, CA 95124",
        created_at: "2022-12-15T10:00:00Z",
        updated_at: "2022-12-15T10:00:00Z",
      },
      {
        id: "2",
        tracking_id: "PAT-001",
        inventor_name: "Dr. Lisa Wang",
        inventor_addr: "789 Science Drive, Tech City, CA 95125",
        created_at: "2022-12-15T10:00:00Z",
        updated_at: "2022-12-15T10:00:00Z",
      },
    ],
    fer_entries: [
      {
        id: "1",
        patent_id: "1",
        fer_number: 1,
        fer_drafter_assgn: "John Doe",
        fer_drafter_deadline: "2023-03-01",
        fer_drafter_status: 0,
        fer_filer_assgn: "Jane Smith",
        fer_filer_deadline: "2023-03-15",
        fer_filing_status: 0,
        fer_review_draft_status: 0,
        fer_review_file_status: 0,
        fer_completion_status: 0,
        created_at: "2023-02-20T15:30:00Z",
        updated_at: "2023-02-20T15:30:00Z",
      },
    ],
  },
  {
    id: "2",
    tracking_id: "PAT-002",
    patent_applicant: "MediHealth Solutions",
    client_id: "CLIENT-002",
    application_no: "APP67890",
    date_of_filing: "2023-02-10",
    patent_title: "Novel Drug Delivery System for Cancer Treatment",
    applicant_addr: "456 Health Boulevard, Medical District, NY 10001",
    inventor_ph_no: "+1-555-987-6543",
    inventor_email: "inventor@medihealth.com",
    ps_drafting_status: 1,
    ps_drafter_assgn: "Michael Brown",
    ps_drafter_deadline: "2023-01-15",
    ps_review_draft_status: 0,
    ps_filing_status: 1,
    ps_filer_assgn: "Sarah Johnson",
    ps_filer_deadline: "2023-02-01",
    ps_review_file_status: 0,
    ps_completion_status: 1,
    cs_drafting_status: 0,
    cs_drafter_assgn: "Michael Brown",
    cs_drafter_deadline: "2023-03-01",
    cs_review_draft_status: 0,
    cs_filing_status: 0,
    cs_filer_assgn: "Sarah Johnson",
    cs_filer_deadline: "2023-03-15",
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    form_1: true,
    form_2: true,
    form_3: false,
    form_4: false,
    form_5: false,
    form_26: false,
    form_18: true,
    form_18a: false,
    form_9: true,
    form_9a: false,
    form_13: false,
    created_at: "2023-01-05T09:45:00Z",
    updated_at: "2023-02-15T14:20:00Z",
    inventors: [
      {
        id: "3",
        tracking_id: "PAT-002",
        inventor_name: "Dr. Emily Johnson",
        inventor_addr: "123 Medical Avenue, Research Park, NY 10002",
        created_at: "2023-01-05T09:45:00Z",
        updated_at: "2023-01-05T09:45:00Z",
      },
    ],
  },
  {
    id: "3",
    tracking_id: "PAT-003",
    patent_applicant: "GlobalTech Innovations",
    client_id: "CLIENT-003",
    application_no: "APP24680",
    date_of_filing: "2023-03-05",
    patent_title: "Smart Energy Management System for Sustainable Homes",
    applicant_addr: "789 Green Avenue, Eco-City, WA 98101",
    inventor_ph_no: "+1-555-789-3456",
    inventor_email: "inventor@globaltech.com",
    ps_drafting_status: 0,
    ps_drafter_assgn: "David Lee",
    ps_drafter_deadline: "2023-02-10",
    ps_review_draft_status: 1,
    ps_filing_status: 0,
    ps_filer_assgn: "Karen White",
    ps_filer_deadline: "2023-03-01",
    ps_review_file_status: 0,
    ps_completion_status: 0,
    cs_drafting_status: 1,
    cs_drafter_assgn: "David Lee",
    cs_drafter_deadline: "2023-04-01",
    cs_review_draft_status: 0,
    cs_filing_status: 0,
    cs_filer_assgn: "Karen White",
    cs_filer_deadline: "2023-04-15",
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 1,
    fer_drafter_status: 0,
    fer_drafter_assgn: "David Lee",
    fer_drafter_deadline: "2023-05-01",
    fer_filing_status: 0,
    fer_filer_assgn: "Karen White",
    fer_filer_deadline: "2023-05-15",
    form_1: true,
    form_2: true,
    form_3: false,
    form_4: false,
    form_5: false,
    form_26: true,
    form_18: true,
    form_18a: false,
    form_9: true,
    form_9a: false,
    form_13: false,
    created_at: "2023-02-15T11:30:00Z",
    updated_at: "2023-03-10T16:45:00Z",
    inventors: [
      {
        id: "4",
        tracking_id: "PAT-003",
        inventor_name: "Dr. James Green",
        inventor_addr: "456 Sustainable Street, Eco-Village, WA 98102",
        created_at: "2023-02-15T11:30:00Z",
        updated_at: "2023-02-15T11:30:00Z",
      },
    ],
    fer_entries: [
      {
        id: "3",
        patent_id: "3",
        fer_number: 1,
        fer_drafter_assgn: "David Lee",
        fer_drafter_deadline: "2023-05-01",
        fer_drafter_status: 0,
        fer_filer_assgn: "Karen White",
        fer_filer_deadline: "2023-05-15",
        fer_filing_status: 0,
        fer_review_draft_status: 0,
        fer_review_file_status: 0,
        fer_completion_status: 0,
        created_at: "2023-03-10T16:45:00Z",
        updated_at: "2023-03-10T16:45:00Z",
      },
    ],
  },
  {
    id: "4",
    tracking_id: "PAT-004",
    patent_applicant: "SecureData Systems",
    client_id: "CLIENT-004",
    application_no: "APP86420",
    date_of_filing: "2023-04-01",
    patent_title: "Advanced Cybersecurity Protocol for Data Protection",
    applicant_addr: "123 Security Lane, Cyber City, MD 20740",
    inventor_ph_no: "+1-555-234-8901",
    inventor_email: "inventor@securedata.com",
    ps_drafting_status: 1,
    ps_drafter_assgn: "Linda Clark",
    ps_drafter_deadline: "2023-03-15",
    ps_review_draft_status: 0,
    ps_filing_status: 0,
    ps_filer_assgn: "Peter Hall",
    ps_filer_deadline: "2023-04-15",
    ps_review_file_status: 1,
    ps_completion_status: 0,
    cs_drafting_status: 0,
    cs_drafter_assgn: "Linda Clark",
    cs_drafter_deadline: "2023-05-01",
    cs_review_draft_status: 0,
    cs_filing_status: 0,
    cs_filer_assgn: "Peter Hall",
    cs_filer_deadline: "2023-05-15",
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    form_1: true,
    form_2: true,
    form_3: false,
    form_4: false,
    form_5: false,
    form_26: false,
    form_18: true,
    form_18a: false,
    form_9: true,
    form_9a: false,
    form_13: false,
    created_at: "2023-03-20T08:15:00Z",
    updated_at: "2023-04-05T13:30:00Z",
    inventors: [
      {
        id: "5",
        tracking_id: "PAT-004",
        inventor_name: "Dr. Susan White",
        inventor_addr: "789 Data Drive, Security Park, MD 20742",
        created_at: "2023-03-20T08:15:00Z",
        updated_at: "2023-03-20T08:15:00Z",
      },
    ],
  },
  {
    id: "5",
    tracking_id: "PAT-005",
    patent_applicant: "FoodTech Innovations",
    client_id: "CLIENT-005",
    application_no: "APP97531",
    date_of_filing: "2023-05-01",
    patent_title: "Innovative Food Preservation Technology for Global Distribution",
    applicant_addr: "456 Food Avenue, Agri-City, IA 50010",
    inventor_ph_no: "+1-555-890-2345",
    inventor_email: "inventor@foodtech.com",
    ps_drafting_status: 0,
    ps_drafter_assgn: "Richard Davis",
    ps_drafter_deadline: "2023-04-15",
    ps_review_draft_status: 0,
    ps_filing_status: 0,
    ps_filer_assgn: "Laura Green",
    ps_filer_deadline: "2023-05-15",
    ps_review_file_status: 0,
    ps_completion_status: 0,
    cs_drafting_status: 0,
    cs_drafter_assgn: "Richard Davis",
    cs_drafter_deadline: "2023-06-01",
    cs_review_draft_status: 1,
    cs_filing_status: 0,
    cs_filer_assgn: "Laura Green",
    cs_filer_deadline: "2023-06-15",
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 1,
    fer_drafter_status: 0,
    fer_drafter_assgn: "Richard Davis",
    fer_drafter_deadline: "2023-07-01",
    fer_filing_status: 0,
    fer_filer_assgn: "Laura Green",
    fer_filer_deadline: "2023-07-15",
    form_1: true,
    form_2: true,
    form_3: false,
    form_4: false,
    form_5: false,
    form_26: true,
    form_18: true,
    form_18a: false,
    form_9: true,
    form_9a: false,
    form_13: false,
    created_at: "2023-04-01T10:00:00Z",
    updated_at: "2023-05-05T15:45:00Z",
    inventors: [
      {
        id: "6",
        tracking_id: "PAT-005",
        inventor_name: "Dr. Alan Brown",
        inventor_addr: "123 Biotech Road, Research Center, IA 50011",
        created_at: "2023-04-01T10:00:00Z",
        updated_at: "2023-04-01T10:00:00Z",
      },
    ],
    fer_entries: [
      {
        id: "4",
        patent_id: "5",
        fer_number: 1,
        fer_drafter_assgn: "Richard Davis",
        fer_drafter_deadline: "2023-07-01",
        fer_drafter_status: 0,
        fer_filer_assgn: "Laura Green",
        fer_filer_deadline: "2023-07-15",
        fer_filing_status: 0,
        fer_review_draft_status: 0,
        fer_review_file_status: 0,
        fer_completion_status: 0,
        created_at: "2023-05-05T15:45:00Z",
        updated_at: "2023-05-05T15:45:00Z",
      },
    ],
  },
];

// Sample employees data
export const employees: Employee[] = [
  {
    id: "1",
    emp_id: "EMP001",
    full_name: "John Doe",
    email: "john.doe@company.com",
    ph_no: "+1-555-123-4567",
    role: "drafter",
    created_at: "2022-01-01T09:00:00Z",
    updated_at: "2022-01-01T09:00:00Z",
  },
  {
    id: "2",
    emp_id: "EMP002",
    full_name: "Jane Smith",
    email: "jane.smith@company.com",
    ph_no: "+1-555-234-5678",
    role: "filer",
    created_at: "2022-01-02T10:00:00Z",
    updated_at: "2022-01-02T10:00:00Z",
  },
  {
    id: "3",
    emp_id: "EMP003",
    full_name: "Michael Brown",
    email: "michael.brown@company.com",
    ph_no: "+1-555-345-6789",
    role: "drafter",
    created_at: "2022-01-03T11:00:00Z",
    updated_at: "2022-01-03T11:00:00Z",
  },
  {
    id: "4",
    emp_id: "EMP004",
    full_name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    ph_no: "+1-555-456-7890",
    role: "filer",
    created_at: "2022-01-04T12:00:00Z",
    updated_at: "2022-01-04T12:00:00Z",
  },
  {
    id: "5",
    emp_id: "EMP005",
    full_name: "Admin User",
    email: "admin@company.com",
    ph_no: "+1-555-567-8901",
    role: "admin",
    created_at: "2022-01-05T13:00:00Z",
    updated_at: "2022-01-05T13:00:00Z",
  },
];

// Sample FER history data
export const ferHistory: FERHistory[] = [
  {
    id: "1",
    patent_id: "1",
    fer_number: 1,
    date: "2023-02-20",
    action: "Created FER entry",
    notes: "First examination report created",
    created_at: "2023-02-20T15:30:00Z",
    updated_at: "2023-02-20T15:30:00Z",
    tracking_id: "PAT-001",
    fer_drafter_assgn: "John Doe",
    fer_drafter_deadline: "2023-03-01",
    fer_filer_assgn: "Jane Smith",
    fer_filer_deadline: "2023-03-15",
  },
  {
    id: "2",
    patent_id: "1",
    fer_number: 2,
    date: "2023-04-15",
    action: "Created second FER entry",
    notes: "Follow-up examination report",
    created_at: "2023-04-15T10:45:00Z",
    updated_at: "2023-04-15T10:45:00Z",
    tracking_id: "PAT-001",
    fer_drafter_assgn: "Michael Brown",
    fer_drafter_deadline: "2023-05-01",
    fer_filer_assgn: "Sarah Johnson",
    fer_filer_deadline: "2023-05-15",
  },
];

// Sample FER entries data
export const ferEntries: FEREntry[] = [
  {
    id: "1",
    patent_id: "1",
    fer_number: 1,
    fer_drafter_assgn: "John Doe",
    fer_drafter_deadline: "2023-03-01",
    fer_drafter_status: 0,
    fer_filer_assgn: "Jane Smith",
    fer_filer_deadline: "2023-03-15",
    fer_filing_status: 0,
    fer_review_draft_status: 0,
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: "2023-02-20T15:30:00Z",
    updated_at: "2023-02-20T15:30:00Z",
  },
  {
    id: "2",
    patent_id: "1",
    fer_number: 2,
    fer_drafter_assgn: "Michael Brown",
    fer_drafter_deadline: "2023-05-01",
    fer_drafter_status: 1,
    fer_filer_assgn: "Sarah Johnson",
    fer_filer_deadline: "2023-05-15",
    fer_filing_status: 0,
    fer_review_draft_status: 1,
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: "2023-04-15T10:45:00Z",
    updated_at: "2023-04-15T10:45:00Z",
  },
];

export const inventors: Inventor[] = [
  {
    id: "1",
    tracking_id: "PAT-001",
    inventor_name: "Dr. Robert Chen",
    inventor_addr: "456 Research Blvd, Innovation City, CA 95124",
    created_at: "2022-12-15T10:00:00Z",
    updated_at: "2022-12-15T10:00:00Z",
  },
  {
    id: "2",
    tracking_id: "PAT-001",
    inventor_name: "Dr. Lisa Wang",
    inventor_addr: "789 Science Drive, Tech City, CA 95125",
    created_at: "2022-12-15T10:00:00Z",
    updated_at: "2022-12-15T10:00:00Z",
  },
  {
    id: "3",
    tracking_id: "PAT-002",
    inventor_name: "Dr. Emily Johnson",
    inventor_addr: "123 Medical Avenue, Research Park, NY 10002",
    created_at: "2023-01-05T09:45:00Z",
    updated_at: "2023-01-05T09:45:00Z",
  },
];

// Mock data functions with proper error handling
export const fetchPatents = async (): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patents:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch patents:', error);
    return [];
  }
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }

    return (data || []).map(employee => ({
      ...employee,
      role: employee.role as 'admin' | 'drafter' | 'filer'
    }));
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
};

export const createPatent = async (patentData: PatentFormData): Promise<Patent | null> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .insert({
        tracking_id: patentData.tracking_id,
        patent_applicant: patentData.patent_applicant,
        client_id: patentData.client_id,
        application_no: patentData.application_no,
        date_of_filing: patentData.date_of_filing,
        patent_title: patentData.patent_title,
        applicant_addr: patentData.applicant_addr,
        inventor_ph_no: patentData.inventor_ph_no,
        inventor_email: patentData.inventor_email,
        ps_drafter_assgn: patentData.ps_drafter_assgn,
        ps_drafter_deadline: patentData.ps_drafter_deadline,
        ps_filer_assgn: patentData.ps_filer_assgn,
        ps_filer_deadline: patentData.ps_filer_deadline,
        cs_drafter_assgn: patentData.cs_drafter_assgn,
        cs_drafter_deadline: patentData.cs_drafter_deadline,
        cs_filer_assgn: patentData.cs_filer_assgn,
        cs_filer_deadline: patentData.cs_filer_deadline,
        fer_status: patentData.fer_status ? 1 : 0,
        fer_drafter_assgn: patentData.fer_drafter_assgn,
        fer_drafter_deadline: patentData.fer_drafter_deadline,
        fer_filer_assgn: patentData.fer_filer_assgn,
        fer_filer_deadline: patentData.fer_filer_deadline,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating patent:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create patent:', error);
    return null;
  }
};

export const updatePatent = async (id: string, patentData: Partial<PatentFormData>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .update(patentData)
      .eq('id', id);

    if (error) {
      console.error('Error updating patent:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to update patent:', error);
    return false;
  }
};

export const deletePatent = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting patent:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete patent:', error);
    return false;
  }
};

export const createEmployee = async (employeeData: EmployeeFormData): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        emp_id: employeeData.emp_id,
        full_name: employeeData.full_name,
        email: employeeData.email,
        ph_no: employeeData.ph_no,
        password: employeeData.password,
        role: employeeData.role
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      throw error;
    }

    return {
      ...data,
      role: data.role as 'admin' | 'drafter' | 'filer'
    };
  } catch (error) {
    console.error('Failed to create employee:', error);
    return null;
  }
};

export const updateEmployee = async (id: string, employeeData: Partial<EmployeeFormData>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id);

    if (error) {
      console.error('Error updating employee:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to update employee:', error);
    return false;
  }
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return false;
  }
};

export const createFERHistory = async (ferData: Omit<FERHistory, 'id' | 'created_at'>): Promise<FERHistory | null> => {
  try {
    const { data, error } = await supabase
      .from('fer_history')
      .insert(ferData)
      .select()
      .single();

    if (error) {
      console.error('Error creating FER history:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create FER history:', error);
    return null;
  }
};

export const createFEREntry = async (ferEntry: Omit<FEREntry, 'id' | 'created_at' | 'updated_at'>): Promise<FEREntry | null> => {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .insert(ferEntry)
      .select()
      .single();

    if (error) {
      console.error('Error creating FER entry:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create FER entry:', error);
    return null;
  }
};

export const createInventor = async (inventorData: Omit<Inventor, 'id'>): Promise<Inventor | null> => {
  try {
    const { data, error } = await supabase
      .from('inventors')
      .insert(inventorData)
      .select()
      .single();

    if (error) {
      console.error('Error creating inventor:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create inventor:', error);
    return null;
  }
};
