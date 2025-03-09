
import { supabase } from '@/integrations/supabase/client';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Fetches filing assignments for a specific filer by their name
 * @param filerName - The name of the filer to fetch assignments for
 * @returns An array of patent assignments for the filer
 */
export const fetchFilerAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    // First, fetch patents where the filer is assigned
    const { data: assignments, error: fetchError } = await supabase
      .from('patents')
      .select('*, inventors(*)')
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching filer assignments:', fetchError);
      throw new Error('Failed to fetch filing assignments');
    }

    // For each patent, fetch the timeline information
    const patentsWithTimeline = await Promise.all(
      assignments.map(async (patent) => {
        // Fetch timeline entries for this patent
        const { data: timeline, error: timelineError } = await supabase
          .from('patent_timeline')
          .select('*')
          .eq('patent_id', patent.id)
          .order('created_at', { ascending: false });

        if (timelineError) {
          console.error('Error fetching patent timeline:', timelineError);
          return patent; // Return patent without timeline if there's an error
        }

        // Return patent with timeline data
        return {
          ...patent,
          timeline: timeline || []
        };
      })
    );

    // Filter patents based on drafting status for corresponding filing
    const filteredPatents = patentsWithTimeline.filter(patent => {
      // For PS filing, require PS drafting to be completed
      if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
        return patent.ps_drafting_status === 1;
      }
      
      // For CS filing, require CS drafting to be completed
      if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
        return patent.cs_drafting_status === 1;
      }
      
      // For FER filing tasks
      if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0) {
        return patent.fer_drafter_status === 1;
      }
      
      return true; // Include all other assignments
    });

    return filteredPatents;
  } catch (error) {
    console.error('Error in fetchFilerAssignments:', error);
    throw error;
  }
};

/**
 * Fetches completed filing assignments for a specific filer
 * @param filerName - The name of the filer to fetch completed assignments for
 * @returns An array of completed patent assignments
 */
export const fetchFilerCompletedAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    // Fetch patents where this filer has completed filing work
    const { data: completedAssignments, error: fetchError } = await supabase
      .from('patents')
      .select('*, inventors(*)')
      .or(
        `and(ps_filer_assgn.eq.${filerName},ps_filing_status.eq.1),` +
        `and(cs_filer_assgn.eq.${filerName},cs_filing_status.eq.1),` +
        `and(fer_filer_assgn.eq.${filerName},fer_filing_status.eq.1)`
      )
      .order('updated_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching completed filing assignments:', fetchError);
      throw new Error('Failed to fetch completed filing assignments');
    }

    // For each patent, fetch the timeline information
    const patentsWithTimeline = await Promise.all(
      completedAssignments.map(async (patent) => {
        const { data: timeline, error: timelineError } = await supabase
          .from('patent_timeline')
          .select('*')
          .eq('patent_id', patent.id)
          .order('created_at', { ascending: false });

        if (timelineError) {
          console.error('Error fetching patent timeline:', timelineError);
          return patent;
        }

        return {
          ...patent,
          timeline: timeline || []
        };
      })
    );

    return patentsWithTimeline;
  } catch (error) {
    console.error('Error in fetchFilerCompletedAssignments:', error);
    throw error;
  }
};

/**
 * Completes a filing task for a patent
 * @param patent - The patent to mark filing as complete
 * @param filerName - The name of the filer completing the task
 * @returns true if successful, false otherwise
 */
export const completeFilerTask = async (patent: Patent, filerName: string): Promise<boolean> => {
  try {
    // Determine which filing task to complete based on the filer's assignment
    let updateObject: any = {};
    let taskType = '';
    
    // Check prerequisites before allowing task completion
    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
      // Check if PS drafting has been completed for PS filing
      if (patent.ps_drafting_status !== 1) {
        toast.error('Cannot complete PS filing: PS drafting has not been completed yet');
        return false;
      }
      
      updateObject = { 
        ps_filing_status: 1,
        ps_review_file_status: 1
      };
      taskType = 'PS';
    } 
    else if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
      // Check if CS drafting has been completed for CS filing
      if (patent.cs_drafting_status !== 1) {
        toast.error('Cannot complete CS filing: CS drafting has not been completed yet');
        return false;
      }
      
      updateObject = { 
        cs_filing_status: 1,
        cs_review_file_status: 1
      };
      taskType = 'CS';
    } 
    else if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0) {
      // Check if FER drafting has been completed for FER filing
      if (patent.fer_drafter_status !== 1) {
        toast.error('Cannot complete FER filing: FER drafting has not been completed yet');
        return false;
      }
      
      updateObject = { 
        fer_filing_status: 1,
        fer_review_file_status: 1
      };
      taskType = 'FER';
    } 
    else {
      console.error('Filer is not assigned to this patent or task is already completed');
      toast.error('You are not assigned to this filing task or it has already been completed');
      return false;
    }
    
    // Update the patent status
    const { error } = await supabase
      .from('patents')
      .update(updateObject)
      .eq('id', patent.id);
    
    if (error) {
      console.error(`Error completing ${taskType} filing task:`, error);
      toast.error(`Failed to complete ${taskType} filing: ${error.message}`);
      return false;
    }
    
    toast.success(`${taskType} filing completed and sent for review`);
    return true;
  } catch (error) {
    console.error('Error in completeFilerTask:', error);
    return false;
  }
};
