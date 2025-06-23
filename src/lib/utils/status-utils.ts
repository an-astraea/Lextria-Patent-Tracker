
import { Patent } from '@/lib/types';

export type PatentStatus = 
  | 'idf_sent'
  | 'idf_received'
  | 'ps_drafting'
  | 'ps_drafting_approval'
  | 'ps_filing'
  | 'ps_filing_approval'
  | 'ps_completed'
  | 'cs_data_sent'
  | 'cs_data_received'
  | 'cs_drafting'
  | 'cs_drafting_approval'
  | 'cs_filing'
  | 'cs_filing_approval'
  | 'cs_completed'
  | 'completed'
  | 'withdrawn';

export const STATUS_LABELS: Record<PatentStatus, string> = {
  'idf_sent': 'Patent waiting for IDF to be received',
  'idf_received': 'IDF received, ready for PS drafting',
  'ps_drafting': 'PS being drafted',
  'ps_drafting_approval': 'PS draft pending review/approval',
  'ps_filing': 'PS being filed',
  'ps_filing_approval': 'PS filing pending review/approval',
  'ps_completed': 'PS section fully completed',
  'cs_data_sent': 'CS data sent to client',
  'cs_data_received': 'CS data received from client',
  'cs_drafting': 'CS being drafted',
  'cs_drafting_approval': 'CS draft pending review/approval',
  'cs_filing': 'CS being filed',
  'cs_filing_approval': 'CS filing pending review/approval',
  'cs_completed': 'CS section fully completed',
  'completed': 'Patent process completed',
  'withdrawn': 'Patent withdrawn'
};

export const STATUS_COLORS: Record<PatentStatus, string> = {
  'idf_sent': 'bg-gray-100',
  'idf_received': 'bg-blue-50',
  'ps_drafting': 'bg-blue-100',
  'ps_drafting_approval': 'bg-blue-150',
  'ps_filing': 'bg-blue-200',
  'ps_filing_approval': 'bg-blue-250',
  'ps_completed': 'bg-blue-300',
  'cs_data_sent': 'bg-indigo-50',
  'cs_data_received': 'bg-indigo-100',
  'cs_drafting': 'bg-indigo-150',
  'cs_drafting_approval': 'bg-indigo-200',
  'cs_filing': 'bg-indigo-250',
  'cs_filing_approval': 'bg-indigo-300',
  'cs_completed': 'bg-indigo-350',
  'completed': 'bg-green-100',
  'withdrawn': 'bg-red-100'
};

/**
 * Determines the current status of a patent based on its fields
 * Using priority-based logic to ensure each patent has exactly one status
 */
export function determinePatentStatus(patent: Patent): PatentStatus {
  // Highest priority: Terminal states
  if (patent.withdrawn) return 'withdrawn';
  if (patent.completed) return 'completed';
  
  // CS section completion
  if (patent.cs_completion_status === 1) return 'cs_completed';
  
  // CS filing approval pending
  if (patent.cs_filing_status === 1 && patent.cs_review_file_status === 1) {
    return 'cs_filing_approval';
  }
  
  // CS filing in progress
  if (patent.cs_filing_status === 1) return 'cs_filing';
  
  // CS drafting approval pending
  if (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 1) {
    return 'cs_drafting_approval';
  }
  
  // CS drafting in progress
  if (patent.cs_drafting_status === 1) return 'cs_drafting';
  
  // CS data received from client
  if (patent.cs_data_received) return 'cs_data_received';
  
  // CS data sent to client
  if (patent.cs_data) return 'cs_data_sent';
  
  // PS section completion
  if (patent.ps_completion_status === 1) return 'ps_completed';
  
  // PS filing approval pending
  if (patent.ps_filing_status === 1 && patent.ps_review_file_status === 1) {
    return 'ps_filing_approval';
  }
  
  // PS filing in progress
  if (patent.ps_filing_status === 1) return 'ps_filing';
  
  // PS drafting approval pending
  if (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 1) {
    return 'ps_drafting_approval';
  }
  
  // PS drafting in progress
  if (patent.ps_drafting_status === 1) return 'ps_drafting';
  
  // IDF received, ready for PS drafting
  if (patent.idf_received) return 'idf_received';
  
  // Default: IDF sent, waiting for IDF to be received
  return 'idf_sent';
}

/**
 * Get count of patents for each status
 */
export function getStatusCounts(patents: Patent[]): Record<PatentStatus, number> {
  const counts: Record<PatentStatus, number> = {
    'idf_sent': 0,
    'idf_received': 0,
    'ps_drafting': 0,
    'ps_drafting_approval': 0,
    'ps_filing': 0,
    'ps_filing_approval': 0,
    'ps_completed': 0,
    'cs_data_sent': 0,
    'cs_data_received': 0,
    'cs_drafting': 0,
    'cs_drafting_approval': 0,
    'cs_filing': 0,
    'cs_filing_approval': 0,
    'cs_completed': 0,
    'completed': 0,
    'withdrawn': 0
  };

  patents.forEach(patent => {
    const status = determinePatentStatus(patent);
    counts[status]++;
  });

  return counts;
}

/**
 * Get summary statistics for completion tracking
 */
export function getCompletionStats(patents: Patent[]) {
  const statusCounts = getStatusCounts(patents);
  
  return {
    total: patents.length,
    completed: statusCounts.completed,
    withdrawn: statusCounts.withdrawn,
    inProgress: patents.length - statusCounts.completed - statusCounts.withdrawn,
    pendingApproval: statusCounts.ps_drafting_approval + 
                     statusCounts.ps_filing_approval + 
                     statusCounts.cs_drafting_approval + 
                     statusCounts.cs_filing_approval
  };
}

/**
 * Get section-wise statistics (PS, CS, overall)
 */
export function getSectionStats(patents: Patent[]) {
  const statusCounts = getStatusCounts(patents);
  
  return {
    ps: {
      drafting: statusCounts.ps_drafting,
      draftingApproval: statusCounts.ps_drafting_approval,
      filing: statusCounts.ps_filing,
      filingApproval: statusCounts.ps_filing_approval,
      completed: statusCounts.ps_completed +
                statusCounts.cs_data_sent +
                statusCounts.cs_data_received +
                statusCounts.cs_drafting +
                statusCounts.cs_drafting_approval +
                statusCounts.cs_filing +
                statusCounts.cs_filing_approval +
                statusCounts.cs_completed +
                statusCounts.completed
    },
    cs: {
      dataSent: statusCounts.cs_data_sent,
      dataReceived: statusCounts.cs_data_received,
      drafting: statusCounts.cs_drafting,
      draftingApproval: statusCounts.cs_drafting_approval,
      filing: statusCounts.cs_filing,
      filingApproval: statusCounts.cs_filing_approval,
      completed: statusCounts.cs_completed + statusCounts.completed
    },
    overall: {
      completed: statusCounts.completed,
      withdrawn: statusCounts.withdrawn,
      active: patents.length - statusCounts.completed - statusCounts.withdrawn
    }
  };
}
