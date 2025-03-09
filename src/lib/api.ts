
// Mock API utilities for development
import { Patent, Employee } from './types';

// Instead of using process.env, use import.meta.env for Vite projects
const API_DELAY = 500; // Simulated API delay in milliseconds

// Mock data for development
import { mockPatents, mockEmployees } from './data';

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
    return { patents: mockPatents, error: null };
  } catch (error) {
    console.error('Error fetching patents:', error);
    return { patents: [], error: error };
  }
};

export const fetchPatentById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patent = mockPatents.find(p => p.id === id);
    return { patent, error: null };
  } catch (error) {
    console.error(`Error fetching patent with ID ${id}:`, error);
    return { patent: null, error: error };
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
    };
    mockPatents.push(newPatent as Patent);
    return { success: true, patent: newPatent, error: null };
  } catch (error) {
    console.error('Error creating patent:', error);
    return { success: false, patent: null, error: error };
  }
};

export const updatePatent = async (id: string, patentData: Partial<Patent>) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = mockPatents.findIndex(p => p.id === id);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${id} not found`);
    }
    
    const updatedPatent = {
      ...mockPatents[patentIndex],
      ...patentData,
      updated_at: new Date().toISOString()
    };
    
    mockPatents[patentIndex] = updatedPatent;
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error updating patent with ID ${id}:`, error);
    return { success: false, patent: null, error: error };
  }
};

export const deletePatent = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = mockPatents.findIndex(p => p.id === id);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${id} not found`);
    }
    
    mockPatents.splice(patentIndex, 1);
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
    return { employees: mockEmployees, error: null };
  } catch (error) {
    console.error('Error fetching employees:', error);
    return { employees: [], error: error };
  }
};

export const fetchEmployeeById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const employee = mockEmployees.find(e => e.id === id);
    return { employee, error: null };
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    return { employee: null, error: error };
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
    };
    mockEmployees.push(newEmployee as Employee);
    return { success: true, employee: newEmployee, error: null };
  } catch (error) {
    console.error('Error creating employee:', error);
    return { success: false, employee: null, error: error };
  }
};

export const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const employeeIndex = mockEmployees.findIndex(e => e.id === id);
    if (employeeIndex === -1) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    
    const updatedEmployee = {
      ...mockEmployees[employeeIndex],
      ...employeeData,
      updated_at: new Date().toISOString()
    };
    
    mockEmployees[employeeIndex] = updatedEmployee;
    return { success: true, employee: updatedEmployee, error: null };
  } catch (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    return { success: false, employee: null, error: error };
  }
};

export const deleteEmployee = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const employeeIndex = mockEmployees.findIndex(e => e.id === id);
    if (employeeIndex === -1) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    
    mockEmployees.splice(employeeIndex, 1);
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
    const patents = mockPatents.filter(p => 
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
    const patents = mockPatents.filter(p => 
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
    const patentIndex = mockPatents.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...mockPatents[patentIndex] };
    
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
    mockPatents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error completing drafter task for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

export const fetchFilerAssignments = async (filerId: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patents = mockPatents.filter(p => 
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
    const patents = mockPatents.filter(p => 
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
    const patents = mockPatents.filter(p => 
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
    const patentIndex = mockPatents.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...mockPatents[patentIndex] };
    
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
    mockPatents[patentIndex] = updatedPatent;
    
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
    const patents = mockPatents.filter(p => 
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
    const patentIndex = mockPatents.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...mockPatents[patentIndex] };
    
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
    mockPatents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error approving review for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

export const rejectPatentReview = async (patentId: string, reviewType: 'ps_draft' | 'ps_file' | 'cs_draft' | 'cs_file' | 'fer_draft' | 'fer_file', feedback: string) => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  try {
    const patentIndex = mockPatents.findIndex(p => p.id === patentId);
    if (patentIndex === -1) {
      throw new Error(`Patent with ID ${patentId} not found`);
    }
    
    const updatedPatent = { ...mockPatents[patentIndex] };
    
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
    mockPatents[patentIndex] = updatedPatent;
    
    return { success: true, patent: updatedPatent, error: null };
  } catch (error) {
    console.error(`Error rejecting review for patent with ID ${patentId}:`, error);
    return { success: false, patent: null, error: error };
  }
};

// FER-specific functions for backward compatibility
export const completeFERDrafterTask = async (patentId: string) => {
  return completeDrafterTask(patentId, 'fer');
};

export const completeFERFilerTask = async (patentId: string) => {
  return completeFilerTask(patentId, 'fer');
};

export const approveFERReview = async (patentId: string, reviewType: 'draft' | 'file') => {
  return approvePatentReview(patentId, reviewType === 'draft' ? 'fer_draft' : 'fer_file');
};

export const rejectFERReview = async (patentId: string, reviewType: 'draft' | 'file', feedback: string) => {
  return rejectPatentReview(patentId, reviewType === 'draft' ? 'fer_draft' : 'fer_file', feedback);
};
