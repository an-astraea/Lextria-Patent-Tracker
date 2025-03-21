
import { supabase } from '@/integrations/supabase/client';
import { Patent } from '@/lib/types';
import { fetchPatentById } from '../patent-api';
import { addPatentTimelineEntry } from '../timeline-api';

export const fetchDrafterTasks = async (drafterName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching drafter tasks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchDrafterTasks:', error);
    return [];
  }
};

export const fetchDrafterCompletedTasks = async (drafterName: string) => {
  try {
    // Fetch PS drafts completed by the drafter
    const { data: psDrafts, error: psError } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*)
      `)
      .eq('ps_drafter_assgn', drafterName)
      .eq('ps_drafting_status', 1)
      .order('created_at', { ascending: false });

    if (psError) {
      console.error('Error fetching PS completed drafts:', psError);
      return [];
    }

    // Fetch CS drafts completed by the drafter
    const { data: csDrafts, error: csError } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*)
      `)
      .eq('cs_drafter_assgn', drafterName)
      .eq('cs_drafting_status', 1)
      .order('created_at', { ascending: false });

    if (csError) {
      console.error('Error fetching CS completed drafts:', csError);
      return [];
    }

    // Fetch FER drafts completed by the drafter
    const { data: ferDrafts, error: ferError } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*)
      `)
      .eq('fer_drafter_assgn', drafterName)
      .eq('fer_drafter_status', 1)
      .order('created_at', { ascending: false });

    if (ferError) {
      console.error('Error fetching FER completed drafts:', ferError);
      return [];
    }

    // Combine all completed drafts
    const allCompletedDrafts = [...(psDrafts || []), ...(csDrafts || []), ...(ferDrafts || [])];

    // Sort by updated_at (most recent first)
    allCompletedDrafts.sort((a, b) => {
      return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    });

    return allCompletedDrafts;
  } catch (error) {
    console.error('Error in fetchDrafterCompletedTasks:', error);
    return [];
  }
};

export const completeDrafterTask = async (patentId: string, drafterName: string) => {
  try {
    // First, fetch the patent to determine what type of task is being completed
    const patent = await fetchPatentById(patentId);
    
    if (!patent) {
      throw new Error('Patent not found');
    }
    
    let updateFields: Record<string, any> = {};
    let eventType = '';
    let eventDesc = '';
    
    // Determine which type of task we're completing based on the drafter assignments
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      updateFields = { ps_drafting_status: 1, ps_review_draft_status: 1 };
      eventType = 'ps_drafting_completed';
      eventDesc = 'PS Drafting completed by ' + drafterName;
    } else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      updateFields = { cs_drafting_status: 1, cs_review_draft_status: 1 };
      eventType = 'cs_drafting_completed';
      eventDesc = 'CS Drafting completed by ' + drafterName;
    } else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      updateFields = { fer_drafter_status: 1, fer_review_draft_status: 1 };
      eventType = 'fer_drafting_completed';
      eventDesc = 'FER Drafting completed by ' + drafterName;
    } else {
      throw new Error('No matching drafter task found for completion');
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updateFields)
      .eq('id', patentId);
      
    if (error) {
      throw error;
    }
    
    // Add a timeline entry
    await addPatentTimelineEntry(
      patentId,
      eventType,
      eventDesc,
      1,
      drafterName
    );
    
    return true;
  } catch (error) {
    console.error('Error completing drafter task:', error);
    throw error;
  }
};
