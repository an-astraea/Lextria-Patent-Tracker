
import { Patent, Employee, FEREntry, TimelineEntry, PatentFilters, Inventor } from './types';
import { MOCK_PATENTS, MOCK_EMPLOYEES, MOCK_TIMELINE } from './data';
import { toast } from 'sonner';

// Create a deep copy of patents to avoid mutation issues
let patents = JSON.parse(JSON.stringify(MOCK_PATENTS));
let employees = JSON.parse(JSON.stringify(MOCK_EMPLOYEES));
let timeline = JSON.parse(JSON.stringify(MOCK_TIMELINE));

// Helper function to generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Functions for auth
export const login = async (email: string, password: string) => {
  await delay(800);
  const employee = employees.find(emp => emp.email === email);
  
  if (!employee) {
    return { error: 'Employee not found', employee: null };
  }
  
  if (password !== 'password') {  // Simple password check for demo
    return { error: 'Invalid credentials', employee: null };
  }
  
  return { employee, error: null };
};

// API Functions for patents
export const fetchPatents = async (filters?: PatentFilters) => {
  await delay(500);
  
  let filteredPatents = [...patents];
  
  if (filters) {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredPatents = filteredPatents.filter(patent => 
        patent.tracking_id?.toLowerCase().includes(searchLower) ||
        patent.patent_title?.toLowerCase().includes(searchLower) ||
        patent.patent_applicant?.toLowerCase().includes(searchLower) ||
        patent.client_id?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.status) {
      if (filters.status === 'completed') {
        filteredPatents = filteredPatents.filter(patent => patent.cs_completion_status === 1);
      } else if (filters.status === 'pending') {
        filteredPatents = filteredPatents.filter(patent => patent.cs_completion_status !== 1);
      } else if (filters.status === 'ps_completed') {
        filteredPatents = filteredPatents.filter(patent => patent.ps_completion_status === 1);
      } else if (filters.status === 'cs_completed') {
        filteredPatents = filteredPatents.filter(patent => patent.cs_completion_status === 1);
      }
    }
  }
  
  return { patents: filteredPatents, error: null };
};

export const fetchPatentById = async (id: string) => {
  await delay(300);
  const patent = patents.find(p => p.id === id);
  
  if (!patent) {
    return { error: 'Patent not found', patent: null };
  }
  
  return { patent, error: null };
};

export const createPatent = async (patentData: Partial<Patent>) => {
  await delay(800);
  
  try {
    const newPatent: Patent = {
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tracking_id: patentData.tracking_id || '',
      patent_applicant: patentData.patent_applicant || '',
      client_id: patentData.client_id || '',
      application_no: patentData.application_no || '',
      date_of_filing: patentData.date_of_filing || '',
      patent_title: patentData.patent_title || '',
      applicant_addr: patentData.applicant_addr || '',
      inventor_ph_no: patentData.inventor_ph_no || '',
      inventor_email: patentData.inventor_email || '',
      ps_drafting_status: 0,
      ps_drafter_assgn: patentData.ps_drafter_assgn || '',
      ps_drafter_deadline: patentData.ps_drafter_deadline || '',
      ps_review_draft_status: 0,
      ps_filing_status: 0,
      ps_filer_assgn: patentData.ps_filer_assgn || '',
      ps_filer_deadline: patentData.ps_filer_deadline || '',
      ps_review_file_status: 0,
      ps_completion_status: 0,
      cs_drafting_status: 0,
      cs_drafter_assgn: patentData.cs_drafter_assgn || '',
      cs_drafter_deadline: patentData.cs_drafter_deadline || '',
      cs_review_draft_status: 0,
      cs_filing_status: 0,
      cs_filer_assgn: patentData.cs_filer_assgn || '',
      cs_filer_deadline: patentData.cs_filer_deadline || '',
      form_02_ps: false,
      form_02_cs: false,
      form_01: false,
      form_03: false,
      form_04: false,
      form_05: false,
      form_06: false,
      form_07: false,
      form_07a: false,
      form_08: false,
      form_08a: false,
      form_09: false,
      form_09a: false,
      form_10: false,
      form_11: false,
      form_12: false,
      form_13: false,
      form_14: false,
      form_15: false,
      form_16: false,
      form_17: false,
      form_18: false,
      form_18a: false,
      form_19: false,
      form_20: false,
      form_21: false,
      form_22: false,
      form_23: false,
      form_24: false,
      form_25: false,
      form_26: false,
      form_27: false,
      form_28: false,
      form_29: false,
      form_30: false,
      form_31: false,
      cs_review_file_status: 0,
      cs_completion_status: 0,
      fer_status: patentData.fer_status || 0,
      fer_drafter_status: 0,
      fer_drafter_assgn: patentData.fer_drafter_assgn || '',
      fer_drafter_deadline: patentData.fer_drafter_deadline || '',
      fer_review_draft_status: 0,
      fer_filing_status: 0,
      fer_filer_assgn: patentData.fer_filer_assgn || '',
      fer_filer_deadline: patentData.fer_filer_deadline || '',
      fer_review_file_status: 0,
      fer_completion_status: 0,
      notes: '',
      payment_status: 0,
      payment_amount: 0,
      payment_received: 0,
      inventors: [],
      fer_entries: [],
    };
    
    // Add inventors if provided
    if (patentData.inventors && patentData.inventors.length > 0) {
      newPatent.inventors = patentData.inventors.map((inventor, index) => ({
        id: generateId(),
        tracking_id: newPatent.tracking_id,
        inventor_name: inventor.inventor_name || '',
        inventor_addr: inventor.inventor_addr || '',
      }));
    }
    
    // Add FER entries if provided
    if (patentData.fer_entries && patentData.fer_entries.length > 0) {
      newPatent.fer_entries = patentData.fer_entries.map(entry => ({
        ...entry,
        id: generateId(),
        patent_id: newPatent.id,
      }));
    }
    
    patents.push(newPatent);
    
    return { success: true, patent: newPatent, error: null };
  } catch (error) {
    console.error('Error creating patent:', error);
    return { success: false, patent: null, error: 'Failed to create patent' };
  }
};

