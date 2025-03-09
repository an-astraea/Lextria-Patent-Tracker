import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { Patent } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to fetch drafter assignments
export const fetchDrafterAssignments = async (drafterName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`);
    
    if (error) {
      console.error('Error fetching drafter assignments:', error);
      return [];
    }
    
    // Filter only patents where the drafter has pending tasks
    const filteredPatents = data.filter(patent => 
      (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) ||
      (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) ||
      (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_drafter_assgn === drafterName && entry.fer_drafter_status === 0
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching drafter assignments:', error);
    return [];
  }
};

// Function to fetch drafter completed assignments
export const fetchDrafterCompletedAssignments = async (drafterName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`);
    
    if (error) {
      console.error('Error fetching drafter completed assignments:', error);
      return [];
    }
    
    // Filter only patents where the drafter has completed tasks
    const filteredPatents = data.filter(patent => 
      (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 1) ||
      (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 1) ||
      (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 1) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_drafter_assgn === drafterName && entry.fer_drafter_status === 1
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching drafter completed assignments:', error);
    return [];
  }
};
