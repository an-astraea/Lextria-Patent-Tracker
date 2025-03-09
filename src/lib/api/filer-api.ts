
import { supabase } from '@/integrations/supabase/client';
import { normalizePatents } from '@/lib/utils/type-converters';
import { Patent } from '@/lib/types';

// Function to fetch filer assignments
export const fetchFilerAssignments = async (userName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `);
    
    if (error) {
      console.error('Error fetching filer assignments:', error);
      return [];
    }
    
    // Normalize the patents data
    const normalizedPatents = normalizePatents(data || []);
    
    // Filter only patents where the filer has pending tasks
    // PS filer task is ready when PS drafting is complete AND IDF is received
    // CS filer task is ready when CS drafting is complete AND CS data is received
    const filteredPatents = normalizedPatents.filter(patent => 
      (patent.ps_filer_assgn === userName && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1 && patent.idf_received === true) ||
      (patent.cs_filer_assgn === userName && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1 && patent.cs_data_received === true) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_filer_assgn === userName && entry.fer_filing_status === 0 && entry.fer_drafter_status === 1
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching filer assignments:', error);
    return [];
  }
};

// Function to fetch completed assignments
export const fetchFilerCompletedAssignments = async (userName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `);
    
    if (error) {
      console.error('Error fetching filer completed assignments:', error);
      return [];
    }
    
    // Normalize the patents data
    const normalizedPatents = normalizePatents(data || []);
    
    // Filter only patents where the filer has completed tasks
    const filteredPatents = normalizedPatents.filter(patent => 
      (patent.ps_filer_assgn === userName && patent.ps_filing_status === 1) ||
      (patent.cs_filer_assgn === userName && patent.cs_filing_status === 1) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_filer_assgn === userName && entry.fer_filing_status === 1
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching filer completed assignments:', error);
    return [];
  }
};

// Function to complete a filing task
export const completeFilerTask = async (patent: Patent, userName: string, formData?: Record<string, boolean>) => {
  try {
    // Check if prerequisites are met
    // For PS filing, IDF must be received and PS drafting must be complete
    if (patent.ps_filer_assgn === userName && patent.ps_filing_status === 0) {
      if (!patent.idf_received) {
        console.error('Cannot complete PS filing: IDF not received');
        return { success: false, message: 'Cannot complete PS filing: IDF not received' };
      }
      if (patent.ps_drafting_status !== 1) {
        console.error('Cannot complete PS filing: PS drafting not complete');
        return { success: false, message: 'Cannot complete PS filing: PS drafting not complete' };
      }
    }
    
    // For CS filing, CS data must be received and CS drafting must be complete
    if (patent.cs_filer_assgn === userName && patent.cs_filing_status === 0) {
      if (!patent.cs_data_received) {
        console.error('Cannot complete CS filing: CS data not received');
        return { success: false, message: 'Cannot complete CS filing: CS data not received' };
      }
      if (patent.cs_drafting_status !== 1) {
        console.error('Cannot complete CS filing: CS drafting not complete');
        return { success: false, message: 'Cannot complete CS filing: CS drafting not complete' };
      }
    }
    
    const updateData: any = {};
    let timelineEventType = '';
    let timelineEventDesc = '';
    
    // Determine which filing task to complete based on assignment
    if (patent.ps_filer_assgn === userName && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1 && patent.idf_received) {
      updateData.ps_filing_status = 1;
      updateData.ps_review_file_status = 1;
      timelineEventType = 'ps_filing_completed';
      timelineEventDesc = `PS Filing completed by ${userName}`;
    } else if (patent.cs_filer_assgn === userName && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1 && patent.cs_data_received) {
      updateData.cs_filing_status = 1;
      updateData.cs_review_file_status = 1;
      timelineEventType = 'cs_filing_completed';
      timelineEventDesc = `CS Filing completed by ${userName}`;
      
      // If form data is provided for CS filing, include it
      if (formData) {
        // Include all form data in the update
        Object.entries(formData).forEach(([key, value]) => {
          updateData[key] = value;
        });
      }
    } else if (patent.fer_entries && patent.fer_entries.some(fer => fer.fer_filer_assgn === userName && fer.fer_filing_status === 0 && fer.fer_drafter_status === 1)) {
      // Handle FER entries separately
      const ferEntry = patent.fer_entries.find(fer => fer.fer_filer_assgn === userName && fer.fer_filing_status === 0 && fer.fer_drafter_status === 1);
      if (ferEntry) {
        const result = await completeFERFilerTask(ferEntry, userName);
        return { success: result, message: result ? 'FER filing completed successfully' : 'Failed to complete FER filing' };
      }
    }
    
    // Include form data in all cases if provided
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
      console.log('Updating patent with data:', updateData);
      
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error('Error completing filer task:', error);
        return { success: false, message: 'Failed to complete filing task' };
      }
      
      // Create a timeline event
      await createTimelineEvent(
        patent.id, 
        timelineEventType, 
        timelineEventDesc, 
        1, 
        userName
      );
      
      return { success: true, message: 'Filing task completed successfully' };
    }
    
    return { success: false, message: 'No task to complete' };
  } catch (error) {
    console.error('Error completing filer task:', error);
    return { success: false, message: 'An error occurred while completing the task' };
  }
};

// Helper function for timeline events (simplified version)
const createTimelineEvent = async (
  patentId: string, 
  eventType: string, 
  eventDescription: string,
  status: number,
  employeeName?: string,
  deadlineDate?: string
) => {
  try {
    const { error } = await supabase
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
      ]);
    
    if (error) {
      console.error('Error creating timeline event:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return false;
  }
};

// Helper function for FER filer tasks (simplified version)
const completeFERFilerTask = async (ferEntry: any, userName: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_filing_status: 1,
        fer_review_file_status: 1
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error('Error completing FER filer task:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error completing FER filer task:', error);
    return false;
  }
};