export const updatePatent = async (id: string, patentData: Partial<Patent>) => {
  await delay(800);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === id);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    // Update patent fields
    const updatedPatent = {
      ...patents[patentIndex],
      ...patentData,
      updated_at: new Date().toISOString()
    };
    
    // Handle form updates if included
    // Convert form names to match the database format
    if (patentData.form_09) {
      updatedPatent.form_09 = patentData.form_09;
    }
    if (patentData.form_09a) {
      updatedPatent.form_09a = patentData.form_09a;
    }
    
    // Update patent in the array
    patents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error('Error updating patent:', error);
    return { success: false, error: 'Failed to update patent' };
  }
};

export const deletePatent = async (id: string) => {
  await delay(500);
  
  const patentIndex = patents.findIndex(p => p.id === id);
  
  if (patentIndex === -1) {
    return { success: false, error: 'Patent not found' };
  }
  
  patents.splice(patentIndex, 1);
  
  return { success: true, error: null };
};

// API Functions for employees
export const fetchEmployees = async () => {
  await delay(300);
  return { employees, error: null };
};

export const fetchEmployeeById = async (id: string) => {
  await delay(200);
  const employee = employees.find(e => e.id === id);
  
  if (!employee) {
    return { error: 'Employee not found', employee: null };
  }
  
  return { employee, error: null };
};

export const createEmployee = async (employeeData: Partial<Employee>) => {
  await delay(800);
  
  try {
    const newEmployee: Employee = {
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      emp_id: employeeData.emp_id || '',
      full_name: employeeData.full_name || '',
      email: employeeData.email || '',
      ph_no: employeeData.ph_no || '',
      password: 'password', // Default password for demo
      role: employeeData.role || 'employee',
    };
    
    employees.push(newEmployee);
    
    return { success: true, employee: newEmployee, error: null };
  } catch (error) {
    console.error('Error creating employee:', error);
    return { success: false, employee: null, error: 'Failed to create employee' };
  }
};

export const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
  await delay(800);
  
  try {
    const employeeIndex = employees.findIndex(e => e.id === id);
    
    if (employeeIndex === -1) {
      return { success: false, error: 'Employee not found' };
    }
    
    // Update employee fields
    const updatedEmployee = {
      ...employees[employeeIndex],
      ...employeeData,
      updated_at: new Date().toISOString()
    };
    
    // Update employee in the array
    employees[employeeIndex] = updatedEmployee;
    
    return { success: true, employee: updatedEmployee, error: null };
  } catch (error) {
    console.error('Error updating employee:', error);
    return { success: false, error: 'Failed to update employee' };
  }
};

