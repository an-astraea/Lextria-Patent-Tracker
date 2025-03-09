
import { supabase } from "@/integrations/supabase/client";
import { FEREntry } from "../types";

// Workflow functions for Filers
export const fetchFilerAssignments = async (filerId: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_filer_assgn.eq.${filerId},cs_filer_assgn.eq.${filerId}`)
      .or('ps_filing_status.eq.0,cs_filing_status.eq.0')
      .eq('ps_review_file_status', 0)
      .eq('cs_review_file_status', 0)
      .or('ps_drafting_status.eq.1,cs_drafting_status.eq.1');
    
    if (error) {
      console.error("Error fetching filer assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    return { patents: data };
  } catch (error: any) {
    console.error("Exception fetching filer assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const fetchFilerCompletedAssignments = async (filerId: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_filer_assgn.eq.${filerId},cs_filer_assgn.eq.${filerId}`)
      .or('ps_filing_status.eq.1,cs_filing_status.eq.1');
    
    if (error) {
      console.error("Error fetching completed filer assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    return { patents: data };
  } catch (error: any) {
    console.error("Exception fetching completed filer assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const fetchFilerFERAssignments = async (filerId: string) => {
  try {
    // First get patents with fer_status = 1
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .eq('fer_status', 1);
    
    if (error) {
      console.error("Error fetching FER assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    // Filter to only include patents with FER entries assigned to this filer
    const filteredPatents = data.filter(patent => 
      patent.fer_entries && 
      patent.fer_entries.some((entry: any) => 
        entry.fer_filer_assgn === filerId && 
        entry.fer_filing_status === 0 &&
        entry.fer_drafter_status === 1 // Only show if drafting is complete
      )
    );
    
    return { patents: filteredPatents };
  } catch (error: any) {
    console.error("Exception fetching FER assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const completeFilerTask = async (patentId: string, taskType: 'ps' | 'cs', formData?: Record<string, boolean>) => {
  try {
    let updateData: any = {};
    
    if (taskType === 'ps') {
      updateData = { 
        ps_filing_status: 1,
        ps_review_file_status: 1
      };
    } else {
      updateData = { 
        cs_filing_status: 1,
        cs_review_file_status: 1
      };
      
      // Add form data for CS filing
      if (formData) {
        updateData = { ...updateData, ...formData };
      }
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patentId);
    
    if (error) {
      console.error("Error completing filer task:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception completing filer task:", error);
    return { error: error.message, success: false };
  }
};

export const completeFERFilerTask = async (ferEntry: FEREntry) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({ 
        fer_filing_status: 1,
        fer_review_file_status: 1
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error("Error completing FER filer task:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception completing FER filer task:", error);
    return { error: error.message, success: false };
  }
};

export const completeFERFiling = async (ferId: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({ 
        fer_filing_status: 1,
        fer_review_file_status: 1
      })
      .eq('id', ferId);
    
    if (error) {
      console.error("Error completing FER filing task:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception completing FER filing task:", error);
    return { error: error.message, success: false };
  }
};
