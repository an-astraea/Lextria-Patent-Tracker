import { Employee, FERHistory, Inventor, Patent } from './types';

export const MOCK_PATENTS: Patent[] = [
  {
    id: "1",
    tracking_id: "PTR-001",
    patent_applicant: "TechInnovate Solutions",
    client_id: "CLT-001",
    application_no: "APP12345",
    date_of_filing: "2023-01-15",
    patent_title: "Advanced Machine Learning System for Predictive Analysis",
    applicant_addr: "123 Tech Park, Silicon Valley, CA 94088",
    inventor_ph_no: "+1-234-567-8901",
    inventor_email: "inventor@techinnovate.com",
    ps_drafting_status: 1,
    ps_drafter_assgn: "John Smith",
    ps_drafter_deadline: "2022-12-01",
    ps_review_draft_status: 0,
    ps_filing_status: 1,
    ps_filer_assgn: "Jane Doe",
    ps_filer_deadline: "2022-12-15",
    ps_review_file_status: 0,
    ps_completion_status: 1,
    cs_drafting_status: 1,
    cs_drafter_assgn: "John Smith",
    cs_drafter_deadline: "2023-02-15",
    cs_review_draft_status: 0,
    cs_filing_status: 1,
    cs_filer_assgn: "Jane Doe",
    cs_filer_deadline: "2023-03-01",
    form_01: true,
    form_02_ps: true,
    form_02_cs: true,
    form_03: true,
    form_04: false,
    form_05: true,
    form_06: false,
    form_07: false,
    form_07a: false,
    form_08: false,
    form_08a: false,
    form_09: true,
    form_09a: false,
    form_10: false,
    form_11: false,
    form_12: false,
    form_13: true,
    form_14: false,
    form_15: false,
    form_16: false,
    form_17: false,
    form_18: true,
    form_18a: false,
    form_19: false,
    form_20: false,
    form_21: false,
    form_22: false,
    form_23: false,
    form_24: false,
    form_25: false,
    form_26: true,
    form_27: false,
    form_28: false,
    form_29: false,
    form_30: false,
    form_31: false,
    other_forms: null,
    cs_review_file_status: 0,
    cs_completion_status: 1,
    fer_status: 1,
    fer_drafter_status: 1,
    fer_drafter_assgn: "John Smith",
    fer_drafter_deadline: "2023-06-15",
    fer_review_draft_status: 0,
    fer_filing_status: 1,
    fer_filer_assgn: "Jane Doe",
    fer_filer_deadline: "2023-07-01",
    fer_review_file_status: 0,
    fer_completion_status: 1,
    created_at: "2022-11-15T08:00:00Z",
    updated_at: "2023-07-15T10:30:00Z",
    inventors: [
      {
        id: "1",
        tracking_id: "PTR-001",
        inventor_name: "Dr. Robert Chen",
        inventor_addr: "456 Research Ave, Palo Alto, CA 94301"
      },
      {
        id: "2",
        tracking_id: "PTR-001",
        inventor_name: "Dr. Sarah Johnson",
        inventor_addr: "789 Innovation Blvd, Mountain View, CA 94043"
      }
    ],
    fer_history: []
  },
  {
    id: "2",
    tracking_id: "PTR-002",
    patent_applicant: "BioGenetics Ltd",
    client_id: "CLT-002",
    application_no: null,
    date_of_filing: "2023-03-10",
    patent_title: "Novel Gene Editing Technique for Crop Enhancement",
    applicant_addr: "45 Life Sciences Park, Boston, MA 02115",
    inventor_ph_no: "+1-617-555-1234",
    inventor_email: "research@biogenetics.com",
    ps_drafting_status: 1,
    ps_drafter_assgn: "John Smith",
    ps_drafter_deadline: "2023-02-01",
    ps_review_draft_status: 0,
    ps_filing_status: 1,
    ps_filer_assgn: "Jane Doe",
    ps_filer_deadline: "2023-02-20",
    ps_review_file_status: 0,
    ps_completion_status: 1,
    cs_drafting_status: 1,
    cs_drafter_assgn: "John Smith",
    cs_drafter_deadline: "2023-05-15",
    cs_review_draft_status: 1,
    cs_filing_status: 0,
    cs_filer_assgn: "Jane Doe",
    cs_filer_deadline: "2023-06-01",
    form_01: true,
    form_02_ps: true,
    form_02_cs: false,
    form_03: true,
    form_04: false,
    form_05: true,
    form_06: false,
    form_07: false,
    form_07a: false,
    form_08: false,
    form_08a: false,
    form_09: true,
    form_09a: false,
    form_10: false,
    form_11: false,
    form_12: false,
    form_13: false,
    form_14: false,
    form_15: false,
    form_16: false,
    form_17: false,
    form_18: true,
    form_18a: false,
    form_19: false,
    form_20: false,
    form_21: false,
    form_22: false,
    form_23: false,
    form_24: false,
    form_25: false,
    form_26: true,
    form_27: false,
    form_28: false,
    form_29: false,
    form_30: false,
    form_31: false,
    other_forms: null,
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    fer_drafter_status: 0,
    fer_drafter_assgn: "",
    fer_drafter_deadline: "",
    fer_review_draft_status: 0,
    fer_filing_status: 0,
    fer_filer_assgn: "",
    fer_filer_deadline: "",
    fer_review_file_status: 0,
    fer_completion_status: 0,
    created_at: "2023-01-20T09:15:00Z",
    updated_at: "2023-05-25T14:45:00Z",
    inventors: [
      {
        id: "3",
        tracking_id: "PTR-002",
        inventor_name: "Dr. Michael Lee",
        inventor_addr: "15 Research Drive, Cambridge, MA 02142"
      }
    ],
    fer_history: []
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    emp_id: "E001",
    full_name: "Alice Smith",
    email: "alice.smith@example.com",
    ph_no: "555-111-2222",
    password: "password123",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    role: "drafter"
  },
  {
    id: "emp-2",
    emp_id: "E002",
    full_name: "Bob Johnson",
    email: "bob.johnson@example.com",
    ph_no: "555-333-4444",
    password: "password456",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    role: "filer"
  },
  {
    id: "emp-3",
    emp_id: "E003",
    full_name: "Charlie Brown",
    email: "charlie.brown@example.com",
    ph_no: "555-555-6666",
    password: "password789",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    role: "drafter"
  },
  {
    id: "emp-4",
    emp_id: "E004",
    full_name: "David Miller",
    email: "david.miller@example.com",
    ph_no: "555-777-8888",
    password: "passwordabc",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    role: "filer"
  },
  {
    id: "emp-5",
    emp_id: "E005",
    full_name: "Eve White",
    email: "eve.white@example.com",
    ph_no: "555-999-0000",
    password: "passworddef",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    role: "drafter"
  },
  {
    id: "emp-6",
    emp_id: "E006",
    full_name: "Admin User",
    email: "admin@example.com",
    ph_no: "555-123-0000",
    password: "adminpassword",
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    role: "admin"
  }
];

