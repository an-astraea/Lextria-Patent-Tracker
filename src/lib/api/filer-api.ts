
import { supabase } from "@/integrations/supabase/client";
import { FEREntry } from "@/lib/types";

export const getFilerTasks = async (filerId: string) => {
  try {
    // Get patents where the user is assigned as a filer
    const { data: psFilerPatents, error: psFilerError } = await supabase
      .from('patents')
      .select('*')
      .eq('ps_filer_assgn', filerId)
      .eq('ps_filing_status', 0)
      .eq('ps_drafting_status', 1);

    const { data: csFilerPatents, error: csFilerError } = await supabase
      .from('patents')
      .select('*')
      .eq('cs_filer_assgn', filerId)
      .eq('cs_filing_status', 0)
      .eq('cs_drafting_status', 1);

    const { data: ferFilerPatents, error: ferFilerError } = await supabase
      .from('patents')
      .select('*')
      .eq('fer_filer_assgn', filerId)
      .eq('fer_filing_status', 0)
      .eq('fer_drafter_status', 1);

    if (psFilerError || csFilerError || ferFilerError) {
      console.error('Error fetching filer tasks:', psFilerError || csFilerError || ferFilerError);
      return { error: psFilerError || csFilerError || ferFilerError };
    }

    return {
      ps_filings: psFilerPatents || [],
      cs_filings: csFilerPatents || [],
      fer_filings: ferFilerPatents || []
    };
  } catch (error) {
    console.error('Error in getFilerTasks:', error);
    return { error };
  }
};

export const completePSFiling = async (patentId: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update({
        ps_filing_status: 1,
        ps_review_file_status: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', patentId)
      .select();

    if (error) {
      console.error('Error completing PS filing:', error);
      return { error };
    }

    return { success: true, patent: data[0] };
  } catch (error) {
    console.error('Error in completePSFiling:', error);
    return { error };
  }
};

export const completeCSFiling = async (patentId: string, formData: Record<string, boolean>) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update({
        cs_filing_status: 1,
        cs_review_file_status: 1,
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('id', patentId)
      .select();

    if (error) {
      console.error('Error completing CS filing:', error);
      return { error };
    }

    return { success: true, patent: data[0] };
  } catch (error) {
    console.error('Error in completeCSFiling:', error);
    return { error };
  }
};

export const completeFERFiling = async (ferEntryId: string) => {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .update({
        fer_filing_status: 1,
        fer_review_file_status: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', ferEntryId)
      .select();

    if (error) {
      console.error('Error completing FER filing:', error);
      return { error };
    }

    return { success: true, fer: data[0] };
  } catch (error) {
    console.error('Error in completeFERFiling:', error);
    return { error };
  }
};
