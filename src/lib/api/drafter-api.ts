
import { supabase } from '@/integrations/supabase/client';
import { normalizePatents } from '@/lib/utils/type-converters';
import { Patent } from '@/lib/types';

// Function to fetch drafter assignments
export const fetchDrafterAssignments = async (userName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `);
    
    if (error) {
      console.error('Error fetching drafter assignments:', error);
      return [];
    }
    
    // Normalize the patents data
    const normalizedPatents = normalizePatents(data || []);
    
    // Filter only patents where the drafter has pending tasks
    // For PS tasks, check that IDF is received
    // For CS tasks, check that CS data is received
    const filteredPatents = normalizedPatents.filter(patent => 
      (patent.ps_drafter_assgn === userName && patent.ps_drafting_status === 0 && patent.idf_received === true) ||
      (patent.cs_drafter_assgn === userName && patent.cs_drafting_status === 0 && patent.cs_data_received === true) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_drafter_assgn === userName && entry.fer_drafter_status === 0
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching drafter assignments:', error);
    return [];
  }
};

// Function to fetch completed assignments
export const fetchDrafterCompletedAssignments = async (userName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `);
    
    if (error) {
      console.error('Error fetching drafter completed assignments:', error);
      return [];
    }
    
    // Normalize the patents data
    const normalizedPatents = normalizePatents(data || []);
    
    // Filter only patents where the drafter has completed tasks
    const filteredPatents = normalizedPatents.filter(patent => 
      (patent.ps_drafter_assgn === userName && patent.ps_drafting_status === 1) ||
      (patent.cs_drafter_assgn === userName && patent.cs_drafting_status === 1) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_drafter_assgn === userName && entry.fer_drafter_status === 1
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching drafter completed assignments:', error);
    return [];
  }
};

// Function to complete a drafting task
export const completeDrafterTask = async (patent: Patent, userName: string) => {
  try {
    // Check if prerequisites are met
    // For PS drafting, IDF must be received
    if (patent.ps_drafter_assgn === userName && patent.ps_drafting_status === 0) {
      if (!patent.idf_received) {
        console.error('Cannot complete PS drafting: IDF not received');
        return { success: false, message: 'Cannot complete PS drafting: IDF not received' };
      }
    }
    
    // For CS drafting, CS data must be received
    if (patent.cs_drafter_assgn === userName && patent.cs_drafting_status === 0) {
      if (!patent.cs_data_received) {
        console.error('Cannot complete CS drafting: CS data not received');
        return { success: false, message: 'Cannot complete CS drafting: CS data not received' };
      }
    }
    
    const updateData: any = {};
    let timelineEventType = '';
    let timelineEventDesc = '';
    
    // Determine which drafting task to complete based on assignment
    if (patent.ps_drafter_assgn === userName && patent.ps_drafting_status === 0 && patent.idf_received) {
      updateData.ps_drafting_status = 1;
      updateData.ps_review_draft_status = 1;
      timelineEventType = 'ps_draft_completed';
      timelineEventDesc = `PS Drafting completed by ${userName}`;
    } else if (patent.cs_drafter_assgn === userName && patent.cs_drafting_status === 0 && patent.cs_data_received) {
      updateData.cs_drafting_status = 1;
      updateData.cs_review_draft_status = 1;
      timelineEventType = 'cs_draft_completed';
      timelineEventDesc = `CS Drafting completed by ${userName}`;
    } else if (patent.fer_entries && patent.fer_entries.some(fer => fer.fer_drafter_assgn === userName && fer.fer_drafter_status === 0)) {
      // Handle FER entries separately
      const ferEntry = patent.fer_entries.find(fer => fer.fer_drafter_assgn === userName && fer.fer_drafter_status === 0);
      if (ferEntry) {
        const result = await completeFERDrafterTask(ferEntry, userName);
        return { success: result, message: result ? 'FER drafting completed successfully' : 'Failed to complete FER drafting' };
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
        return { success: false, message: 'Failed to complete drafting task' };
      }
      
      // Create a timeline event
      await createTimelineEvent(
        patent.id, 
        timelineEventType, 
        timelineEventDesc, 
        1, 
        userName
      );
      
      return { success: true, message: 'Drafting task completed successfully' };
    }
    
    return { success: false, message: 'No task to complete' };
  } catch (error) {
    console.error('Error completing drafter task:', error);
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

// Helper function for FER drafter tasks (simplified version)
const completeFERDrafterTask = async (ferEntry: any, userName: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_drafter_status: 1,
        fer_review_draft_status: 1
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error('Error completing FER drafter task:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error completing FER drafter task:', error);
    return false;
  }
};
