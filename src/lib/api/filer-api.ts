import { supabase } from "@/integrations/supabase/client";
import { Patent } from "@/lib/types";
import { toast } from "sonner";

export const fetchFilerPatents = async (filerName: string) => {
  try {
    // For PS filings - only show when PS drafting is completed AND IDF has been received
    const { data: psPatents, error: psError } = await supabase
      .from('patents')
      .select('*')
      .eq('ps_filer_assgn', filerName)
      .eq('ps_filing_status', 0)
      .eq('ps_drafting_status', 1)  // PS Drafting must be completed
      .is('withdrawn', false)
      .filter('idf_received', 'eq', true); // IDF must be received

    if (psError) throw psError;

    // For CS filings - only show when CS drafting is completed AND CS data has been received
    const { data: csPatents, error: csError } = await supabase
      .from('patents')
      .select('*')
      .eq('cs_filer_assgn', filerName)
      .eq('cs_filing_status', 0)
      .eq('cs_drafting_status', 1)  // CS Drafting must be completed
      .is('withdrawn', false)
      .filter('cs_data_received', 'eq', true)
      .filter('idf_received', 'eq', true); // Also ensure IDF has been received

    if (csError) throw csError;

    // Fetch FER entries assigned to this filer
    const { data: ferEntries, error: ferError } = await supabase
      .from('fer_entries')
      .select('*, patent:patents(*)')
      .eq('fer_filer_assgn', filerName)
      .eq('fer_filing_status', 0)
      .eq('fer_drafter_status', 1)  // FER Drafting must be completed
      .is('patent.withdrawn', false);

    if (ferError) throw ferError;

    // Combine the patents, identifying their type for UI display
    const combinedPatents = [
      ...psPatents.map(patent => ({ ...patent, filingType: 'ps' })),
      ...csPatents.map(patent => ({ ...patent, filingType: 'cs' })),
    ];

    // Transform FER entries into a compatible format
    const ferPatents = ferEntries.map(entry => ({
      ...entry.patent,
      fer_entry_id: entry.id,
      fer_number: entry.fer_number,
      filingType: 'fer'
    }));

    // Combine all patents
    return [...combinedPatents, ...ferPatents];
  } catch (error) {
    console.error('Error fetching filer patents:', error);
    throw error;
  }
};

export const completeFilerTask = async (patent: Patent, filerName: string, formValues: Record<string, boolean>) => {
  try {
    // Determine which task is being completed based on the patent's current status
    let taskType: 'ps' | 'cs' | 'fer' | null = null;

    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1) {
      taskType = 'ps';
    } else if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1) {
      taskType = 'cs';
    } else if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1) {
      taskType = 'fer';
    }

    if (!taskType) {
      console.warn('No matching task found for this user and patent.');
      return false;
    }

    // Start the database update
    const updates: { [key: string]: any } = {};

    if (taskType === 'ps') {
      updates.ps_filing_status = 1;
      updates.ps_review_file_status = 1;
      updates.ps_completion_status = 1;
    } else if (taskType === 'cs') {
      updates.cs_filing_status = 1;
      updates.cs_review_file_status = 1;
      updates.cs_completion_status = 1;
    } else if (taskType === 'fer') {
      updates.fer_filing_status = 1;
      updates.fer_review_file_status = 1;
      updates.fer_completion_status = 1;
    }

    // Update form values
    Object.keys(formValues).forEach(key => {
      updates[key] = formValues[key];
    });

    const { data, error } = await supabase
      .from('patents')
      .update(updates)
      .eq('id', patent.id)
      .select()
      .single();

    if (error) {
      console.error('Error completing filer task:', error);
      toast.error('Failed to complete filing task');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error completing filer task:', error);
    toast.error('An error occurred while completing the filing task');
    return false;
  }
};
