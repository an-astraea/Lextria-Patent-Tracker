
// Mock API utilities for development
import { Patent, Employee, FEREntry, PatientTimeline } from './types';

// Instead of using process.env, use import.meta.env for Vite projects
const API_DELAY = 500; // Simulated API delay in milliseconds

// Mock data for development
import { MOCK_PATENTS, MOCK_EMPLOYEES, generateMockTimeline } from './data';

// Auth API functions
export const loginUser = async (email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  
  // Simple mock authentication
  if (email === 'admin@example.com' && password === 'admin123') {
    return {
      success: true,
      user: {
        id: '1',
        full_name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    };
  } else if (email === 'drafter@example.com' && password === 'drafter123') {
    return {
      success: true,
      user: {
        id: '2',
        full_name: 'Drafter User',
        email: 'drafter@example.com',
        role: 'drafter'
      }
    };
  } else if (email === 'filer@example.com' && password === 'filer123') {
    return {
      success: true,
      user: {
        id: '3',
        full_name: 'Filer User',
        email: 'filer@example.com',
        role: 'filer'
      }
    };
  }
  
  return {
    success: false,
    message: 'Invalid email or password'
  };
};

// Patent API functions
export const fetchPatents = async () => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    return { patents: MOCK_PATENTS, error: null };
  } catch (error) {
    console.error('Error fetching patents:', error);
    return { patents: [], error: error };
  }
};

export const fetchPatentById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patent = MOCK_PATENTS.find(p => p.id === id);
    return patent || null;
  } catch (error) {
    console.error(`Error fetching patent with ID ${id}:`, error);
    return null;
  }
};

export const createPatent = async (patentData: Partial<Patent>) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const newPatent = {
      ...patentData,
      id: `patent-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Patent;
    MOCK_PATENTS.push(newPatent);
    return { success: true, patent: newPatent, error: null };
  } catch (error) {
    console.error('Error creating patent:', error);
    return { success: false, patent: null, error: error };
  }
};

export const updatePatent = async (id: string, patentData: Partial<Patent>) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === id);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${id} not found`);
    }
    
    const updatedPatent = {
      ...MOCK_PATENTS[patentIndex],
      ...patentData,
      updated_at: new Date().toISOString()
    };
    
    MOCK_PATENTS[patentIndex] = updatedPatent;
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error updating patent with ID ${id}:`, error);
    return { success: false, patent: null, error: error };
  }
};

export const deletePatent = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === id);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${id} not found`);
    }
    
    MOCK_PATENTS.splice(patentIndex, 1);
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting patent with ID ${id}:`, error);
    return { success: false, error: error };
  }
};

// Employee API functions
export const fetchEmployees = async () => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    return { employees: MOCK_EMPLOYEES, error: null };
  } catch (error) {
    console.error('Error fetching employees:', error);
    return { employees: [], error: error };
  }
};

export const fetchEmployeeById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const employee = MOCK_EMPLOYEES.find(e => e.id === id);
    return employee || null;
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    return null;
  }
};

export const createEmployee = async (employeeData: Partial<Employee>) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const newEmployee = {
      ...employeeData,
      id: `employee-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Employee;
    MOCK_EMPLOYEES.push(newEmployee);
    return { success: true, employee: newEmployee, error: null };
  } catch (error) {
    console.error('Error creating employee:', error);
    return { success: false, employee: null, error: error };
  }
};

export const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const employeeIndex = MOCK_EMPLOYEES.findIndex(e => e.id === id);
    if (employeeIndex === -1) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    
    const updatedEmployee = {
      ...MOCK_EMPLOYEES[employeeIndex],
      ...employeeData,
      updated_at: new Date().toISOString()
    };
    
    MOCK_EMPLOYEES[employeeIndex] = updatedEmployee;
    return { success: true, employee: updatedEmployee, error: null };
  } catch (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    return { success: false, employee: null, error: error };
  }
};

export const deleteEmployee = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const employeeIndex = MOCK_EMPLOYEES.findIndex(e => e.id === id);
    if (employeeIndex === -1) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    
    MOCK_EMPLOYEES.splice(employeeIndex, 1);
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    return { success: false, error: error };
  }
};

// Assignment and Review functions
export const fetchDrafterAssignments = async (drafterId: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patents = MOCK_PATENTS.filter(p => 
      (p.ps_drafter_assgn === drafterId && p.ps_drafting_status === 0) || 
      (p.cs_drafter_assgn === drafterId && p.cs_drafting_status === 0) ||
      (p.fer_drafter_assgn === drafterId && p.fer_drafter_status === 0)
    );
    return { patents, error: null };
  } catch (error) {
    console.error('Error fetching drafter assignments:', error);
    return { patents: [], error: error };
  }
};