export const deleteEmployee = async (id: string) => {
  await delay(500);
  
  const employeeIndex = employees.findIndex(e => e.id === id);
  
  if (employeeIndex === -1) {
    return { success: false, error: 'Employee not found' };
  }
  
  employees.splice(employeeIndex, 1);
  
  return { success: true, error: null };
};

// Timeline-related functions
export const fetchPatentTimeline = async (patentId: string) => {
  await delay(300);
  
  const patentTimeline = timeline.filter(entry => entry.patent_id === patentId);
  
  return { timeline: patentTimeline, error: null };
};

// Patent workflow functions
export const updatePatentStatus = async (patentId: string, statusType: string, value: number | boolean) => {
  await delay(500);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    // Ensure value is a number
    const numericValue = typeof value === 'boolean' ? (value ? 1 : 0) : value;
    
    // Update status field
    const updatedPatent = {
      ...patents[patentIndex],
      [statusType]: numericValue,
      updated_at: new Date().toISOString()
    };
    
    // Update patent in the array
    patents[patentIndex] = updatedPatent;
    
    // Add timeline entry
    const newTimelineEntry: TimelineEntry = {
      id: generateId(),
      patent_id: patentId,
      action: `${statusType} updated to ${numericValue}`,
      created_at: new Date().toISOString(),
      user: 'Admin',
    };
    
    timeline.push(newTimelineEntry);
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error('Error updating patent status:', error);
    return { success: false, error: 'Failed to update patent status' };
  }
};

export const updatePatentPayment = async (patentId: string, paymentData: { payment_status: number, payment_amount: number, payment_received: number }) => {
  await delay(500);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    // Update payment fields
    const updatedPatent = {
      ...patents[patentIndex],
      payment_status: paymentData.payment_status,
      payment_amount: paymentData.payment_amount,
      payment_received: paymentData.payment_received,
      updated_at: new Date().toISOString()
    };
    
    // Update patent in the array
    patents[patentIndex] = updatedPatent;
    
    // Add timeline entry
    const newTimelineEntry: TimelineEntry = {
      id: generateId(),
      patent_id: patentId,
      action: `Payment updated - Status: ${paymentData.payment_status}, Amount: ${paymentData.payment_amount}, Received: ${paymentData.payment_received}`,
      created_at: new Date().toISOString(),
      user: 'Admin',
    };
    
    timeline.push(newTimelineEntry);
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error('Error updating patent payment:', error);
    return { success: false, error: 'Failed to update patent payment' };
  }
};

export const updatePatentNotes = async (patentId: string, notes: string) => {
  await delay(300);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    // Update notes field
    const updatedPatent = {
      ...patents[patentIndex],
      notes: notes,
      updated_at: new Date().toISOString()
    };
    
    // Update patent in the array
    patents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error('Error updating patent notes:', error);
    return { success: false, error: 'Failed to update patent notes' };
  }
};

export const updatePatentForms = async (patentId: string, formData: Record<string, boolean>) => {
  await delay(500);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    // Update form fields
    const updatedPatent = {
      ...patents[patentIndex],
      updated_at: new Date().toISOString()
    };
    
    // Apply form updates
    for (const [formKey, value] of Object.entries(formData)) {
      updatedPatent[formKey as keyof Patent] = value;
    }
    
    // Update patent in the array
    patents[patentIndex] = updatedPatent;
    
    // Add timeline entry
    const newTimelineEntry: TimelineEntry = {
      id: generateId(),
      patent_id: patentId,
      action: `Forms updated`,
      created_at: new Date().toISOString(),
      user: 'Admin',
    };
    
    timeline.push(newTimelineEntry);
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error('Error updating patent forms:', error);
    return { success: false, error: 'Failed to update patent forms' };
  }
};

// Drafter API functions
export const fetchDrafterAssignments = async (drafterName: string) => {
  await delay(500);
  
  try {
    // Filter patents where this drafter is assigned and drafting is not completed
    const assignedPatents = patents.filter(patent => 
      (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) ||
      (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) ||
      (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0)
    );
    
    return { patents: assignedPatents, error: null };
  } catch (error) {
    console.error('Error fetching drafter assignments:', error);
    return { error: 'Failed to fetch drafter assignments', patents: [] };
  }
};

