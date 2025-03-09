
import { Patent, Employee } from './types';

// Generate mock patents
export const MOCK_PATENTS: Patent[] = Array(15).fill(null).map((_, index) => ({
  id: `patent-${index + 1}`,
  tracking_id: `TRK-${100 + index}`,
  patent_applicant: `Applicant ${index + 1}`,
  client_id: `CLIENT-${index % 5 + 1}`,
  application_no: index % 3 === 0 ? null : `APP-${200 + index}`,
  date_of_filing: new Date(2023, index % 12, (index % 28) + 1).toISOString(),
  patent_title: `Patent Title ${index + 1}`,
  applicant_addr: `123 Main St, Suite ${index + 100}, Mumbai, India`,
  inventor_ph_no: `+91-9${index}00000000`,
  inventor_email: `inventor${index + 1}@example.com`,
  ps_drafting_status: index % 3,
  ps_drafter_assgn: index % 5 === 0 ? 'Drafter User' : `Drafter ${index % 3 + 1}`,
  ps_drafter_deadline: new Date(2023, (index % 12) + 1, (index % 28) + 1).toISOString(),
  ps_review_draft_status: index % 4 === 0 ? 1 : 0,
  ps_filing_status: index % 4,
  ps_filer_assgn: index % 5 === 0 ? 'Filer User' : `Filer ${index % 3 + 1}`,
  ps_filer_deadline: new Date(2023, (index % 12) + 2, (index % 28) + 1).toISOString(),
  ps_review_file_status: index % 5 === 0 ? 1 : 0,
  ps_completion_status: index % 6 === 0 ? 1 : 0,
  cs_drafting_status: index % 3,
  cs_drafter_assgn: index % 5 === 0 ? 'Drafter User' : `Drafter ${index % 4 + 1}`,
  cs_drafter_deadline: new Date(2023, (index % 12) + 3, (index % 28) + 1).toISOString(),
  cs_review_draft_status: index % 7 === 0 ? 1 : 0,
  cs_filing_status: index % 5,
  cs_filer_assgn: index % 5 === 0 ? 'Filer User' : `Filer ${index % 4 + 1}`,
  cs_filer_deadline: new Date(2023, (index % 12) + 4, (index % 28) + 1).toISOString(),
  form_26: index % 2 === 0,
  form_18: index % 3 === 0,
  form_18a: index % 4 === 0,
  form_9: index % 2 === 1,
  form_9a: index % 3 === 1,
  form_13: index % 4 === 1,
  cs_review_file_status: index % 8 === 0 ? 1 : 0,
  cs_completion_status: index % 9 === 0 ? 1 : 0,
  fer_status: index % 3 === 0 ? 1 : 0,
  fer_drafter_status: index % 4 === 0 ? 1 : 0,
  fer_drafter_assgn: index % 5 === 0 ? 'Drafter User' : `Drafter ${index % 3 + 1}`,
  fer_drafter_deadline: new Date(2023, (index % 12) + 5, (index % 28) + 1).toISOString(),
  fer_review_draft_status: index % 10 === 0 ? 1 : 0,
  fer_filing_status: index % 5 === 0 ? 1 : 0,
  fer_filer_assgn: index % 5 === 0 ? 'Filer User' : `Filer ${index % 3 + 1}`,
  fer_filer_deadline: new Date(2023, (index % 12) + 6, (index % 28) + 1).toISOString(),
  fer_review_file_status: index % 11 === 0 ? 1 : 0,
  fer_completion_status: index % 12 === 0 ? 1 : 0,
  created_at: new Date(2023, index % 6, (index % 28) + 1).toISOString(),
  updated_at: new Date().toISOString(),
  inventors: [
    {
      id: `inventor-${index}-1`,
      tracking_id: `TRK-${100 + index}`,
      inventor_name: `Inventor ${index + 1}A`,
      inventor_addr: `Address of Inventor ${index + 1}A`
    },
    {
      id: `inventor-${index}-2`,
      tracking_id: `TRK-${100 + index}`,
      inventor_name: `Inventor ${index + 1}B`,
      inventor_addr: `Address of Inventor ${index + 1}B`
    }
  ],
  fer_entries: index % 3 === 0 ? [
    {
      id: `fer-${index}-1`,
      patent_id: `patent-${index + 1}`,
      fer_number: 1,
      fer_date: new Date(2023, index % 6, (index % 28) + 1).toISOString(),
      fer_drafter_assgn: index % 5 === 0 ? 'Drafter User' : `Drafter ${index % 3 + 1}`,
      fer_drafter_deadline: new Date(2023, (index % 12) + 5, (index % 28) + 1).toISOString(),
      fer_drafter_status: index % 4 === 0 ? 1 : 0,
      fer_filer_assgn: index % 5 === 0 ? 'Filer User' : `Filer ${index % 3 + 1}`,
      fer_filer_deadline: new Date(2023, (index % 12) + 6, (index % 28) + 1).toISOString(),
      fer_filing_status: index % 5 === 0 ? 1 : 0,
      fer_review_draft_status: index % 10 === 0 ? 1 : 0,
      fer_review_file_status: index % 11 === 0 ? 1 : 0,
      fer_completion_status: index % 12 === 0 ? 1 : 0,
      created_at: new Date(2023, index % 6, (index % 28) + 1).toISOString(),
      updated_at: new Date().toISOString(),
    }
  ] : [],
  notes: index % 3 === 0 ? `Sample notes for patent ${index + 1}. This can be edited by admins and drafters.` : '',
  payment_status: ['not_sent', 'invoice_sent', 'partially_paid', 'fully_paid'][index % 4],
  payment_amount: (index + 1) * 5000,
  payment_received: index % 4 === 3 ? (index + 1) * 5000 : (index % 4 === 2 ? (index + 1) * 2500 : 0),
  invoice_sent: index % 4 > 0,
  completed: index % 7 === 0,
}));