export const fetchDrafterCompletedAssignments = async (drafterId: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patents = MOCK_PATENTS.filter(p => 
      (p.ps_drafter_assgn === drafterId && p.ps_drafting_status === 1) || 
      (p.cs_drafter_assgn === drafterId && p.cs_drafting_status === 1) ||
      (p.fer_drafter_assgn === drafterId && p.fer_drafter_status === 1)
    );
    return { patents, error: null };
  } catch (error) {
    console.error('Error fetching completed drafter assignments:', error);
    return { patents: [], error: error };
  }
};

export const completeDrafterTask = async (patentId: string, taskType: 'ps' | 'cs' | 'fer') => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...MOCK_PATENTS[patentIndex] };
    
    if (taskType === 'ps') {
      updatedPatent.ps_drafting_status = 1;
      updatedPatent.ps_review_draft_status = 1; // Mark for review
    } else if (taskType === 'cs') {
      updatedPatent.cs_drafting_status = 1;
      updatedPatent.cs_review_draft_status = 1; // Mark for review
    } else if (taskType === 'fer') {
      updatedPatent.fer_drafter_status = 1;
      updatedPatent.fer_review_draft_status = 1; // Mark for review
    }
    
    updatedPatent.updated_at = new Date().toISOString();
    MOCK_PATENTS[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error completing drafter task for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

export const fetchFilerAssignments = async (filerId: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patents = MOCK_PATENTS.filter(p => 
      (p.ps_filer_assgn === filerId && p.ps_filing_status === 0) || 
      (p.cs_filer_assgn === filerId && p.cs_filing_status === 0) ||
      (p.fer_filer_assgn === filerId && p.fer_filing_status === 0)
    );
    return { patents, error: null };
  } catch (error) {
    console.error('Error fetching filer assignments:', error);
    return { patents: [], error: error };
  }
};

export const fetchFilerCompletedAssignments = async (filerId: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patents = MOCK_PATENTS.filter(p => 
      (p.ps_filer_assgn === filerId && p.ps_filing_status === 1) || 
      (p.cs_filer_assgn === filerId && p.cs_filing_status === 1) ||
      (p.fer_filer_assgn === filerId && p.fer_filing_status === 1)
    );
    return { patents, error: null };
  } catch (error) {
    console.error('Error fetching completed filer assignments:', error);
    return { patents: [], error: error };
  }
};

export const fetchFilerFERAssignments = async (filerId: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patents = MOCK_PATENTS.filter(p => 
      p.fer_filer_assgn === filerId && p.fer_filing_status === 0
    );
    return { patents, error: null };
  } catch (error) {
    console.error('Error fetching FER filer assignments:', error);
    return { patents: [], error: error };
  }
};

export const completeFilerTask = async (patentId: string, taskType: 'ps' | 'cs' | 'fer', formData?: any) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...MOCK_PATENTS[patentIndex] };
    
    if (taskType === 'ps') {
      updatedPatent.ps_filing_status = 1;
      updatedPatent.ps_review_file_status = 1; // Mark for review
    } else if (taskType === 'cs') {
      updatedPatent.cs_filing_status = 1;
      updatedPatent.cs_review_file_status = 1; // Mark for review
      
      // Update form data if provided
      if (formData) {
        if (formData.form_26 !== undefined) updatedPatent.form_26 = formData.form_26;
        if (formData.form_18 !== undefined) updatedPatent.form_18 = formData.form_18;
        if (formData.form_18a !== undefined) updatedPatent.form_18a = formData.form_18a;
        if (formData.form_9 !== undefined) updatedPatent.form_9 = formData.form_9;
        if (formData.form_9a !== undefined) updatedPatent.form_9a = formData.form_9a;
        if (formData.form_13 !== undefined) updatedPatent.form_13 = formData.form_13;
      }
    } else if (taskType === 'fer') {
      updatedPatent.fer_filing_status = 1;
      updatedPatent.fer_review_file_status = 1; // Mark for review
    }
    
    updatedPatent.updated_at = new Date().toISOString();
    MOCK_PATENTS[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error completing filer task for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

// Review-related functions
export const fetchPendingReviews = async () => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patents = MOCK_PATENTS.filter(p => 
      p.ps_review_draft_status === 1 || p.ps_review_file_status === 1 ||
      p.cs_review_draft_status === 1 || p.cs_review_file_status === 1 ||
      p.fer_review_draft_status === 1 || p.fer_review_file_status === 1
    );
    return { patents, error: null };
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return { patents: [], error: error };
  }
};