export const MOCK_FER_HISTORY: FERHistory[] = [
  {
    id: "fer-hist-1",
    tracking_id: "PTR-001",
    fer_drafter_assgn: "John Smith",
    fer_drafter_deadline: "2023-06-15",
    fer_filer_assgn: "Jane Doe",
    fer_filer_deadline: "2023-07-01"
  },
  {
    id: "fer-hist-2",
    tracking_id: "PTR-002",
    fer_drafter_assgn: "",
    fer_drafter_deadline: "",
    fer_filer_assgn: "",
    fer_filer_deadline: ""
  }
];

export const MOCK_INVENTORS: Inventor[] = [
  {
    id: "inv-1",
    tracking_id: "PTR-001",
    inventor_name: "Dr. Robert Chen",
    inventor_addr: "456 Research Ave, Palo Alto, CA 94301"
  },
  {
    id: "inv-2",
    tracking_id: "PTR-001",
    inventor_name: "Dr. Sarah Johnson",
    inventor_addr: "789 Innovation Blvd, Mountain View, CA 94043"
  },
  {
    id: "inv-3",
    tracking_id: "PTR-002",
    inventor_name: "Dr. Michael Lee",
    inventor_addr: "15 Research Drive, Cambridge, MA 02142"
  }
];

export const fetchPatents = (): Promise<Patent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_PATENTS);
    }, 500);
  });
};

export const fetchPatentById = (id: string): Promise<Patent | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const patent = MOCK_PATENTS.find(patent => patent.id === id);
      resolve(patent);
    }, 300);
  });
};

export const fetchEmployees = (): Promise<Employee[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_EMPLOYEES);
    }, 300);
  });
};

export const fetchDrafterAssignments = (drafterName: string): Promise<Patent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assignments = MOCK_PATENTS.filter(
        patent => patent.ps_drafter_assgn === drafterName || patent.cs_drafter_assgn === drafterName || patent.fer_drafter_assgn === drafterName
      );
      resolve(assignments);
    }, 300);
  });
};

export const fetchFilerAssignments = (filerName: string): Promise<Patent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assignments = MOCK_PATENTS.filter(
        patent => patent.ps_filer_assgn === filerName || patent.cs_filer_assgn === filerName || patent.fer_filer_assgn === filerName
      );
      resolve(assignments);
    }, 300);
  });
};

export const fetchPendingReviews = (): Promise<Patent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pendingReviews = MOCK_PATENTS.filter(patent =>
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
      MOCK_PATENTS.push(newPatent);
      resolve(newPatent);
    }, 500);
  });
};

export const updatePatent = (id: string, patentData: Omit<Patent, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = MOCK_PATENTS.findIndex(patent => patent.id === id);
      if (index !== -1) {
        MOCK_PATENTS[index] = { ...MOCK_PATENTS[index], ...patentData, updated_at: new Date().toISOString() };
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
      const patent = MOCK_PATENTS.find(patent => patent.tracking_id === inventorData.tracking_id);
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

export const completeFilerTask = (patent: Patent, filerName: string, formData?: Record<string, boolean>): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find the patent in our mock data
      const index = MOCK_PATENTS.findIndex(p => p.id === patent.id);
      if (index !== -1) {
        // Update the filing status based on who is assigned
        if (patent.ps_filer_assgn === filerName) {
          MOCK_PATENTS[index].ps_filing_status = 1;
          MOCK_PATENTS[index].ps_review_file_status = 1;
        } else if (patent.cs_filer_assgn === filerName) {
          MOCK_PATENTS[index].cs_filing_status = 1;
          MOCK_PATENTS[index].cs_review_file_status = 1;
          
          // Update form data if provided (for CS filing)
          if (formData) {
            Object.keys(formData).forEach(formKey => {
              (MOCK_PATENTS[index] as any)[formKey] = formData[formKey];
            });
          }
        } else if (patent.fer_filer_assgn === filerName) {
          MOCK_PATENTS[index].fer_filing_status = 1;
          MOCK_PATENTS[index].fer_review_file_status = 1;
        }
        
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
};
