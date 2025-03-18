
import { supabase } from '@/integrations/supabase/client';
import { standardizePatent, normalizePatents } from '@/lib/utils/type-converters';
import { Patent } from '@/lib/types';

// Let's fix the export functions to prevent the "This kind of expression is always truthy" error
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
export * from './patent/index';
export * from './employee-api';
export * from './drafter-api';
export * from './filer-api';
export * from './review-api';
export * from './fer-actions';
export * from './tasks/drafter-tasks';
export * from './tasks/filer-tasks';
export * from './timeline-api';