export const approvePatentReview = async (patentId: string, reviewType: 'ps_draft' | 'ps_file' | 'cs_draft' | 'cs_file' | 'fer_draft' | 'fer_file') => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...MOCK_PATENTS[patentIndex] };
    
    switch (reviewType) {
      case 'ps_draft':
        updatedPatent.ps_review_draft_status = 0;
        break;
      case 'ps_file':
        updatedPatent.ps_review_file_status = 0;
        updatedPatent.ps_completion_status = 1; // Mark PS as complete
        break;
      case 'cs_draft':
        updatedPatent.cs_review_draft_status = 0;
        break;
      case 'cs_file':
        updatedPatent.cs_review_file_status = 0;
        updatedPatent.cs_completion_status = 1; // Mark CS as complete
        break;
      case 'fer_draft':
        updatedPatent.fer_review_draft_status = 0;
        break;
      case 'fer_file':
        updatedPatent.fer_review_file_status = 0;
        updatedPatent.fer_completion_status = 1; // Mark FER as complete
        break;
    }
    
    updatedPatent.updated_at = new Date().toISOString();
    MOCK_PATENTS[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error approving review for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

export const rejectPatentReview = async (patentId: string, reviewType: 'ps_draft' | 'ps_file' | 'cs_draft' | 'cs_file' | 'fer_draft' | 'fer_file', feedback: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...MOCK_PATENTS[patentIndex] };
    
    // Reset the status based on review type
    switch (reviewType) {
      case 'ps_draft':
        updatedPatent.ps_review_draft_status = 0;
        updatedPatent.ps_drafting_status = 0; // Reset to not complete, needs rework
        break;
      case 'ps_file':
        updatedPatent.ps_review_file_status = 0;
        updatedPatent.ps_filing_status = 0; // Reset to not complete, needs rework
        break;
      case 'cs_draft':
        updatedPatent.cs_review_draft_status = 0;
        updatedPatent.cs_drafting_status = 0; // Reset to not complete, needs rework
        break;
      case 'cs_file':
        updatedPatent.cs_review_file_status = 0;
        updatedPatent.cs_filing_status = 0; // Reset to not complete, needs rework
        break;
      case 'fer_draft':
        updatedPatent.fer_review_draft_status = 0;
        updatedPatent.fer_drafter_status = 0; // Reset to not complete, needs rework
        break;
      case 'fer_file':
        updatedPatent.fer_review_file_status = 0;
        updatedPatent.fer_filing_status = 0; // Reset to not complete, needs rework
        break;
    }
    
    // Store feedback (in a real app, you'd likely store this in a separate table)
    updatedPatent.feedback = feedback;
    updatedPatent.updated_at = new Date().toISOString();
    MOCK_PATENTS[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error rejecting review for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

// Additional utility functions
export const updatePatentStatus = async (patentId: string, statusField: string, newValue: number | boolean) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...MOCK_PATENTS[patentIndex] };
    
    // @ts-ignore - we're dynamically updating a field
    updatedPatent[statusField] = newValue;
    updatedPatent.updated_at = new Date().toISOString();
    
    MOCK_PATENTS[patentIndex] = updatedPatent;
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error updating status for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

export const updatePatentNotes = async (patentId: string, notes: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...MOCK_PATENTS[patentIndex], notes, updated_at: new Date().toISOString() };
    MOCK_PATENTS[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error updating notes for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

export const updatePatentPayment = async (patentId: string, amount: number, received: number) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { 
      ...MOCK_PATENTS[patentIndex], 
      payment_amount: amount,
      payment_received: received,
      updated_at: new Date().toISOString() 
    };
    
    MOCK_PATENTS[patentIndex] = updatedPatent;
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error updating payment for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

export const updatePatentForms = async (patentId: string, formData: Record<string, boolean>) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...MOCK_PATENTS[patentIndex], ...formData, updated_at: new Date().toISOString() };
    MOCK_PATENTS[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error updating forms for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

// FER CRUD operations
export const createFEREntry = async (
  patentId: string, 
  ferNumber: number, 
  drafterAssgn?: string, 
  drafterDeadline?: string,
  filerAssgn?: string,
  filerDeadline?: string,
  ferDate?: string
) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const newFER: FEREntry = {
      id: `fer-${Date.now()}`,
      patent_id: patentId,
      fer_number: ferNumber,
      fer_date: ferDate || null,
      fer_drafter_assgn: drafterAssgn || null,
      fer_drafter_deadline: drafterDeadline || null,
      fer_drafter_status: 0,
      fer_filer_assgn: filerAssgn || null,
      fer_filer_deadline: filerDeadline || null,
      fer_filing_status: 0,
      fer_review_draft_status: 0,
      fer_review_file_status: 0,
      fer_completion_status: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add the new FER entry to the patent
    const updatedPatent = { ...MOCK_PATENTS[patentIndex] };
    updatedPatent.fer_entries = [...(updatedPatent.fer_entries || []), newFER];
    updatedPatent.fer_status = 1; // Mark that FER is active now
    updatedPatent.updated_at = new Date().toISOString();
    
    MOCK_PATENTS[patentIndex] = updatedPatent;
    
    return newFER;
  } catch (error) {
    console.error(`Error creating FER entry for patent with ID ${patentId}:`, error);
    return null;
  }
};

export const updateFEREntry = async (ferId: string, ferData: Partial<FEREntry>) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    let ferEntry: FEREntry | null = null;
    let patentIndex = -1;
    
    // Find the FER entry and its parent patent
    for (let i = 0; i < MOCK_PATENTS.length; i++) {
      const patent = MOCK_PATENTS[i];
      if (!patent.fer_entries) continue;
      
      const ferIdx = patent.fer_entries.findIndex(fer => fer.id === ferId);
      if (ferIdx !== -1) {
        ferEntry = patent.fer_entries[ferIdx];
        patentIndex = i;
        break;
      }
    }
    
    if (!ferEntry || patentIndex === -1) {
      throw new Error(`FER entry with ID ${ferId} not found`);
    }
    
    // Update the FER entry
    const updatedFER = {
      ...ferEntry,
      ...ferData,
      updated_at: new Date().toISOString()
    };
    
    // Update the FER entry in the parent patent
    const patent = MOCK_PATENTS[patentIndex];
    const ferEntries = [...patent.fer_entries];
    const ferIdx = ferEntries.findIndex(fer => fer.id === ferId);
    ferEntries[ferIdx] = updatedFER;
    
    MOCK_PATENTS[patentIndex] = {
      ...patent,
      fer_entries: ferEntries,
      updated_at: new Date().toISOString()
    };
    
    return { success: true, ferEntry: updatedFER, error: null };
  } catch (error) {
    console.error(`Error updating FER entry with ID ${ferId}:`, error);
    return { success: false, ferEntry: null, error: error };
  }
};

