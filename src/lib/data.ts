import { Patent, Employee, FERHistory, FEREntry, PatentTimeline } from './types';

export const employeeData: Employee[] = [
  {
    id: 'employee-1',
    emp_id: 'EMP-001',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    ph_no: '123-456-7890',
    password: 'password123',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    role: 'admin',
  },
  {
    id: 'employee-2',
    emp_id: 'EMP-002',
    full_name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    ph_no: '987-654-3210',
    password: 'password456',
    created_at: '2023-02-15T00:00:00Z',
    updated_at: '2023-02-15T00:00:00Z',
    role: 'drafter',
  },
  {
    id: 'employee-3',
    emp_id: 'EMP-003',
    full_name: 'Bob Williams',
    email: 'bob.williams@example.com',
    ph_no: '456-789-0123',
    password: 'password789',
    created_at: '2023-03-10T00:00:00Z',
    updated_at: '2023-03-10T00:00:00Z',
    role: 'filer',
  },
];

export const ferHistoriesData: FERHistory[] = [
  {
    id: 'fer-history-1',
    tracking_id: 'PAT-001',
    fer_drafter_assgn: 'John Doe',
    fer_drafter_deadline: '2023-12-15',
    fer_filer_assgn: 'Alice Johnson',
    fer_filer_deadline: '2023-12-30',
    created_at: '2023-10-15T09:00:00Z'
  },
  {
    id: 'fer-history-2',
    tracking_id: 'PAT-002',
    fer_drafter_assgn: 'Emily Smith',
    fer_drafter_deadline: '2023-11-20',
    fer_filer_assgn: 'Bob Williams',
    fer_filer_deadline: '2023-12-05',
    created_at: '2023-10-01T14:30:00Z'
  }
];

export const ferEntriesData: FEREntry[] = [
  {
    id: 'fer-entry-1',
    patent_id: 'patent-1',
    fer_number: 1,
    fer_date: '2023-01-01',
    fer_drafter_assgn: 'John Doe',
    fer_drafter_deadline: '2023-01-15',
    fer_drafter_status: 0,
    fer_filer_assgn: 'Alice Johnson',
    fer_filer_deadline: '2023-01-30',
    fer_filing_status: 0,
    fer_review_draft_status: 0,
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'fer-entry-2',
    patent_id: 'patent-2',
    fer_number: 2,
    fer_date: '2023-02-01',
    fer_drafter_assgn: 'Emily Smith',
    fer_drafter_deadline: '2023-02-15',
    fer_drafter_status: 0,
    fer_filer_assgn: 'Bob Williams',
    fer_filer_deadline: '2023-02-28',
    fer_filing_status: 0,
    fer_review_draft_status: 0,
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2023-02-01T00:00:00Z',
  },
];

export const timelineData: PatentTimeline[] = [
  {
    id: 'timeline-1',
    patent_id: 'patent-1',
    event_type: 'Drafting Started',
    event_description: 'Drafting of patent application started',
    created_at: '2023-01-05T08:00:00Z',
    status: 1,
    employee_name: 'Alice Johnson',
    deadline_date: '2023-01-20T00:00:00Z',
  },
  {
    id: 'timeline-2',
    patent_id: 'patent-1',
    event_type: 'Drafting Completed',
    event_description: 'Drafting of patent application completed',
    created_at: '2023-01-18T17:00:00Z',
    status: 1,
    employee_name: 'Alice Johnson',
    deadline_date: '2023-01-20T00:00:00Z',
  },
  {
    id: 'timeline-3',
    patent_id: 'patent-2',
    event_type: 'Filing Started',
    event_description: 'Patent application filing started',
    created_at: '2023-02-10T10:00:00Z',
    status: 1,
    employee_name: 'Bob Williams',
    deadline_date: '2023-02-25T00:00:00Z',
  },
];
