import { Patent } from './types';

// Mock data for patents
const patents: Patent[] = [
  {
    id: '1',
    tracking_id: 'PAT-2023-001',
    patent_applicant: 'Innovatech Inc.',
    client_id: 'CLI-001',
    application_no: 'APP-2023-100',
    date_of_filing: '2023-01-15T00:00:00.000Z',
    patent_title: 'AI-Powered Diagnostic Tool',
    applicant_addr: '123 Tech Street, Innovation City',
    inventor_ph_no: '555-123-4567',
    inventor_email: 'john.doe@example.com',
    ps_drafting_status: 1,
    ps_drafter_assgn: 'Alice Smith',
    ps_drafter_deadline: '2023-03-01T00:00:00.000Z',
    ps_review_draft_status: 1,
    ps_filing_status: 1,
    ps_filer_assgn: 'Bob Johnson',
    ps_filer_deadline: '2023-03-15T00:00:00.000Z',
    ps_review_file_status: 1,
    ps_completion_status: 1,
    cs_drafting_status: 1,
    cs_drafter_assgn: 'Alice Smith',
    cs_drafter_deadline: '2023-04-01T00:00:00.000Z',
    cs_review_draft_status: 1,
    cs_filing_status: 1,
    cs_filer_assgn: 'Bob Johnson',
    cs_filer_deadline: '2023-04-15T00:00:00.000Z',
    form_26: true,
    form_18: true,
    form_18a: false,
    form_9: true,
    form_9a: false,
    form_13: true,
    cs_review_file_status: 1,
    cs_completion_status: 1,
    fer_status: 1,
    fer_drafter_status: 1,
    fer_drafter_assgn: 'Charlie Brown',
    fer_drafter_deadline: '2023-05-01T00:00:00.000Z',
    fer_review_draft_status: 1,
    fer_filing_status: 1,
    fer_filer_assgn: 'David Miller',
    fer_filer_deadline: '2023-05-15T00:00:00.000Z',
    fer_review_file_status: 1,
    fer_completion_status: 1,
    created_at: '2023-01-01T12:00:00.000Z',
    updated_at: '2023-01-01T12:00:00.000Z',
    inventors: [
      {
        id: 'inv-1',
        tracking_id: 'PAT-2023-001',
        inventor_name: 'John Doe',
        inventor_addr: '456 Research Road, Lab City'
      }
    ],
    fer_history: [
      {
        id: 'fer-hist-1',
        tracking_id: 'PAT-2023-001',
        fer_drafter_assgn: 'Charlie Brown',
        fer_drafter_deadline: '2023-05-01T00:00:00.000Z',
        fer_filer_assgn: 'David Miller',
        fer_filer_deadline: '2023-05-15T00:00:00.000Z'
      }
    ]
  },
  {
    id: '2',
    tracking_id: 'PAT-2023-002',
    patent_applicant: 'MediCorp Solutions',
    client_id: 'CLI-002',
    application_no: 'APP-2023-101',
    date_of_filing: '2023-02-01T00:00:00.000Z',
    patent_title: 'Smart Health Monitoring System',
    applicant_addr: '789 Biotech Avenue, Healthville',
    inventor_ph_no: '555-987-6543',
    inventor_email: 'jane.smith@example.com',
    ps_drafting_status: 1,
    ps_drafter_assgn: 'Eve White',
    ps_drafter_deadline: '2023-04-01T00:00:00.000Z',
    ps_review_draft_status: 0,
    ps_filing_status: 0,
    ps_filer_assgn: 'Bob Johnson',
    ps_filer_deadline: '2023-04-15T00:00:00.000Z',
    ps_review_file_status: 0,
    ps_completion_status: 0,
    cs_drafting_status: 0,
    cs_drafter_assgn: 'Eve White',
    cs_drafter_deadline: '2023-05-01T00:00:00.000Z',
    cs_review_draft_status: 0,
    cs_filing_status: 0,
    cs_filer_assgn: 'Bob Johnson',
    cs_filer_deadline: '2023-05-15T00:00:00.000Z',
    form_26: false,
    form_18: false,
    form_18a: false,
    form_9: false,
    form_9a: false,
    form_13: false,
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    fer_drafter_status: 0,
    fer_drafter_assgn: 'Charlie Brown',
    fer_drafter_deadline: '2023-06-01T00:00:00.000Z',
    fer_review_draft_status: 0,
    fer_filing_status: 0,
    fer_filer_assgn: 'David Miller',
    fer_filer_deadline: '2023-06-15T00:00:00.000Z',
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: '2023-02-01T12:00:00.000Z',
    updated_at: '2023-02-01T12:00:00.000Z',
    inventors: [
      {
        id: 'inv-2',
        tracking_id: 'PAT-2023-002',
        inventor_name: 'Jane Smith',
        inventor_addr: '987 Research Blvd, Innovation Park'
      }
    ],
    fer_history: []
  },
  {
    id: '3',
    tracking_id: 'PAT-2023-003',
    patent_applicant: 'GlobalTech Solutions',
    client_id: 'CLI-003',
    application_no: 'APP-2023-102',
    date_of_filing: '2023-03-01T00:00:00.000Z',
    patent_title: 'Advanced Data Analytics Platform',
    applicant_addr: '321 Data Drive, Analytics City',
    inventor_ph_no: '555-246-8013',
    inventor_email: 'peter.jones@example.com',
    ps_drafting_status: 0,
    ps_drafter_assgn: 'Alice Smith',
    ps_drafter_deadline: '2023-05-01T00:00:00.000Z',
    ps_review_draft_status: 0,
    ps_filing_status: 0,
    ps_filer_assgn: 'Bob Johnson',
    ps_filer_deadline: '2023-05-15T00:00:00.000Z',
    ps_review_file_status: 0,
    ps_completion_status: 0,
    cs_drafting_status: 0,
    cs_drafter_assgn: 'Eve White',
    cs_drafter_deadline: '2023-06-01T00:00:00.000Z',
    cs_review_draft_status: 0,
    cs_filing_status: 0,
    cs_filer_assgn: 'Bob Johnson',
    cs_filer_deadline: '2023-06-15T00:00:00.000Z',
    form_26: false,
    form_18: false,
    form_18a: false,
    form_9: false,
    form_9a: false,
    form_13: false,
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    fer_drafter_status: 0,
    fer_drafter_assgn: 'Charlie Brown',
    fer_drafter_deadline: '2023-07-01T00:00:00.000Z',
    fer_review_draft_status: 0,
    fer_filing_status: 0,
    fer_filer_assgn: 'David Miller',
    fer_filer_deadline: '2023-07-15T00:00:00.000Z',
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: '2023-03-01T12:00:00.000Z',
    updated_at: '2023-03-01T12:00:00.000Z',
    inventors: [
      {
        id: 'inv-3',
        tracking_id: 'PAT-2023-003',
        inventor_name: 'Peter Jones',
        inventor_addr: '654 Algorithm Avenue, Codeville'
      }
    ],
    fer_history: []
  }
];

