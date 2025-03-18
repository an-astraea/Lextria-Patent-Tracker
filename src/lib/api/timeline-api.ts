
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a timeline event for a patent
 * @param patentId - ID of the patent
 * @param eventType - Type of event
 * @param eventDescription - Description of the event
 * @param status - Status code (usually 1 for complete)
 * @param employeeName - Optional name of employee involved
 * @param deadlineDate - Optional deadline date
 * @returns Timeline event object or null on error
 */
export const createTimelineEvent = async (
  patentId: string, 
  eventType: string, 
  eventDescription: string,
  status: number,
  employeeName?: string,
  deadlineDate?: string
) => {
  try {
    const { data, error } = await supabase
      .from('patient_timeline')
      .insert([
        {
          patent_id: patentId,
          event_type: eventType,
          event_description: eventDescription,
          status: status,
          employee_name: employeeName,
          deadline_date: deadlineDate
        },
      ])
      .select();
    
    if (error) {
      console.error('Error creating timeline event:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Timeline event created successfully', data: data?.[0] || null };
  } catch (error: any) {
    console.error('Error creating timeline event:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Fetches timeline events for a patent
 * @param patentId - ID of the patent
 * @returns Array of timeline events
 */
export const fetchPatentTimeline = async (patentId: string) => {
  try {
    const { data, error } = await supabase
      .from('patient_timeline')
      .select('*')
      .eq('patent_id', patentId)
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching patent timeline:', error);
      return { success: false, message: error.message, data: [] };
    }
  
    return { success: true, message: 'Timeline fetched successfully', data: data || [] };
  } catch (error: any) {
    console.error('Error fetching patent timeline:', error);
    return { success: false, message: error.message || 'An unexpected error occurred', data: [] };
  }
};