export const fetchDrafterCompletedAssignments = async (drafterName: string) => {
  await delay(500);
  
  try {
    // Filter patents where this drafter completed drafting but review is pending
    const completedPatents = patents.filter(patent => 
      (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) ||
      (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) ||
      (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0)
    );
    
    return { patents: completedPatents, error: null };
  } catch (error) {
    console.error('Error fetching completed drafter assignments:', error);
    return { error: 'Failed to fetch completed drafter assignments', patents: [] };
  }
};

export const completeDrafterTask = async (patent: Patent, drafterName: string, feedback?: string) => {
  await delay(800);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patent.id);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    
    // Determine which drafting task is being completed
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      updatedPatent.ps_drafting_status = 1;
      updatedPatent.updated_at = new Date().toISOString();
      
      // Add timeline entry
      const timelineEntry: TimelineEntry = {
        id: generateId(),
        patent_id: patent.id,
        action: 'PS Drafting completed',
        created_at: new Date().toISOString(),
        user: drafterName,
        comment: feedback || '',
      };
      
      timeline.push(timelineEntry);
    } 
    else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      updatedPatent.cs_drafting_status = 1;
      updatedPatent.updated_at = new Date().toISOString();
      
      // Add timeline entry
      const timelineEntry: TimelineEntry = {
        id: generateId(),
        patent_id: patent.id,
        action: 'CS Drafting completed',
        created_at: new Date().toISOString(),
        user: drafterName,
        comment: feedback || '',
      };
      
      timeline.push(timelineEntry);
    }
    else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      updatedPatent.fer_drafter_status = 1;
      updatedPatent.updated_at = new Date().toISOString();
      
      // Add timeline entry
      const timelineEntry: TimelineEntry = {
        id: generateId(),
        patent_id: patent.id,
        action: 'FER Drafting completed',
        created_at: new Date().toISOString(),
        user: drafterName,
        comment: feedback || '',
      };
      
      timeline.push(timelineEntry);
    }
    
    // Update the patent
    patents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent };
  } catch (error) {
    console.error('Error completing drafter task:', error);
    return { success: false, error: 'Failed to complete drafting task' };
  }
};

// Filer API functions
export const fetchFilerAssignments = async (filerName: string) => {
  await delay(500);
  
  try {
    // Filter patents where this filer is assigned and filing is not completed
    const assignedPatents = patents.filter(patent => 
      (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) ||
      (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0)
    );
    
    return { patents: assignedPatents, error: null };
  } catch (error) {
    console.error('Error fetching filer assignments:', error);
    return { error: 'Failed to fetch filer assignments', patents: [] };
  }
};

export const fetchFilerCompletedAssignments = async (filerName: string) => {
  await delay(500);
  
  try {
    // Filter patents where this filer completed filing but review is pending
    const completedPatents = patents.filter(patent => 
      (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 1) ||
      (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 1)
    );
    
    return { patents: completedPatents, error: null };
  } catch (error) {
    console.error('Error fetching completed filer assignments:', error);
    return { error: 'Failed to fetch completed filer assignments', patents: [] };
  }
};

export const fetchFilerFERAssignments = async (filerName: string) => {
  await delay(500);
  
  try {
    // Filter patents that have FER entries assigned to this filer
    const patentsWithFER = patents.filter(patent => 
      patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_filer_assgn === filerName && entry.fer_filing_status === 0
      )
    );
    
    return { patents: patentsWithFER, error: null };
  } catch (error) {
    console.error('Error fetching FER filer assignments:', error);
    return { error: 'Failed to fetch FER filer assignments', patents: [] };
  }
};

