
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches the patent timeline entries for a specific patent
 */
export const fetchPatentTimeline = async (patentId: string) => {
  try {
    const { data, error } = await supabase
      .from('patent_timeline')
      .select('*')
      .eq('patent_id', patentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching patent timeline:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchPatentTimeline:", error);
    return [];
  }
};

/**
 * Adds a new entry to the patent timeline
 */
export const addPatentTimelineEntry = async (
  patentId: string,
  eventType: string,
  eventDescription: string,
  status: number = 1,
  employeeName?: string,
  deadlineDate?: string
) => {
  try {
    const { data, error } = await supabase
      .from('patent_timeline')
      .insert([
        {
          patent_id: patentId,
          event_type: eventType,
          event_description: eventDescription,
          status,
          employee_name: employeeName,
          deadline_date: deadlineDate
        }
      ])
      .select();

    if (error) {
      console.error("Error adding patent timeline entry:", error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("Error in addPatentTimelineEntry:", error);
    return null;
  }
};
