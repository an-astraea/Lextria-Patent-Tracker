import { supabase } from '@/integrations/supabase/client';
import { standardizePatent, normalizePatents } from '@/lib/utils/type-converters';
import { Patent } from '@/lib/types';

// Let's fix the export functions to prevent the "This kind of expression is always truthy" error
export const updatePatentForms = async (patentId: string, formValues: Record<string, boolean>) => {
  try {
    console.log('Updating patent forms for patent ID:', patentId);
    console.log('Form values to update:', formValues);
    
    // Convert boolean values to 0/1 for database
    const formDataForDb: Record<string, number> = {};
    Object.entries(formValues).forEach(([key, value]) => {
      formDataForDb[key] = value ? 1 : 0;
    });
    
    console.log('Form data for database:', formDataForDb);
    
    const { data, error } = await supabase
      .from('patents')
      .update(formDataForDb)
      .eq('id', patentId);
      
    if (error) {
      console.error('Error updating patent forms:', error);
      return { success: false, message: error.message };
    }
    
    console.log('Patent forms updated successfully');
    return { success: true, message: 'Patent forms updated successfully' };
  } catch (error: any) {
    console.error('Exception updating patent forms:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

export const completeDrafterTask = async (patent: Patent, drafterName: string) => {
  try {
    console.log('Completing drafter task for patent:', patent.id);
    console.log('Drafter name:', drafterName);
    
    let updateFields: Record<string, any> = {};
    
    // Determine which type of task we're completing based on the drafter assignments
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      console.log('Completing PS drafting task');
      updateFields = { ps_drafting_status: 1 };
    } else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      console.log('Completing CS drafting task');
      updateFields = { cs_drafting_status: 1 };
    } else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      console.log('Completing FER drafting task');
      updateFields = { fer_drafter_status: 1 };
    } else {
      console.error('No matching drafter task found for completion');
      return { success: false, message: 'No matching drafter task found for completion' };
    }
    
    const { data, error } = await supabase
      .from('patents')
      .update(updateFields)
      .eq('id', patent.id);
      
    if (error) {
      console.error('Error completing drafter task:', error);
      return { success: false, message: error.message };
    }
    
    console.log('Drafter task completed successfully');
    return { success: true, message: 'Drafter task completed successfully' };
  } catch (error: any) {
    console.error('Exception completing drafter task:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

export const completeFilerTask = async (
  patent: Patent, 
  filerName: string, 
  formValues?: Record<string, boolean>
) => {
  try {
    console.log('Completing filer task for patent:', patent.id);
    console.log('Filer name:', filerName);
    
    let updateFields: Record<string, any> = {};
    
    // Determine which type of task we're completing based on the filer assignments
    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1) {
      console.log('Completing PS filing task');
      updateFields = { ps_filing_status: 1 };
    } else if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1) {
      console.log('Completing CS filing task');
      updateFields = { cs_filing_status: 1 };
    } else if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1) {
      console.log('Completing FER filing task');
      updateFields = { fer_filing_status: 1 };
    } else {
      console.error('No matching filer task found for completion');
      return { success: false, message: 'No matching filer task found for completion' };
    }
    
    // If form values are provided, include them in the update
    if (formValues) {
      console.log('Including form values in update:', formValues);
      
      // Convert boolean values to 0/1 for database
      Object.entries(formValues).forEach(([key, value]) => {
        if (key.startsWith('form_')) {
          updateFields[key] = value ? 1 : 0;
        }
      });
    }
    
    console.log('Final update fields:', updateFields);
    
    const { data, error } = await supabase
      .from('patents')
      .update(updateFields)
      .eq('id', patent.id);
      
    if (error) {
      console.error('Error completing filer task:', error);
      return { success: false, message: error.message };
    }
    
    console.log('Filer task completed successfully');
    return { success: true, message: 'Filer task completed successfully' };
  } catch (error: any) {
    console.error('Exception completing filer task:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

export const fetchPatentById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return standardizePatent(data);
  } catch (error) {
    console.error('Error fetching patent by ID:', error);
    throw error;
  }
};

export const fetchEmployees = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('full_name');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// Re-export other functions from individual files
export * from './auth-api';
export * from './patent-api';
export * from './employee-api';
export * from './drafter-api';
export * from './filer-api';
export * from './review-api';
export * from './fer-actions';