export const completeFilerTask = async (patentId: string, taskType: string, formData?: Record<string, boolean>) => {
  await delay(800);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    const filerName = taskType === 'ps' ? updatedPatent.ps_filer_assgn : updatedPatent.cs_filer_assgn;
    
    // Complete the filing task
    if (taskType === 'ps') {
      updatedPatent.ps_filing_status = 1;
    } else if (taskType === 'cs') {
      updatedPatent.cs_filing_status = 1;
      
      // Update form fields if provided (for CS filings)
      if (formData) {
        for (const [formKey, value] of Object.entries(formData)) {
          updatedPatent[formKey as keyof Patent] = value;
        }
      }
    }
    
    updatedPatent.updated_at = new Date().toISOString();
    
    // Add timeline entry
    const timelineEntry: TimelineEntry = {
      id: generateId(),
      patent_id: patentId,
      action: `${taskType.toUpperCase()} Filing completed`,
      created_at: new Date().toISOString(),
      user: filerName || 'Filer',
    };
    
    timeline.push(timelineEntry);
    
    // Update the patent
    patents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent };
  } catch (error) {
    console.error('Error completing filer task:', error);
    return { success: false, error: 'Failed to complete filing task' };
  }
};

export const completeFERFilerTask = async (ferEntry: FEREntry) => {
  await delay(800);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === ferEntry.patent_id);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    
    // Find and update the FER entry
    if (updatedPatent.fer_entries) {
      const ferIndex = updatedPatent.fer_entries.findIndex(entry => entry.id === ferEntry.id);
      
      if (ferIndex !== -1) {
        updatedPatent.fer_entries[ferIndex] = {
          ...updatedPatent.fer_entries[ferIndex],
          fer_filing_status: 1,
          updated_at: new Date().toISOString()
        };
        
        updatedPatent.updated_at = new Date().toISOString();
        
        // Add timeline entry
        const timelineEntry: TimelineEntry = {
          id: generateId(),
          patent_id: ferEntry.patent_id,
          action: `FER #${ferEntry.fer_number} Filing completed`,
          created_at: new Date().toISOString(),
          user: ferEntry.fer_filer_assgn || 'Filer',
        };
        
        timeline.push(timelineEntry);
        
        // Update the patent
        patents[patentIndex] = updatedPatent;
        
        return { success: true, patent: updatedPatent };
      } else {
        return { success: false, error: 'FER entry not found' };
      }
    } else {
      return { success: false, error: 'No FER entries found for this patent' };
    }
  } catch (error) {
    console.error('Error completing FER filer task:', error);
    return { success: false, error: 'Failed to complete FER filing task' };
  }
};

// FER-related functions
export const createFEREntry = async (patentId: string, ferData: Partial<FEREntry>) => {
  await delay(800);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    
    // Initialize fer_entries array if it doesn't exist
    if (!updatedPatent.fer_entries) {
      updatedPatent.fer_entries = [];
    }
    
    // Generate FER number
    const ferNumber = updatedPatent.fer_entries.length + 1;
    
    // Create new FER entry
    const newFEREntry: FEREntry = {
      id: generateId(),
      patent_id: patentId,
      fer_number: ferNumber,
      fer_date: ferData.fer_date || new Date().toISOString(),
      fer_description: ferData.fer_description || '',
      fer_drafter_assgn: ferData.fer_drafter_assgn || '',
      fer_drafter_deadline: ferData.fer_drafter_deadline || '',
      fer_drafter_status: 0,
      fer_review_draft_status: 0,
      fer_filer_assgn: ferData.fer_filer_assgn || '',
      fer_filer_deadline: ferData.fer_filer_deadline || '',
      fer_filing_status: 0,
      fer_review_file_status: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Add the new FER entry
    updatedPatent.fer_entries.push(newFEREntry);
    updatedPatent.updated_at = new Date().toISOString();
    
    // Add timeline entry
    const timelineEntry: TimelineEntry = {
      id: generateId(),
      patent_id: patentId,
      action: `New FER #${ferNumber} created`,
      created_at: new Date().toISOString(),
      user: 'Admin',
    };
    
    timeline.push(timelineEntry);
    
    // Update the patent
    patents[patentIndex] = updatedPatent;
    
    return { success: true, fer: newFEREntry };
  } catch (error) {
    console.error('Error creating FER entry:', error);
    return { success: false, error: 'Failed to create FER entry' };
  }
};

