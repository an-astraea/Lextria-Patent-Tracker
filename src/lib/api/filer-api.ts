import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { Patent } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to fetch filer assignments
export const fetchFilerAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`);
    
    if (error) {
      console.error('Error fetching filer assignments:', error);
      return [];
    }
    
    // Filter only patents where the filer has pending tasks
    const filteredPatents = data.filter(patent => 
      // PS filer task is ready when PS drafting is complete
      (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1) ||
      // CS filer task is ready when CS drafting is complete
      (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1) ||
      // FER filer task is ready when FER drafting is complete
      (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_filer_assgn === filerName && 
                entry.fer_filing_status === 0 && 
                entry.fer_drafter_status === 1
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching filer assignments:', error);
    return [];
  }
};

// Function to fetch filer completed assignments
export const fetchFilerCompletedAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`);
    
    if (error) {
      console.error('Error fetching filer completed assignments:', error);
      return [];
    }
    
    // Filter only patents where the filer has completed tasks
    const filteredPatents = data.filter(patent => 
      (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 1) ||
      (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 1) ||
      (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 1) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_filer_assgn === filerName && entry.fer_filing_status === 1
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching filer completed assignments:', error);
    return [];
  }
};
