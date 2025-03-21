
import { supabase } from '@/integrations/supabase/client';
import { Patent } from '@/lib/types';
import { fetchPatentById } from '../patent-api';
import { addPatentTimelineEntry } from '../timeline-api';

export const fetchFilerTasks = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching filer tasks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchFilerTasks:', error);
    return [];
  }
};

export const fetchFilerCompletedTasks = async (filerName: string) => {
  try {
    // Fetch PS filings completed by the filer
    const { data: psFilings, error: psError } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*)
      `)
      .eq('ps_filer_assgn', filerName)
      .eq('ps_filing_status', 1)
      .order('created_at', { ascending: false });

    if (psError) {
      console.error('Error fetching PS completed filings:', psError);
      return [];
    }

    // Fetch CS filings completed by the filer
    const { data: csFilings, error: csError } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*)
      `)
      .eq('cs_filer_assgn', filerName)
      .eq('cs_filing_status', 1)
      .order('created_at', { ascending: false });

    if (csError) {
      console.error('Error fetching CS completed filings:', csError);
      return [];
    }

    // Fetch FER filings completed by the filer
    const { data: ferFilings, error: ferError } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*)
      `)
      .eq('fer_filer_assgn', filerName)
      .eq('fer_filing_status', 1)
      .order('created_at', { ascending: false });

    if (ferError) {
      console.error('Error fetching FER completed filings:', ferError);
      return [];
    }

    // Combine all completed filings
    const allCompletedFilings = [...(psFilings || []), ...(csFilings || []), ...(ferFilings || [])];

    // Sort by updated_at (most recent first)
    allCompletedFilings.sort((a, b) => {
      return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    });

    return allCompletedFilings;
  } catch (error) {
    console.error('Error in fetchFilerCompletedTasks:', error);
    return [];
  }
};

export const completeFilerTask = async (
  patentId: string, 
  filerName: string, 
  formValues?: Record<string, boolean>
) => {
  try {
    // First, fetch the patent to determine what type of task is being completed
    const patent = await fetchPatentById(patentId);
    
    if (!patent) {
      throw new Error('Patent not found');
    }
    
    let updateFields: Record<string, any> = {};
    let eventType = '';
    let eventDesc = '';
    
    // Determine which type of task we're completing based on the filer assignments
    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1) {
      updateFields = { ps_filing_status: 1, ps_review_file_status: 1 };
      eventType = 'ps_filing_completed';
      eventDesc = 'PS Filing completed by ' + filerName;
    } else if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1) {
      updateFields = { cs_filing_status: 1, cs_review_file_status: 1 };
      eventType = 'cs_filing_completed';
      eventDesc = 'CS Filing completed by ' + filerName;
    } else if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1) {
      updateFields = { fer_filing_status: 1, fer_review_file_status: 1 };
      eventType = 'fer_filing_completed';
      eventDesc = 'FER Filing completed by ' + filerName;
    } else {
      throw new Error('No matching filer task found for completion');
    }
    
    // If form values are provided, include them in the update
    if (formValues) {
      // Convert boolean values to 0/1 for database
      Object.entries(formValues).forEach(([key, value]) => {
        if (key.startsWith('form_')) {
          updateFields[key] = value ? 1 : 0;
        }
      });
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updateFields)
      .eq('id', patentId);
      
    if (error) {
      throw error;
    }
    
    // Add a timeline entry
    await addPatentTimelineEntry(
      patentId,
      eventType,
      eventDesc,
      1,
      filerName
    );
    
    return true;
  } catch (error) {
    console.error('Error completing filer task:', error);
    throw error;
  }
};
