
import { Employee, Patent, User } from './types';

// Generate random ID
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Format date for display
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Mock Employees
export const employees: Employee[] = [
  {
    id: '1',
    emp_id: 'EMP001',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    ph_no: '9876543210',
    password: 'password123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'admin',
  },
  {
    id: '2',
    emp_id: 'EMP002',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    ph_no: '8765432109',
    password: 'password123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'drafter',
  },
  {
    id: '3',
    emp_id: 'EMP003',
    full_name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    ph_no: '7654321098',
    password: 'password123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'filer',
  },
];

// Mock Patents
export const patents: Patent[] = [
  {
    id: '1',
    tracking_id: 'PAT001',
    patent_applicant: 'Acme Technologies',
    client_id: 'CLIENT001',
    application_no: 'APP12345',
    date_of_filing: '2023-06-15',
    patent_title: 'Advanced Machine Learning System',
    applicant_addr: '123 Tech St, Silicon Valley, CA',
    inventor_ph_no: '9876543210',
    inventor_email: 'inventor@acmetech.com',
    ps_drafting_status: 1,
    ps_drafter_assgn: 'Jane Smith',
    ps_drafter_deadline: '2023-05-15',
    ps_review_draft_status: 1,
    ps_filing_status: 1,
    ps_filer_assgn: 'Robert Johnson',
    ps_filer_deadline: '2023-06-01',
    ps_review_file_status: 1,
    ps_completion_status: 1,
    cs_drafting_status: 1,
    cs_drafter_assgn: 'Jane Smith',
    cs_drafter_deadline: '2023-07-15',
    cs_review_draft_status: 1,
    cs_filing_status: 0,
    cs_filer_assgn: 'Robert Johnson',
    cs_filer_deadline: '2023-08-01',
    form_26: true,
    form_18: true,
    form_18a: false,
    form_9: true,
    form_9a: false,
    form_13: false,
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    fer_drafter_status: 0,
    fer_drafter_assgn: '',
    fer_drafter_deadline: '',
    fer_review_draft_status: 0,
    fer_filing_status: 0,
    fer_filer_assgn: '',
    fer_filer_deadline: '',
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: '2023-04-10T09:00:00Z',
    updated_at: '2023-07-05T14:30:00Z',
    inventors: [
      {
        id: '1',
        tracking_id: 'PAT001',
        inventor_name: 'Alan Turing',
        inventor_addr: '456 AI Boulevard, London, UK',
      },
    ],
  },
  {
    id: '2',
    tracking_id: 'PAT002',
    patent_applicant: 'Innovative Solutions Inc.',
    client_id: 'CLIENT002',
    application_no: 'APP67890',
    date_of_filing: '2023-07-22',
    patent_title: 'Renewable Energy Storage Device',
    applicant_addr: '789 Green Ave, Boston, MA',
    inventor_ph_no: '8765432109',
    inventor_email: 'inventor@innovativesol.com',
    ps_drafting_status: 1,
    ps_drafter_assgn: 'Jane Smith',
    ps_drafter_deadline: '2023-06-22',
    ps_review_draft_status: 1,
    ps_filing_status: 1,
    ps_filer_assgn: 'Robert Johnson',
    ps_filer_deadline: '2023-07-15',
    ps_review_file_status: 1,
    ps_completion_status: 1,
    cs_drafting_status: 0,
    cs_drafter_assgn: 'Jane Smith',
    cs_drafter_deadline: '2023-08-22',
    cs_review_draft_status: 0,
    cs_filing_status: 0,
    cs_filer_assgn: 'Robert Johnson',
    cs_filer_deadline: '2023-09-15',
    form_26: null,
    form_18: null,
    form_18a: null,
    form_9: null,
    form_9a: null,
    form_13: null,
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    fer_drafter_status: 0,
    fer_drafter_assgn: '',
    fer_drafter_deadline: '',
    fer_review_draft_status: 0,
    fer_filing_status: 0,
    fer_filer_assgn: '',
    fer_filer_deadline: '',
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: '2023-05-20T11:15:00Z',
    updated_at: '2023-07-25T10:45:00Z',
    inventors: [
      {
        id: '2',
        tracking_id: 'PAT002',
        inventor_name: 'Marie Curie',
        inventor_addr: '321 Science Street, Paris, France',
      },
      {
        id: '3',
        tracking_id: 'PAT002',
        inventor_name: 'Nikola Tesla',
        inventor_addr: '567 Electric Avenue, New York, NY',
      },
    ],
  },
  {
    id: '3',
    tracking_id: 'PAT003',
    patent_applicant: 'Future Medical Devices',
    client_id: 'CLIENT003',
    application_no: null,
    date_of_filing: '2023-08-05',
    patent_title: 'Non-Invasive Blood Glucose Monitor',
    applicant_addr: '456 Health Blvd, San Diego, CA',
    inventor_ph_no: '7654321098',
    inventor_email: 'inventor@futuremedical.com',
    ps_drafting_status: 1,
    ps_drafter_assgn: 'Jane Smith',
    ps_drafter_deadline: '2023-07-15',
    ps_review_draft_status: 1,
    ps_filing_status: 0,
    ps_filer_assgn: 'Robert Johnson',
    ps_filer_deadline: '2023-08-01',
    ps_review_file_status: 0,
    ps_completion_status: 0,
    cs_drafting_status: 0,
    cs_drafter_assgn: '',
    cs_drafter_deadline: '',
    cs_review_draft_status: 0,
    cs_filing_status: 0,
    cs_filer_assgn: '',
    cs_filer_deadline: '',
    form_26: null,
    form_18: null,
    form_18a: null,
    form_9: null,
    form_9a: null,
    form_13: null,
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    fer_drafter_status: 0,
    fer_drafter_assgn: '',
    fer_drafter_deadline: '',
    fer_review_draft_status: 0,
    fer_filing_status: 0,
    fer_filer_assgn: '',
    fer_filer_deadline: '',
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: '2023-06-30T13:45:00Z',
    updated_at: '2023-07-20T09:30:00Z',
    inventors: [
      {
        id: '4',
        tracking_id: 'PAT003',
        inventor_name: 'Elizabeth Blackwell',
        inventor_addr: '789 Medical Center, Chicago, IL',
      },
    ],
  },
];

// Default user for login demo
export const defaultUser: User = {
  id: '1',
  emp_id: 'EMP001',
  full_name: 'John Doe',
  email: 'admin@example.com',
  role: 'admin',
};

// Function to get employee by ID
export const getEmployeeById = (id: string): Employee | undefined => {
  return employees.find(employee => employee.id === id);
};

// Function to get patent by ID
export const getPatentById = (id: string): Patent | undefined => {
  return patents.find(patent => patent.id === id);
};

// Function to get employees by role
export const getEmployeesByRole = (role: 'admin' | 'drafter' | 'filer'): Employee[] => {
  return employees.filter(employee => employee.role === role);
};

// Function to get patents pending approval
export const getPatentsPendingApproval = (): Patent[] => {
  return patents.filter(patent => 
    (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) || 
    (patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) ||
    (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) ||
    (patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) ||
    (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) ||
    (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0)
  );
};