export const updateFEREntry = async (patentId: string, ferId: string, ferData: Partial<FEREntry>) => {
  await delay(800);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    
    // Find the FER entry
    if (updatedPatent.fer_entries) {
      const ferIndex = updatedPatent.fer_entries.findIndex(entry => entry.id === ferId);
      
      if (ferIndex !== -1) {
        // Update the FER entry
        updatedPatent.fer_entries[ferIndex] = {
          ...updatedPatent.fer_entries[ferIndex],
          ...ferData,
          updated_at: new Date().toISOString()
        };
        
        updatedPatent.updated_at = new Date().toISOString();
        
        // Add timeline entry
        const timelineEntry: TimelineEntry = {
          id: generateId(),
          patent_id: patentId,
          action: `FER #${updatedPatent.fer_entries[ferIndex].fer_number} updated`,
          created_at: new Date().toISOString(),
          user: 'Admin',
        };
        
        timeline.push(timelineEntry);
        
        // Update the patent
        patents[patentIndex] = updatedPatent;
        
        return { success: true, fer: updatedPatent.fer_entries[ferIndex] };
      } else {
        return { success: false, error: 'FER entry not found' };
      }
    } else {
      return { success: false, error: 'No FER entries found for this patent' };
    }
  } catch (error) {
    console.error('Error updating FER entry:', error);
    return { success: false, error: 'Failed to update FER entry' };
  }
};

export const deleteFEREntry = async (patentId: string, ferId: string) => {
  await delay(500);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    
    // Find and remove the FER entry
    if (updatedPatent.fer_entries) {
      const ferIndex = updatedPatent.fer_entries.findIndex(entry => entry.id === ferId);
      
      if (ferIndex !== -1) {
        // Get FER number for the timeline entry
        const ferNumber = updatedPatent.fer_entries[ferIndex].fer_number;
        
        // Remove the FER entry
        updatedPatent.fer_entries.splice(ferIndex, 1);
        updatedPatent.updated_at = new Date().toISOString();
        
        // Add timeline entry
        const timelineEntry: TimelineEntry = {
          id: generateId(),
          patent_id: patentId,
          action: `FER #${ferNumber} deleted`,
          created_at: new Date().toISOString(),
          user: 'Admin',
        };
        
        timeline.push(timelineEntry);
        
        // Update the patent
        patents[patentIndex] = updatedPatent;
        
        return { success: true };
      } else {
        return { success: false, error: 'FER entry not found' };
      }
    } else {
      return { success: false, error: 'No FER entries found for this patent' };
    }
  } catch (error) {
    console.error('Error deleting FER entry:', error);
    return { success: false, error: 'Failed to delete FER entry' };
  }
};

// Review API functions
export const fetchPendingReviews = async () => {
  await delay(500);
  
  try {
    // Filter patents with pending reviews
    const pendingReviews = patents.filter(patent => 
      (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) ||
      (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) ||
      (patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) ||
      (patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) ||
      (patent.fer_entries && patent.fer_entries.some(entry => 
        (entry.fer_drafter_status === 1 && entry.fer_review_draft_status === 0) ||
        (entry.fer_filing_status === 1 && entry.fer_review_file_status === 0)
      ))
    );
    
    return { patents: pendingReviews, error: null };
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return { error: 'Failed to fetch pending reviews', patents: [] };
  }
};

export const approveReview = async (patentId: string, reviewType: string, feedback?: string) => {
  await delay(800);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    
    // Determine which review is being approved
    switch (reviewType) {
      case 'ps_draft':
        updatedPatent.ps_review_draft_status = 1;
        
        // Check if provisional specification is completed
        if (updatedPatent.ps_filing_status === 1 && updatedPatent.ps_review_file_status === 1) {
          updatedPatent.ps_completion_status = 1;
        }
        break;
        
      case 'ps_file':
        updatedPatent.ps_review_file_status = 1;
        
        // Check if provisional specification is completed
        if (updatedPatent.ps_drafting_status === 1 && updatedPatent.ps_review_draft_status === 1) {
          updatedPatent.ps_completion_status = 1;
        }
        break;
        
      case 'cs_draft':
        updatedPatent.cs_review_draft_status = 1;
        
        // Check if complete specification is completed
        if (updatedPatent.cs_filing_status === 1 && updatedPatent.cs_review_file_status === 1) {
          updatedPatent.cs_completion_status = 1;
        }
        break;
        
      case 'cs_file':
        updatedPatent.cs_review_file_status = 1;
        
        // Check if complete specification is completed
        if (updatedPatent.cs_drafting_status === 1 && updatedPatent.cs_review_draft_status === 1) {
          updatedPatent.cs_completion_status = 1;
        }
        break;
        
      // FER reviews will be handled separately
        
      default:
        return { success: false, error: 'Invalid review type' };
    }
    
    updatedPatent.updated_at = new Date().toISOString();
    
    // Add feedback to notes if provided
    if (feedback) {
      updatedPatent.notes = updatedPatent.notes 
        ? `${updatedPatent.notes}\n\n${new Date().toLocaleDateString()}: ${reviewType} review feedback: ${feedback}`
        : `${new Date().toLocaleDateString()}: ${reviewType} review feedback: ${feedback}`;
    }
    
    // Add timeline entry
    const timelineEntry: TimelineEntry = {
      id: generateId(),
      patent_id: patentId,
      action: `${reviewType.toUpperCase().replace('_', ' ')} review approved`,
      created_at: new Date().toISOString(),
      user: 'Admin',
      comment: feedback || '',
    };
    
    timeline.push(timelineEntry);
    
    // Update the patent
    patents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent };
  } catch (error) {
    console.error('Error approving review:', error);
    return { success: false, error: 'Failed to approve review' };
  }
};

