
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Employee, Patent, EmployeeFormData, PatentFormData } from '../types';

// Patent API functions
export const fetchPatents = async (): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as Patent[];
  } catch (error) {
    console.error('Error fetching patents:', error);
    return [];
  }
};

export const fetchPatentById = async (id: string): Promise<Patent | null> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as Patent;
  } catch (error) {
    console.error('Error fetching patent:', error);
    return null;
  }
};

export const addPatent = async (patentData: PatentFormData): Promise<Patent | null> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .insert(patentData)
      .select()
      .single();
      
    if (error) throw error;
    return data as Patent;
  } catch (error) {
    console.error('Error adding patent:', error);
    return null;
  }
};

export const updatePatent = async (id: string, patentData: Partial<Patent>): Promise<Patent | null> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update(patentData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Patent;
  } catch (error) {
    console.error('Error updating patent:', error);
    return null;
  }
};

export const deletePatent = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting patent:', error);
    return false;
  }
};

// Employee API functions
export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as Employee[];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

export const addEmployee = async (employeeData: EmployeeFormData): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single();
      
    if (error) throw error;
    return data as Employee;
  } catch (error) {
    console.error('Error adding employee:', error);
    return null;
  }
};

export const updateEmployee = async (id: string, employeeData: Partial<Employee>): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Employee;
  } catch (error) {
    console.error('Error updating employee:', error);
    return null;
  }
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
};

// Auth API functions
export const loginUser = async (email: string, password: string): Promise<any> => {
  try {
    // In a real app, this would use supabase.auth or a custom auth system
    // For this demo, we'll fetch the employee with the matching credentials
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

// Drafter API functions
export const fetchDrafterAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`)
      .or('ps_drafting_status.eq.0,cs_drafting_status.eq.0,fer_drafter_status.eq.0');
      
    if (error) throw error;
    return (data || []) as Patent[];
  } catch (error) {
    console.error('Error fetching drafter assignments:', error);
    return [];
  }
};

export const fetchDrafterCompletedAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`)
      .not('ps_drafting_status', 'eq', 0)
      .not('cs_drafting_status', 'eq', 0)
      .not('fer_drafter_status', 'eq', 0);
      
    if (error) throw error;
    return (data || []) as Patent[];
  } catch (error) {
    console.error('Error fetching completed drafter assignments:', error);
    return [];
  }
};

export const completeDrafterTask = async (patent: Patent, drafterName: string): Promise<boolean> => {
  try {
    let updateData: Partial<Patent> = {};
    
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      updateData = { 
        ps_drafting_status: 1, 
        ps_review_draft_status: 1 
      };
    } else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      updateData = { 
        cs_drafting_status: 1, 
        cs_review_draft_status: 1 
      };
    } else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      updateData = { 
        fer_drafter_status: 1, 
        fer_review_draft_status: 1 
      };
    } else {
      return false;
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patent.id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error completing drafter task:', error);
    return false;
  }
};

export const completeFERDrafterTask = async (patent: Patent, drafterName: string): Promise<boolean> => {
  try {
    if (patent.fer_drafter_assgn !== drafterName || patent.fer_drafter_status !== 0) {
      return false;
    }
    
    const { error } = await supabase
      .from('patents')
      .update({ 
        fer_drafter_status: 1, 
        fer_review_draft_status: 1 
      })
      .eq('id', patent.id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error completing FER drafter task:', error);
    return false;
  }
};

// Filer API functions
export const fetchFilerAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName}`)
      .or('ps_filing_status.eq.0,cs_filing_status.eq.0')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return (data || []) as Patent[];
  } catch (error) {
    console.error('Error fetching filer assignments:', error);
    return [];
  }
};

export const fetchFilerCompletedAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName}`)
      .not('ps_filing_status', 'eq', 0)
      .not('cs_filing_status', 'eq', 0)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return (data || []) as Patent[];
  } catch (error) {
    console.error('Error fetching completed filer assignments:', error);
    return [];
  }
};

