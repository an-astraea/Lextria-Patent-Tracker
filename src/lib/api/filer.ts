
import { supabase } from "@/integrations/supabase/client";
import { Patent, FEREntry } from "../types";
import { createTimelineEvent } from "./timeline";
import { normalizePatents } from "../utils/type-converters";

/**
 * Fetches assignments for a filer
 * @param filerName - Name of the filer
 * @returns Array of patent objects assigned to the filer
 */
export const fetchFilerAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`);
    
    if (error) {
      console.error('Error fetching filer assignments:', error);
      return [];
    }
    
    // Normalize the patents data
    const normalizedPatents = normalizePatents(data || []);
    
    // Filter only patents where the filer has pending tasks
    const filteredPatents = normalizedPatents.filter(patent => 
      // PS filer task is ready when PS drafting is complete
      (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1) ||
      // CS filer task is ready when CS drafting is complete
      (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1) ||
      // FER filer task is ready when FER drafting is complete
      (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_filer_assgn === filerName && entry.fer_filing_status === 0 && entry.fer_drafter_status === 1
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching filer assignments:', error);
    return [];
  }
};

/**
 * Fetches FER assignments for a filer
 * @param filerName - Name of the filer
 * @returns Array of FER entry objects assigned to the filer
 */
export const fetchFilerFERAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .select(`
        *,
        patent:patent_id (*)
      `)
      .eq('fer_filer_assgn', filerName)
      .eq('fer_filing_status', 0)
      .eq('fer_drafter_status', 1);
    
    if (error) {
      console.error('Error fetching filer FER assignments:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching filer FER assignments:', error);
    return [];
  }
};

/**
 * Fetches completed assignments for a filer
 * @param filerName - Name of the filer
 * @returns Array of patent objects completed by the filer
 */
export const fetchFilerCompletedAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`);
    
    if (error) {
      console.error('Error fetching filer completed assignments:', error);
      return [];
    }
    
    // Normalize the patents data
    const normalizedPatents = normalizePatents(data || []);
    
    // Filter only patents where the filer has completed tasks
    const filteredPatents = normalizedPatents.filter(patent => 
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

/**
 * Completes a filer task for a patent
 * @param patent - Patent object
 * @param filerName - Name of the filer
 * @param formData - Optional form field values
 * @returns Object with success status and message
 */
export const completeFilerTask = async (patent: Patent, filerName: string, formData?: Record<string, boolean>) => {
  try {
    let updateData: any = {};
    let timelineEventType = '';
    let timelineEventDesc = '';
    
    // Determine which filing task to complete based on assignment
    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
      updateData.ps_filing_status = 1;
      updateData.ps_review_file_status = 1;
      timelineEventType = 'ps_filing_completed';
      timelineEventDesc = `PS Filing completed by ${filerName}`;
    } else if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
      updateData.cs_filing_status = 1;
      updateData.cs_review_file_status = 1;
      timelineEventType = 'cs_filing_completed';
      timelineEventDesc = `CS Filing completed by ${filerName}`;
      
      // If form data is provided for CS filing, include it
      if (formData) {
        // Include all form data in the update
        Object.entries(formData).forEach(([key, value]) => {
          updateData[key] = value;
        });
      }
    } else if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0) {
      updateData.fer_filing_status = 1;
      updateData.fer_review_file_status = 1;
      timelineEventType = 'fer_filing_completed';
      timelineEventDesc = `FER Filing completed by ${filerName}`;
    } else if (patent.fer_entries && patent.fer_entries.some(fer => fer.fer_filer_assgn === filerName && fer.fer_filing_status === 0)) {
      // Handle FER entries separately
      const ferEntry = patent.fer_entries.find(fer => fer.fer_filer_assgn === filerName && fer.fer_filing_status === 0);
      if (ferEntry) {
        const result = await completeFERFilerTask(ferEntry, filerName);
        return result;
      }
    }
    
    // Include form data in all cases if provided, not just for CS
    if (formData && Object.keys(updateData).length > 0) {
      Object.entries(formData).forEach(([key, value]) => {
        // Don't overwrite status fields we already set
        if (!updateData[key]) {
          updateData[key] = value;
        }
      });
    }
    
    // Only update if we have fields to update
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error('Error completing filer task:', error);
        return { success: false, message: error.message };
      }
      
      // Create a timeline event
      await createTimelineEvent(
        patent.id, 
        timelineEventType, 
        timelineEventDesc, 
        1, 
        filerName
      );
    }
    
    return { success: true, message: 'Task completed successfully' };
  } catch (error: any) {
    console.error('Error completing filer task:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Completes a FER filer task
 * @param ferEntry - FER entry object
 * @param filerName - Name of the filer
 * @returns Object with success status and message
 */
export const completeFERFilerTask = async (ferEntry: FEREntry, filerName: string) => {
  try {
    // Update the FER entry
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_filing_status: 1, // Mark as completed
        fer_review_file_status: 1 // Mark as under review
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error('Error completing FER filer task:', error);
      return { success: false, message: error.message };
    }

    // Create a timeline event
    await createTimelineEvent(
      ferEntry.patent_id, 
      'FER Filing Completed', 
      `FER filing completed by ${filerName}`, 
      1, 
      filerName, 
      ferEntry.fer_filer_deadline
    );
    
    return { success: true, message: 'FER filing task completed successfully' };
  } catch (error: any) {
    console.error('Error completing FER filer task:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Updates patent form fields
 * @param patentId - ID of the patent
 * @param formData - Form field values
 * @returns Object with success status and message
 */
export const updatePatentForms = async (patentId: string, formData: Record<string, boolean>) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update(formData)
      .eq('id', patentId)
      .select();
    
    if (error) {
      console.error('Error updating patent forms:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Patent forms updated successfully' };
  } catch (error: any) {
    console.error('Error updating patent forms:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
