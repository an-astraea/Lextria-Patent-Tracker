
import { supabase } from "@/integrations/supabase/client";
import { Patent, FEREntry } from "../types";
import { createTimelineEvent } from "./timeline";
import { normalizePatents } from "../utils/type-converters";

/**
 * Fetches assignments for a drafter
 * @param drafterName - Name of the drafter
 * @returns Array of patent objects assigned to the drafter
 */
export const fetchDrafterAssignments = async (drafterName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`);
    
    if (error) {
      console.error('Error fetching drafter assignments:', error);
      return [];
    }
    
    // Normalize the patents data
    const normalizedPatents = normalizePatents(data || []);
    
    // Filter only patents where the drafter has pending tasks
    const filteredPatents = normalizedPatents.filter(patent => 
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

/**
 * Fetches completed assignments for a drafter
 * @param drafterName - Name of the drafter
 * @returns Array of patent objects completed by the drafter
 */
export const fetchDrafterCompletedAssignments = async (drafterName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`);
    
    if (error) {
      console.error('Error fetching drafter completed assignments:', error);
      return [];
    }
    
    // Normalize the patents data
    const normalizedPatents = normalizePatents(data || []);
    
    // Filter only patents where the drafter has completed tasks
    const filteredPatents = normalizedPatents.filter(patent => 
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

/**
 * Completes a drafter task for a patent
 * @param patent - Patent object
 * @param drafterName - Name of the drafter
 * @returns Object with success status and message
 */
export const completeDrafterTask = async (patent: Patent, drafterName: string) => {
  try {
    let updateData: any = {};
    let timelineEventType = '';
    let timelineEventDesc = '';
    
    // Determine which drafting task to complete based on assignment
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      updateData.ps_drafting_status = 1;
      updateData.ps_review_draft_status = 1;
      timelineEventType = 'ps_draft_completed';
      timelineEventDesc = `PS Drafting completed by ${drafterName}`;
    } else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      updateData.cs_drafting_status = 1;
      updateData.cs_review_draft_status = 1;
      timelineEventType = 'cs_draft_completed';
      timelineEventDesc = `CS Drafting completed by ${drafterName}`;
    } else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      updateData.fer_drafter_status = 1;
      updateData.fer_review_draft_status = 1;
      timelineEventType = 'fer_draft_completed';
      timelineEventDesc = `FER Drafting completed by ${drafterName}`;
    } else if (patent.fer_entries && patent.fer_entries.some(fer => fer.fer_drafter_assgn === drafterName && fer.fer_drafter_status === 0)) {
      // Handle FER entries separately
      const ferEntry = patent.fer_entries.find(fer => fer.fer_drafter_assgn === drafterName && fer.fer_drafter_status === 0);
      if (ferEntry) {
        const result = await completeFERDrafterTask(ferEntry, drafterName);
        return result;
      }
    }
    
    // Only update if we have fields to update
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error('Error completing drafter task:', error);
        return { success: false, message: error.message };
      }
      
      // Create a timeline event
      await createTimelineEvent(
        patent.id, 
        timelineEventType, 
        timelineEventDesc, 
        1, 
        drafterName
      );
    }
    
    return { success: true, message: 'Task completed successfully' };
  } catch (error: any) {
    console.error('Error completing drafter task:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Completes a FER drafter task
 * @param ferEntry - FER entry object
 * @param drafterName - Name of the drafter
 * @returns Object with success status and message
 */
export const completeFERDrafterTask = async (ferEntry: FEREntry, drafterName: string) => {
  try {
    // Update the FER entry
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_drafter_status: 1, // Mark as completed
        fer_review_draft_status: 1 // Mark as under review
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error('Error completing FER drafter task:', error);
      return { success: false, message: error.message };
    }

    // Create a timeline event
    await createTimelineEvent(
      ferEntry.patent_id, 
      'FER Drafting Completed', 
      `FER drafting completed by ${drafterName}`, 
      1, 
      drafterName, 
      ferEntry.fer_drafter_deadline
    );
    
    return { success: true, message: 'FER drafting task completed successfully' };
  } catch (error: any) {
    console.error('Error completing FER drafter task:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