export const fetchFilerFERAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .eq('fer_filer_assgn', filerName)
      .eq('fer_filing_status', 0)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return (data || []) as Patent[];
  } catch (error) {
    console.error('Error fetching FER filer assignments:', error);
    return [];
  }
};

export const completeFilerTask = async (patent: Patent, filerName: string): Promise<boolean> => {
  try {
    let updateData: Partial<Patent> = {};
    
    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
      updateData = { 
        ps_filing_status: 1, 
        ps_review_file_status: 1 
      };
    } else if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
      updateData = { 
        cs_filing_status: 1, 
        cs_review_file_status: 1 
      };
    } else {
      return false;
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patent.id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error completing filer task:', error);
    return false;
  }
};

export const completeFERFilerTask = async (patent: Patent, filerName: string): Promise<boolean> => {
  try {
    if (patent.fer_filer_assgn !== filerName || patent.fer_filing_status !== 0) {
      return false;
    }
    
    const { error } = await supabase
      .from('patents')
      .update({ 
        fer_filing_status: 1, 
        fer_review_file_status: 1 
      })
      .eq('id', patent.id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error completing FER filer task:', error);
    return false;
  }
};

// Review API functions
export const fetchPendingReviews = async (): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or('ps_review_draft_status.eq.1,ps_review_file_status.eq.1,cs_review_draft_status.eq.1,cs_review_file_status.eq.1,fer_review_draft_status.eq.1,fer_review_file_status.eq.1')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return (data || []) as Patent[];
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return [];
  }
};

export const approvePatentReview = async (patent: Patent, reviewType: string): Promise<boolean> => {
  try {
    let updateData: Partial<Patent> = {};
    
    switch (reviewType) {
      case 'ps_draft':
        updateData = { ps_review_draft_status: 2 };
        break;
      case 'ps_file':
        updateData = { 
          ps_review_file_status: 2,
          ps_completion_status: 1
        };
        break;
      case 'cs_draft':
        updateData = { cs_review_draft_status: 2 };
        break;
      case 'cs_file':
        updateData = { 
          cs_review_file_status: 2,
          cs_completion_status: 1
        };
        break;
      default:
        return false;
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patent.id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error approving review:', error);
    return false;
  }
};

export const approveFERReview = async (patent: Patent, reviewType: string): Promise<boolean> => {
  try {
    let updateData: Partial<Patent> = {};
    
    switch (reviewType) {
      case 'fer_draft':
        updateData = { fer_review_draft_status: 2 };
        break;
      case 'fer_file':
        updateData = { 
          fer_review_file_status: 2,
          fer_completion_status: 1
        };
        break;
      default:
        return false;
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patent.id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error approving FER review:', error);
    return false;
  }
};

export const rejectPatentReview = async (patent: Patent, reviewType: string): Promise<boolean> => {
  try {
    let updateData: Partial<Patent> = {};
    
    switch (reviewType) {
      case 'ps_draft':
        updateData = { 
          ps_review_draft_status: 0,
          ps_drafting_status: 0
        };
        break;
      case 'ps_file':
        updateData = { 
          ps_review_file_status: 0,
          ps_filing_status: 0
        };
        break;
      case 'cs_draft':
        updateData = { 
          cs_review_draft_status: 0,
          cs_drafting_status: 0
        };
        break;
      case 'cs_file':
        updateData = { 
          cs_review_file_status: 0,
          cs_filing_status: 0
        };
        break;
      case 'fer_draft':
        updateData = { 
          fer_review_draft_status: 0,
          fer_drafter_status: 0
        };
        break;
      case 'fer_file':
        updateData = { 
          fer_review_file_status: 0,
          fer_filing_status: 0
        };
        break;
      default:
        return false;
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patent.id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error rejecting review:', error);
    return false;
  }
};
