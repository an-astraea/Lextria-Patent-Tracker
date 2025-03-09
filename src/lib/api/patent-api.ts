
import { Patent, FEREntry, TimelineEvent } from '@/lib/types';

// Make sure this file has these exports
export const fetchPatentTimeline = async (patentId: string | undefined): Promise<TimelineEvent[]> => {
  // This would fetch timeline data from a real API
  // For now, return mock data
  return [
    {
      id: '1',
      patent_id: patentId || '',
      event_type: 'Patent Created',
      event_description: 'Patent application was created in the system',
      created_at: new Date().toISOString(),
      status: 1,
      employee_name: 'Admin User'
    },
    {
      id: '2',
      patent_id: patentId || '',
      event_type: 'Drafting Started',
      event_description: 'Patent specification drafting was started',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 1,
      employee_name: 'Drafter User',
      deadline_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

export const fetchFEREntries = async (patentId: string): Promise<FEREntry[]> => {
  // Mock implementation - would call real API in production
  return [
    {
      id: '1',
      patent_id: patentId,
      fer_number: 1,
      fer_date: new Date().toISOString(),
      fer_drafter_assgn: 'John Doe',
      fer_drafter_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      fer_drafter_status: 0,
      fer_filer_assgn: 'Jane Smith',
      fer_filer_deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      fer_filing_status: 0,
      fer_review_draft_status: 0,
      fer_review_file_status: 0,
      fer_completion_status: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

export const createFEREntry = async (patentId: string, ferNumber: number): Promise<FEREntry> => {
  // Mock implementation - would call real API in production
  return {
    id: `fer-${Date.now()}`,
    patent_id: patentId,
    fer_number: ferNumber,
    fer_date: new Date().toISOString(),
    fer_drafter_assgn: '',
    fer_drafter_deadline: '',
    fer_drafter_status: 0,
    fer_filer_assgn: '',
    fer_filer_deadline: '',
    fer_filing_status: 0,
    fer_review_draft_status: 0,
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const updateFEREntry = async (ferId: string, data: Partial<FEREntry>): Promise<FEREntry> => {
  // Mock implementation - would call real API in production
  return {
    id: ferId,
    patent_id: data.patent_id || '',
    fer_number: data.fer_number || 1,
    fer_date: data.fer_date || new Date().toISOString(),
    fer_drafter_assgn: data.fer_drafter_assgn || '',
    fer_drafter_deadline: data.fer_drafter_deadline || '',
    fer_drafter_status: data.fer_drafter_status || 0,
    fer_filer_assgn: data.fer_filer_assgn || '',
    fer_filer_deadline: data.fer_filer_deadline || '',
    fer_filing_status: data.fer_filing_status || 0,
    fer_review_draft_status: data.fer_review_draft_status || 0,
    fer_review_file_status: data.fer_review_file_status || 0,
    fer_completion_status: data.fer_completion_status || 0,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};