export const approveFERReview = async (patentId: string, ferId: string, reviewType: string, feedback?: string) => {
  await delay(800);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    
    // Find the FER entry
    if (!updatedPatent.fer_entries) {
      return { success: false, error: 'No FER entries found for this patent' };
    }
    
    const ferIndex = updatedPatent.fer_entries.findIndex(entry => entry.id === ferId);
    
    if (ferIndex === -1) {
      return { success: false, error: 'FER entry not found' };
    }
    
    // Determine which FER review is being approved
    if (reviewType === 'fer_draft') {
      updatedPatent.fer_entries[ferIndex].fer_review_draft_status = 1;
    } else if (reviewType === 'fer_file') {
      updatedPatent.fer_entries[ferIndex].fer_review_file_status = 1;
    } else {
      return { success: false, error: 'Invalid FER review type' };
    }
    
    updatedPatent.updated_at = new Date().toISOString();
    updatedPatent.fer_entries[ferIndex].updated_at = new Date().toISOString();
    
    // Add timeline entry
    const timelineEntry: TimelineEntry = {
      id: generateId(),
      patent_id: patentId,
      action: `FER #${updatedPatent.fer_entries[ferIndex].fer_number} ${reviewType.replace('fer_', '')} review approved`,
      created_at: new Date().toISOString(),
      user: 'Admin',
      comment: feedback || '',
    };
    
    timeline.push(timelineEntry);
    
    // Update the patent
    patents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent };
  } catch (error) {
    console.error('Error approving FER review:', error);
    return { success: false, error: 'Failed to approve FER review' };
  }
};

// Utility functions for fetching combined data
export const fetchPatentsAndEmployees = async () => {
  await delay(600);
  
  try {
    const patentsData = await fetchPatents();
    const employeesData = await fetchEmployees();
    
    return {
      patents: patentsData.patents,
      employees: employeesData.employees,
      error: null
    };
  } catch (error) {
    console.error('Error fetching patents and employees:', error);
    return {
      patents: [],
      employees: [],
      error: 'Failed to fetch data'
    };
  }
};

// Add the new functions that were missing
export const fetchPatentsByDrafter = async (drafterId: string) => {
  await delay(500);
  
  try {
    // Get the drafter's full name
    const employee = employees.find(e => e.id === drafterId);
    if (!employee) {
      return { error: 'Drafter not found', patents: [] };
    }
    
    const drafterName = employee.full_name;
    
    // Filter patents where this drafter is assigned
    const assignedPatents = patents.filter(patent => 
      patent.ps_drafter_assgn === drafterName || 
      patent.cs_drafter_assgn === drafterName || 
      patent.fer_drafter_assgn === drafterName
    );
    
    return { patents: assignedPatents, error: null };
  } catch (error) {
    console.error('Error fetching drafter patents:', error);
    return { error: 'Failed to fetch drafter patents', patents: [] };
  }
};