export const deleteFEREntry = async (ferId: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    let patentIndex = -1;
    let ferIndex = -1;
    
    // Find the FER entry and its parent patent
    for (let i = 0; i < MOCK_PATENTS.length; i++) {
      const patent = MOCK_PATENTS[i];
      if (!patent.fer_entries) continue;
      
      const idx = patent.fer_entries.findIndex(fer => fer.id === ferId);
      if (idx !== -1) {
        patentIndex = i;
        ferIndex = idx;
        break;
      }
    }
    
    if (patentIndex === -1 || ferIndex === -1) {
      throw new Error(`FER entry with ID ${ferId} not found`);
    }
    
    // Remove the FER entry from the parent patent
    const patent = MOCK_PATENTS[patentIndex];
    const ferEntries = [...patent.fer_entries];
    ferEntries.splice(ferIndex, 1);
    
    // Update the parent patent
    MOCK_PATENTS[patentIndex] = {
      ...patent,
      fer_entries: ferEntries,
      fer_status: ferEntries.length > 0 ? 1 : 0,
      updated_at: new Date().toISOString()
    };
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting FER entry with ID ${ferId}:`, error);
    return { success: false, error: error };
  }
};

// FER-specific functions for backward compatibility
export const completeFERDrafterTask = async (ferEntry: FEREntry, drafterName?: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    // Find the parent patent
    const patentIndex = MOCK_PATENTS.findIndex(p => 
      p.fer_entries && p.fer_entries.some(fer => fer.id === ferEntry.id)
    );
    
    if (patentIndex === -1) {
      throw new Error(`Patent for FER entry with ID ${ferEntry.id} not found`);
    }
    
    const patent = MOCK_PATENTS[patentIndex];
    const ferEntries = [...patent.fer_entries];
    const ferIndex = ferEntries.findIndex(fer => fer.id === ferEntry.id);
    
    // Update the FER entry
    ferEntries[ferIndex] = {
      ...ferEntries[ferIndex],
      fer_drafter_status: 1,
      fer_review_draft_status: 1,
      updated_at: new Date().toISOString()
    };
    
    // Update the patent
    MOCK_PATENTS[patentIndex] = {
      ...patent,
      fer_entries: ferEntries,
      updated_at: new Date().toISOString()
    };
    
    return { success: true, ferEntry: ferEntries[ferIndex], error: null };
  } catch (error) {
    console.error(`Error completing FER drafter task for FER entry with ID ${ferEntry.id}:`, error);
    return { success: false, ferEntry: null, error: error };
  }
};

export const completeFERFilerTask = async (ferEntry: FEREntry, filerName?: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    // Find the parent patent
    const patentIndex = MOCK_PATENTS.findIndex(p => 
      p.fer_entries && p.fer_entries.some(fer => fer.id === ferEntry.id)
    );
    
    if (patentIndex === -1) {
      throw new Error(`Patent for FER entry with ID ${ferEntry.id} not found`);
    }
    
    const patent = MOCK_PATENTS[patentIndex];
    const ferEntries = [...patent.fer_entries];
    const ferIndex = ferEntries.findIndex(fer => fer.id === ferEntry.id);
    
    // Update the FER entry
    ferEntries[ferIndex] = {
      ...ferEntries[ferIndex],
      fer_filing_status: 1,
      fer_review_file_status: 1,
      updated_at: new Date().toISOString()
    };
    
    // Update the patent
    MOCK_PATENTS[patentIndex] = {
      ...patent,
      fer_entries: ferEntries,
      updated_at: new Date().toISOString()
    };
    
    return { success: true, ferEntry: ferEntries[ferIndex], error: null };
  } catch (error) {
    console.error(`Error completing FER filer task for FER entry with ID ${ferEntry.id}:`, error);
    return { success: false, ferEntry: null, error: error };
  }
};

export const approveFERReview = async (ferEntry: FEREntry, reviewType: 'draft' | 'file') => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    // Find the parent patent
    const patentIndex = MOCK_PATENTS.findIndex(p => 
      p.fer_entries && p.fer_entries.some(fer => fer.id === ferEntry.id)
    );
    
    if (patentIndex === -1) {
      throw new Error(`Patent for FER entry with ID ${ferEntry.id} not found`);
    }
    
    const patent = MOCK_PATENTS[patentIndex];
    const ferEntries = [...patent.fer_entries];
    const ferIndex = ferEntries.findIndex(fer => fer.id === ferEntry.id);
    
    // Update the FER entry
    const updatedFerEntry = { ...ferEntries[ferIndex] };
    
    if (reviewType === 'draft') {
      updatedFerEntry.fer_review_draft_status = 0;
    } else if (reviewType === 'file') {
      updatedFerEntry.fer_review_file_status = 0;
      updatedFerEntry.fer_completion_status = 1;
    }
    
    updatedFerEntry.updated_at = new Date().toISOString();
    ferEntries[ferIndex] = updatedFerEntry;
    
    // Update the patent
    MOCK_PATENTS[patentIndex] = {
      ...patent,
      fer_entries: ferEntries,
      updated_at: new Date().toISOString()
    };
    
    return { success: true, ferEntry: updatedFerEntry, error: null };
  } catch (error) {
    console.error(`Error approving FER review for FER entry with ID ${ferEntry.id}:`, error);
    return { success: false, ferEntry: null, error: error };
  }
};

// Fetch timeline data for a patent
export const fetchPatentTimeline = async (patentId: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    return generateMockTimeline(patentId);
  } catch (error) {
    console.error(`Error fetching timeline for patent with ID ${patentId}:`, error);
    return [];
  }
};

// Create inventors
export const createInventor = async (patentId: string, inventorData: { inventor_name: string, inventor_addr: string }) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = MOCK_PATENTS.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const newInventor = {
      id: `inventor-${Date.now()}`,
      tracking_id: MOCK_PATENTS[patentIndex].tracking_id,
      inventor_name: inventorData.inventor_name,
      inventor_addr: inventorData.inventor_addr
    };
    
    const updatedPatent = { ...MOCK_PATENTS[patentIndex] };
    updatedPatent.inventors = [...(updatedPatent.inventors || []), newInventor];
    updatedPatent.updated_at = new Date().toISOString();
    
    MOCK_PATENTS[patentIndex] = updatedPatent;
    
    return { success: true, inventor: newInventor, error: null };
  } catch (error) {
    console.error(`Error creating inventor for patent with ID ${patentId}:`, error);
    return { success: false, inventor: null, error: error };
  }
};

// Fetch patents and employees combined (for forms that need both)
export const fetchPatentsAndEmployees = async () => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    return { 
      patents: MOCK_PATENTS, 
      employees: MOCK_EMPLOYEES, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching patents and employees:', error);
    return { 
      patents: [], 
      employees: [], 
      error: error 
    };
  }
};
