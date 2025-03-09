
import { supabase } from './client';

// Function to fetch patent timeline
export const fetchPatentTimeline = async (patentId: string) => {
  const { data, error } = await supabase
    .from('patent_timeline')
    .select('*')
    .eq('patent_id', patentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patent timeline:', error);
    return [];
  }

  return data;
};

// Function to create a timeline event
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
      .from('patent_timeline')
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
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return null;
  }
};