export const submitDraftForReview = async (patentId: string, draftType: string, feedback?: string) => {
  await delay(800);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    let draftingUser = '';
    
    // Determine which draft is being submitted for review
    if (draftType === 'ps') {
      updatedPatent.ps_drafting_status = 1;
      draftingUser = updatedPatent.ps_drafter_assgn;
    } else if (draftType === 'cs') {
      updatedPatent.cs_drafting_status = 1;
      draftingUser = updatedPatent.cs_drafter_assgn;
    } else if (draftType === 'fer') {
      updatedPatent.fer_drafter_status = 1;
      draftingUser = updatedPatent.fer_drafter_assgn;
    } else {
      return { success: false, error: 'Invalid draft type' };
    }
    
    updatedPatent.updated_at = new Date().toISOString();
    
    // Add timeline entry
    const timelineEntry: TimelineEntry = {
      id: generateId(),
      patent_id: patentId,
      action: `${draftType.toUpperCase()} Draft submitted for review`,
      created_at: new Date().toISOString(),
      user: draftingUser || 'Drafter',
      comment: feedback || '',
    };
    
    timeline.push(timelineEntry);
    
    // Update the patent
    patents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent };
  } catch (error) {
    console.error('Error submitting draft for review:', error);
    return { success: false, error: 'Failed to submit draft for review' };
  }
};

export const fetchPatentsByFiler = async (filerId: string) => {
  await delay(500);
  
  try {
    // Get the filer's full name
    const employee = employees.find(e => e.id === filerId);
    if (!employee) {
      return { error: 'Filer not found', patents: [] };
    }
    
    const filerName = employee.full_name;
    
    // Filter patents where this filer is assigned
    const assignedPatents = patents.filter(patent => 
      patent.ps_filer_assgn === filerName || 
      patent.cs_filer_assgn === filerName || 
      (patent.fer_entries && patent.fer_entries.some(entry => entry.fer_filer_assgn === filerName))
    );
    
    return { patents: assignedPatents, error: null };
  } catch (error) {
    console.error('Error fetching filer patents:', error);
    return { error: 'Failed to fetch filer patents', patents: [] };
  }
};

export const submitFilingForReview = async (patentId: string, filingType: string, formData?: Record<string, boolean>) => {
  await delay(800);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    let filingUser = '';
    
    // Determine which filing is being submitted for review
    if (filingType === 'ps') {
      updatedPatent.ps_filing_status = 1;
      filingUser = updatedPatent.ps_filer_assgn;
    } else if (filingType === 'cs') {
      updatedPatent.cs_filing_status = 1;
      filingUser = updatedPatent.cs_filer_assgn;
      
      // Update form fields if provided (for CS filings)
      if (formData) {
        for (const [formKey, value] of Object.entries(formData)) {
          updatedPatent[formKey as keyof Patent] = value;
        }
      }
    } else {
      return { success: false, error: 'Invalid filing type' };
    }
    
    updatedPatent.updated_at = new Date().toISOString();
    
    // Add timeline entry
    const timelineEntry: TimelineEntry = {
      id: generateId(),
      patent_id: patentId,
      action: `${filingType.toUpperCase()} Filing submitted for review`,
      created_at: new Date().toISOString(),
      user: filingUser || 'Filer',
    };
    
    timeline.push(timelineEntry);
    
    // Update the patent
    patents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent };
  } catch (error) {
    console.error('Error submitting filing for review:', error);
    return { success: false, error: 'Failed to submit filing for review' };
  }
};

// Export inventor-related functions
export const createInventor = async (patentId: string, inventorData: Partial<Inventor>) => {
  await delay(500);
  
  try {
    const patentIndex = patents.findIndex(p => p.id === patentId);
    
    if (patentIndex === -1) {
      return { success: false, error: 'Patent not found' };
    }
    
    const updatedPatent = { ...patents[patentIndex] };
    
    // Initialize inventors array if it doesn't exist
    if (!updatedPatent.inventors) {
      updatedPatent.inventors = [];
    }
    
    // Get patent tracking ID
    const trackingId = updatedPatent.tracking_id;
    
    // Create new inventor
    const newInventor: Inventor = {
      id: generateId(),
      tracking_id: trackingId,
      inventor_name: inventorData.inventor_name || '',
      inventor_addr: inventorData.inventor_addr || '',
    };
    
    // Add the new inventor
    updatedPatent.inventors.push(newInventor);
    updatedPatent.updated_at = new Date().toISOString();
    
    // Update the patent
    patents[patentIndex] = updatedPatent;
    
    return { success: true, inventor: newInventor };
  } catch (error) {
    console.error('Error creating inventor:', error);
    return { success: false, error: 'Failed to create inventor' };
  }
};
