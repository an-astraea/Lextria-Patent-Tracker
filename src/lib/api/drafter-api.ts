
import { supabase } from '@/integrations/supabase/client';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import { standardizePatent } from '@/lib/utils/type-converters';

/**
 * Fetches drafting assignments for a specific drafter by their name
 * @param drafterName - The name of the drafter to fetch assignments for
 * @returns An array of patent assignments for the drafter
 */
export const fetchDrafterAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    // First, fetch patents where the drafter is assigned as PS drafter
    const { data: psAssignments, error: psError } = await supabase
      .from('patents')
      .select('*, inventors(*)')
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`)
      .order('created_at', { ascending: false });

    if (psError) {
      console.error('Error fetching drafter assignments:', psError);
      throw new Error('Failed to fetch drafting assignments');
    }

    // For each patent, fetch the timeline information and standardize the data
    const patentsWithTimeline = await Promise.all(
      psAssignments.map(async (patent) => {
        // Fetch timeline entries for this patent
        const { data: timeline, error: timelineError } = await supabase
          .from('patent_timeline')
          .select('*')
          .eq('patent_id', patent.id)
          .order('created_at', { ascending: false });

        if (timelineError) {
          console.error('Error fetching patent timeline:', timelineError);
          return standardizePatent(patent); // Return patent without timeline if there's an error
        }

        // Return standardized patent with timeline data
        return standardizePatent({
          ...patent,
          timeline: timeline || []
        });
      })
    );

    // Filter patents based on IDF received status for PS drafting
    const filteredPatents = patentsWithTimeline.filter(patent => {
      // For PS drafting, require IDF to be received
      if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
        return patent.idf_received === true;
      }
      
      // For CS drafting, require PS drafting to be completed and CS data received
      if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
        return patent.cs_data_received === true;
      }
      
      // For FER drafting tasks
      if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
        return true; // No specific prerequisites for FER drafting
      }
      
      return true; // Include all other assignments
    });

    return filteredPatents;
  } catch (error) {
    console.error('Error in fetchDrafterAssignments:', error);
    throw error;
  }
};

/**
 * Fetches completed drafting assignments for a specific drafter
 * @param drafterName - The name of the drafter to fetch completed assignments for
 * @returns An array of completed patent assignments
 */
export const fetchDrafterCompletedAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    // Fetch patents where this drafter has completed drafting work
    const { data: completedAssignments, error: fetchError } = await supabase
      .from('patents')
      .select('*, inventors(*)')
      .or(
        `and(ps_drafter_assgn.eq.${drafterName},ps_drafting_status.eq.1),` +
        `and(cs_drafter_assgn.eq.${drafterName},cs_drafting_status.eq.1),` +
        `and(fer_drafter_assgn.eq.${drafterName},fer_drafter_status.eq.1)`
      )
      .order('updated_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching completed drafting assignments:', fetchError);
      throw new Error('Failed to fetch completed drafting assignments');
    }

    // For each patent, fetch the timeline information and standardize the data
    const patentsWithTimeline = await Promise.all(
      completedAssignments.map(async (patent) => {
        const { data: timeline, error: timelineError } = await supabase
          .from('patent_timeline')
          .select('*')
          .eq('patent_id', patent.id)
          .order('created_at', { ascending: false });

        if (timelineError) {
          console.error('Error fetching patent timeline:', timelineError);
          return standardizePatent(patent);
        }

        return standardizePatent({
          ...patent,
          timeline: timeline || []
        });
      })
    );

    return patentsWithTimeline;
  } catch (error) {
    console.error('Error in fetchDrafterCompletedAssignments:', error);
    throw error;
  }
};

/**
 * Completes a drafting task for a patent
 * @param patent - The patent to mark drafting as complete
 * @param drafterName - The name of the drafter completing the task
 * @returns true if successful, false otherwise
 */
export const completeDrafterTask = async (patent: Patent, drafterName: string): Promise<boolean> => {
  try {
    // Determine which drafting task to complete based on the drafter's assignment
    let updateObject: any = {};
    let taskType = '';
    
    // Check prerequisites before allowing task completion
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      // Check if IDF has been received for PS drafting
      if (!patent.idf_received) {
        toast.error('Cannot complete PS drafting: IDF has not been received yet');
        return false;
      }
      
      updateObject = { 
        ps_drafting_status: 1,
        ps_review_draft_status: 1 
      };
      taskType = 'PS';
    } 
    else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      // Check if CS data has been received for CS drafting
      if (!patent.cs_data_received) {
        toast.error('Cannot complete CS drafting: CS data has not been received yet');
        return false;
      }
      
      updateObject = { 
        cs_drafting_status: 1,
        cs_review_draft_status: 1 
      };
      taskType = 'CS';
    } 
    else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      updateObject = { 
        fer_drafter_status: 1,
        fer_review_draft_status: 1 
      };
      taskType = 'FER';
    } 
    else {
      console.error('Drafter is not assigned to this patent or task is already completed');
      toast.error('You are not assigned to this drafting task or it has already been completed');
      return false;
    }
    
    // Update the patent status
    const { error } = await supabase
      .from('patents')
      .update(updateObject)
      .eq('id', patent.id);
    
    if (error) {
      console.error(`Error completing ${taskType} drafting task:`, error);
      toast.error(`Failed to complete ${taskType} drafting: ${error.message}`);
      return false;
    }
    
    toast.success(`${taskType} drafting completed and sent for review`);
    return true;
  } catch (error) {
    console.error('Error in completeDrafterTask:', error);
    return false;
  }
};