// Mock data for employees
const employees = [
  {
    id: 'emp-1',
    emp_id: 'E001',
    full_name: 'Alice Smith',
    email: 'alice.smith@example.com',
    ph_no: '555-111-2222',
    password: 'password123',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    role: 'drafter'
  },
  {
    id: 'emp-2',
    emp_id: 'E002',
    full_name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    ph_no: '555-333-4444',
    password: 'password456',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    role: 'filer'
  },
  {
    id: 'emp-3',
    emp_id: 'E003',
    full_name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    ph_no: '555-555-6666',
    password: 'password789',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    role: 'drafter'
  },
  {
    id: 'emp-4',
    emp_id: 'E004',
    full_name: 'David Miller',
    email: 'david.miller@example.com',
    ph_no: '555-777-8888',
    password: 'passwordabc',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    role: 'filer'
  },
  {
    id: 'emp-5',
    emp_id: 'E005',
    full_name: 'Eve White',
    email: 'eve.white@example.com',
    ph_no: '555-999-0000',
    password: 'passworddef',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    role: 'drafter'
  },
  {
    id: 'emp-6',
    emp_id: 'E006',
    full_name: 'Admin User',
    email: 'admin@example.com',
    ph_no: '555-123-0000',
    password: 'adminpassword',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    role: 'admin'
  }
];

// Add notes field to some patents for testing
const patchedPatents = patents.map((patent, index) => {
  if (index === 0) {
    return {
      ...patent,
      notes: "Important patent for our key client. Check the reference document at https://example.com/reference"
    };
  }
  if (index === 1) {
    return {
      ...patent,
      notes: "Client requested expedited processing. Follow up meeting scheduled for next week."
    };
  }
  return patent;
});

export const fetchPatents = (): Promise<Patent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(patchedPatents);
    }, 500);
  });
};

export const fetchPatentById = (id: string): Promise<Patent | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const patent = patchedPatents.find(patent => patent.id === id);
      resolve(patent);
    }, 300);
  });
};

export const fetchEmployees = (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(employees);
    }, 300);
  });
};

export const fetchDrafterAssignments = (drafterName: string): Promise<Patent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assignments = patchedPatents.filter(
        patent => patent.ps_drafter_assgn === drafterName || patent.cs_drafter_assgn === drafterName || patent.fer_drafter_assgn === drafterName
      );
      resolve(assignments);
    }, 300);
  });
};

export const fetchFilerAssignments = (filerName: string): Promise<Patent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assignments = patchedPatents.filter(
        patent => patent.ps_filer_assgn === filerName || patent.cs_filer_assgn === filerName || patent.fer_filer_assgn === filerName
      );
      resolve(assignments);
    }, 300);
  });
};

export const fetchPendingReviews = (): Promise<Patent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pendingReviews = patchedPatents.filter(patent =>
        patent.ps_review_draft_status === 0 ||
        patent.ps_review_file_status === 0 ||
        patent.cs_review_draft_status === 0 ||
        patent.cs_review_file_status === 0 ||
        patent.fer_review_draft_status === 0 ||
        patent.fer_review_file_status === 0
      );
      resolve(pendingReviews);
    }, 300);
  });
};

export const approvePatentReview = (patent: Patent, reviewType: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate approval process
      console.log(`Patent ${patent.id} review type ${reviewType} approved`);
      resolve(true);
    }, 500);
  });
};

export const createPatent = (patentData: Omit<Patent, 'id' | 'created_at' | 'updated_at'>): Promise<Patent> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPatent: Patent = {
        id: Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...patentData
      };
      patchedPatents.push(newPatent);
      resolve(newPatent);
    }, 500);
  });
};

export const updatePatent = (id: string, patentData: Omit<Patent, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = patchedPatents.findIndex(patent => patent.id === id);
      if (index !== -1) {
        patchedPatents[index] = { ...patchedPatents[index], ...patentData, updated_at: new Date().toISOString() };
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
};

export const createInventor = (inventorData: { tracking_id: string; inventor_name: string; inventor_addr: string }): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const patent = patchedPatents.find(patent => patent.tracking_id === inventorData.tracking_id);
      if (patent) {
        const newInventor = {
          id: Math.random().toString(36).substring(2, 15),
          ...inventorData
        };
        patent.inventors = [...(patent.inventors || []), newInventor];
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
};
