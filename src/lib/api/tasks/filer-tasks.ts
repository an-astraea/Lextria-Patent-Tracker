
import { supabase } from "@/integrations/supabase/client";
import { Patent } from "@/lib/types";
import { createTimelineEvent } from "../timeline-api";

/**
 * Completes a filer task for a patent
 * @param patent - The patent object
 * @param filerName - Name of the filer completing the task
 * @param formValues - Optional form values to update
 * @returns Object with success status and message
 */
export const completeFilerTask = async (
  patent: Patent, 
  filerName: string, 
  formValues?: Record<string, boolean>
) => {
  try {
    console.log('Completing filer task for patent:', patent.id);
    console.log('Filer name:', filerName);
    
    let updateFields: Record<string, any> = {};
    let timelineEventType = '';
    let timelineEventDesc = '';
    
    // Determine which type of task we're completing based on the filer assignments
    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1) {
      console.log('Completing PS filing task');
      updateFields = { 
        ps_filing_status: 1,
        ps_review_file_status: 1
      };
      timelineEventType = 'ps_filing_completed';
      timelineEventDesc = `PS Filing completed by ${filerName}`;
    } else if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1) {
      console.log('Completing CS filing task');
      updateFields = { 
        cs_filing_status: 1,
        cs_review_file_status: 1
      };
      timelineEventType = 'cs_filing_completed';
      timelineEventDesc = `CS Filing completed by ${filerName}`;
    } else if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1) {
      console.log('Completing FER filing task');
      updateFields = { 
        fer_filing_status: 1,
        fer_review_file_status: 1
      };
      timelineEventType = 'fer_filing_completed';
      timelineEventDesc = `FER Filing completed by ${filerName}`;
    } else {
      console.error('No matching filer task found for completion');
      return { success: false, message: 'No matching filer task found for completion' };
    }
    
    // If form values are provided, include them in the update
    if (formValues) {
      console.log('Including form values in update:', formValues);
      
      // Convert boolean values to 0/1 for database if needed
      Object.entries(formValues).forEach(([key, value]) => {
        if (key.startsWith('form_')) {
          updateFields[key] = value;
        }
      });
    }
    
    console.log('Final update fields:', updateFields);
    
    const { data, error } = await supabase
      .from('patents')
      .update(updateFields)
      .eq('id', patent.id);
      
    if (error) {
      console.error('Error completing filer task:', error);
      return { success: false, message: error.message };
    }
    
    // Create timeline event
    await createTimelineEvent(
      patent.id, 
      timelineEventType, 
      timelineEventDesc, 
      1, 
      filerName
    );
    
    console.log('Filer task completed successfully');
    return { success: true, message: 'Task completed successfully' };
  } catch (error: any) {
    console.error('Exception completing filer task:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
