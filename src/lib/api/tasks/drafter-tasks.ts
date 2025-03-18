
import { supabase } from "@/integrations/supabase/client";
import { Patent } from "@/lib/types";
import { createTimelineEvent } from "../timeline-api";

/**
 * Completes a drafter task for a patent
 * @param patent - The patent object
 * @param drafterName - Name of the drafter completing the task
 * @returns Object with success status and message
 */
export const completeDrafterTask = async (patent: Patent, drafterName: string) => {
  try {
    console.log('Completing drafter task for patent:', patent.id);
    console.log('Drafter name:', drafterName);
    
    let updateFields: Record<string, any> = {};
    let timelineEventType = '';
    let timelineEventDesc = '';
    
    // Determine which type of task we're completing based on the drafter assignments
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      console.log('Completing PS drafting task');
      updateFields = { 
        ps_drafting_status: 1,
        ps_review_draft_status: 1
      };
      timelineEventType = 'ps_draft_completed';
      timelineEventDesc = `PS Drafting completed by ${drafterName}`;
    } else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      console.log('Completing CS drafting task');
      updateFields = { 
        cs_drafting_status: 1,
        cs_review_draft_status: 1
      };
      timelineEventType = 'cs_draft_completed';
      timelineEventDesc = `CS Drafting completed by ${drafterName}`;
    } else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      console.log('Completing FER drafting task');
      updateFields = { 
        fer_drafter_status: 1,
        fer_review_draft_status: 1
      };
      timelineEventType = 'fer_draft_completed';
      timelineEventDesc = `FER Drafting completed by ${drafterName}`;
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
    
    // Create timeline event
    await createTimelineEvent(
      patent.id, 
      timelineEventType, 
      timelineEventDesc, 
      1, 
      drafterName
    );
    
    console.log('Drafter task completed successfully');
    return { success: true, message: 'Task completed successfully' };
  } catch (error: any) {
    console.error('Exception completing drafter task:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