// Generate mock employees
export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    emp_id: 'ADMIN001',
    full_name: 'Admin User',
    email: 'admin@example.com',
    ph_no: '+91-9000000001',
    password: 'admin123',
    created_at: new Date(2023, 0, 1).toISOString(),
    updated_at: new Date().toISOString(),
    role: 'admin'
  },
  {
    id: 'emp-2',
    emp_id: 'DRAFT001',
    full_name: 'Drafter User',
    email: 'drafter@example.com',
    ph_no: '+91-9000000002',
    password: 'drafter123',
    created_at: new Date(2023, 1, 1).toISOString(),
    updated_at: new Date().toISOString(),
    role: 'drafter'
  },
  {
    id: 'emp-3',
    emp_id: 'FILE001',
    full_name: 'Filer User',
    email: 'filer@example.com',
    ph_no: '+91-9000000003',
    password: 'filer123',
    created_at: new Date(2023, 2, 1).toISOString(),
    updated_at: new Date().toISOString(),
    role: 'filer'
  },
  {
    id: 'emp-4',
    emp_id: 'DRAFT002',
    full_name: 'Drafter 2',
    email: 'drafter2@example.com',
    ph_no: '+91-9000000004',
    password: 'drafter123',
    created_at: new Date(2023, 3, 1).toISOString(),
    updated_at: new Date().toISOString(),
    role: 'drafter'
  },
  {
    id: 'emp-5',
    emp_id: 'FILE002',
    full_name: 'Filer 2',
    email: 'filer2@example.com',
    ph_no: '+91-9000000005',
    password: 'filer123',
    created_at: new Date(2023, 4, 1).toISOString(),
    updated_at: new Date().toISOString(),
    role: 'filer'
  }
];

// Mock timeline data
export const generateMockTimeline = (patentId: string) => {
  return Array(8).fill(null).map((_, index) => ({
    id: `timeline-${patentId}-${index}`,
    patent_id: patentId,
    event_type: [
      'patent_created', 
      'drafter_assigned', 
      'draft_completed', 
      'filer_assigned', 
      'filing_completed', 
      'draft_approved', 
      'filing_approved', 
      'fer_entry_created'
    ][index],
    event_description: [
      'Patent created in the system',
      'Drafter assigned to the patent',
      'Draft completed by drafter',
      'Filer assigned to the patent',
      'Filing completed by filer',
      'Draft approved by admin',
      'Filing approved by admin',
      'New FER entry created'
    ][index],
    created_at: new Date(2023, index, 15).toISOString(),
    status: 1,
    employee_name: index % 2 === 0 ? 'Admin User' : (index % 4 === 1 ? 'Drafter User' : 'Filer User'),
    deadline_date: index % 3 === 0 ? new Date(2023, index + 1, 15).toISOString() : null
  }));
};
