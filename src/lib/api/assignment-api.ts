
import { supabase } from '../supabase';
import { Patent, FEREntry } from '../types';

// Fetch drafter assignments
export const fetchDrafterAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    const { data: psAssignments, error: psError } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('ps_drafter_assgn', drafterName)
      .eq('ps_drafting_status', 0);

    const { data: csAssignments, error: csError } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('cs_drafter_assgn', drafterName)
      .eq('cs_drafting_status', 0);

    if (psError || csError) {
      console.error('Error fetching drafter assignments:', psError || csError);
      throw psError || csError;
    }

    return [...(psAssignments || []), ...(csAssignments || [])];
  } catch (error) {
    console.error('Error fetching drafter assignments:', error);
    return [];
  }
};

// Fetch completed drafter assignments
export const fetchDrafterCompletedAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    const { data: psCompleted, error: psError } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('ps_drafter_assgn', drafterName)
      .eq('ps_drafting_status', 1);

    const { data: csCompleted, error: csError } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('cs_drafter_assgn', drafterName)
      .eq('cs_drafting_status', 1);

    if (psError || csError) {
      console.error('Error fetching completed drafter assignments:', psError || csError);
      throw psError || csError;
    }

    return [...(psCompleted || []), ...(csCompleted || [])];
  } catch (error) {
    console.error('Error fetching completed drafter assignments:', error);
    return [];
  }
};

// Fetch filer assignments
export const fetchFilerAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    const { data: psAssignments, error: psError } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('ps_filer_assgn', filerName)
      .eq('ps_filing_status', 0);

    const { data: csAssignments, error: csError } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('cs_filer_assgn', filerName)
      .eq('cs_filing_status', 0);

    if (psError || csError) {
      console.error('Error fetching filer assignments:', psError || csError);
      throw psError || csError;
    }

    return [...(psAssignments || []), ...(csAssignments || [])];
  } catch (error) {
    console.error('Error fetching filer assignments:', error);
    return [];
  }
};

// Fetch completed filer assignments
export const fetchFilerCompletedAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    const { data: psCompleted, error: psError } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('ps_filer_assgn', filerName)
      .eq('ps_filing_status', 1);

    const { data: csCompleted, error: csError } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('cs_filer_assgn', filerName)
      .eq('cs_filing_status', 1);

    if (psError || csError) {
      console.error('Error fetching completed filer assignments:', psError || csError);
      throw psError || csError;
    }

    return [...(psCompleted || []), ...(csCompleted || [])];
  } catch (error) {
    console.error('Error fetching completed filer assignments:', error);
    return [];
  }
};

// Fetch FER filer assignments
export const fetchFilerFERAssignments = async (filerName: string): Promise<{ patent: Patent; ferEntry: FEREntry }[]> => {
  try {
    // First, get patents with FER entries
    const { data: patents, error: patentsError } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('fer_status', 1);

    if (patentsError) {
      console.error('Error fetching FER assignments:', patentsError);
      throw patentsError;
    }

    // Filter patents with FER entries assigned to this filer
    const results: { patent: Patent; ferEntry: FEREntry }[] = [];

    if (patents) {
      for (const patent of patents) {
        if (patent.fer_entries) {
          for (const ferEntry of patent.fer_entries) {
            if (ferEntry.fer_filer_assgn === filerName && 
                ferEntry.fer_filing_status === 0 &&
                ferEntry.fer_drafter_status === 1) {
              results.push({ patent, ferEntry });
            }
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error fetching FER filer assignments:', error);
    return [];
  }
};

// Complete drafter task
export const completeDrafterTask = async (
  patent: Patent,
  draftType: 'ps' | 'cs',
  userName: string
): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (draftType === 'ps') {
      updates.ps_review_draft_status = 1;
    } else {
      updates.cs_review_draft_status = 1;
    }

    const { error } = await supabase
      .from('patents')
      .update(updates)
      .eq('id', patent.id);

    if (error) {
      console.error('Error completing drafter task:', error);
      throw error;
    }

    // Add timeline event
    await supabase.from('patent_timeline').insert([
      {
        patent_id: patent.id,
        event_type: `${draftType}_draft_completed`,
        event_description: `${draftType.toUpperCase()} Draft completed by ${userName}`,
        status: 1,
        created_at: new Date().toISOString()
      }
    ]);

    return true;
  } catch (error) {
    console.error('Error completing drafter task:', error);
    return false;
  }
};

// Complete FER drafter task
export const completeFERDrafterTask = async (ferEntry: FEREntry, userName: string): Promise<boolean> => {
  try {
    // Update FER entry
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_review_draft_status: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', ferEntry.id);

    if (error) {
      console.error('Error completing FER drafter task:', error);
      throw error;
    }

    // Fetch patent info for timeline
    const { data: patent } = await supabase
      .from('patents')
      .select('id')
      .eq('id', ferEntry.patent_id)
      .single();

    if (patent) {
      // Add timeline event
      await supabase.from('patent_timeline').insert([
        {
          patent_id: patent.id,
          event_type: 'fer_draft_completed',
          event_description: `FER #${ferEntry.fer_number} Draft completed by ${userName}`,
          status: 1,
          created_at: new Date().toISOString()
        }
      ]);
    }

    return true;
  } catch (error) {
    console.error('Error completing FER drafter task:', error);
    return false;
  }
};

// Complete filer task
export const completeFilerTask = async (
  patent: Patent,
  filingType: 'ps' | 'cs',
  userName: string
): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (filingType === 'ps') {
      updates.ps_review_file_status = 1;
    } else {
      updates.cs_review_file_status = 1;
    }

    const { error } = await supabase
      .from('patents')
      .update(updates)
      .eq('id', patent.id);

    if (error) {
      console.error('Error completing filer task:', error);
      throw error;
    }

    // Add timeline event
    await supabase.from('patent_timeline').insert([
      {
        patent_id: patent.id,
        event_type: `${filingType}_filing_completed`,
        event_description: `${filingType.toUpperCase()} Filing completed by ${userName}`,
        status: 1,
        created_at: new Date().toISOString()
      }
    ]);

    return true;
  } catch (error) {
    console.error('Error completing filer task:', error);
    return false;
  }
};

// Complete FER filer task
export const completeFERFilerTask = async (ferEntry: FEREntry, userName: string): Promise<boolean> => {
  try {
    // Update FER entry
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_review_file_status: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', ferEntry.id);

    if (error) {
      console.error('Error completing FER filer task:', error);
      throw error;
    }

    // Fetch patent info for timeline
    const { data: patent } = await supabase
      .from('patents')
      .select('id')
      .eq('id', ferEntry.patent_id)
      .single();

    if (patent) {
      // Add timeline event
      await supabase.from('patent_timeline').insert([
        {
          patent_id: patent.id,
          event_type: 'fer_filing_completed',
          event_description: `FER #${ferEntry.fer_number} Filing completed by ${userName}`,
          status: 1,
          created_at: new Date().toISOString()
        }
      ]);
    }

    return true;
  } catch (error) {
    console.error('Error completing FER filer task:', error);
    return false;
  }
};

// Approve patent review
export const approvePatentReview = async (
  patent: Patent,
  reviewType: 'draft' | 'file',
  stage: 'ps' | 'cs'
): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (reviewType === 'draft') {
      updates[`${stage}_review_draft_status`] = 0;
      updates[`${stage}_drafting_status`] = 1;
    } else {
      updates[`${stage}_review_file_status`] = 0;
      updates[`${stage}_filing_status`] = 1;
    }

    // Check if both drafting and filing for this stage are complete
    if (stage === 'ps' && 
        (updates.ps_drafting_status === 1 || patent.ps_drafting_status === 1) && 
        (updates.ps_filing_status === 1 || patent.ps_filing_status === 1)) {
      updates.ps_completion_status = 1;
    } else if (stage === 'cs' && 
               (updates.cs_drafting_status === 1 || patent.cs_drafting_status === 1) && 
               (updates.cs_filing_status === 1 || patent.cs_filing_status === 1)) {
      updates.cs_completion_status = 1;
    }

    const { error } = await supabase
      .from('patents')
      .update(updates)
      .eq('id', patent.id);

    if (error) {
      console.error('Error approving patent review:', error);
      throw error;
    }

    // Add timeline event
    await supabase.from('patent_timeline').insert([
      {
        patent_id: patent.id,
        event_type: `${stage}_${reviewType}_approved`,
        event_description: `${stage.toUpperCase()} ${reviewType === 'draft' ? 'Draft' : 'Filing'} approved by admin`,
        status: 1,
        created_at: new Date().toISOString()
      }
    ]);

    return true;
  } catch (error) {
    console.error('Error approving patent review:', error);
    return false;
  }
};

// Approve FER review
export const approveFERReview = async (
  ferEntry: FEREntry,
  reviewType: 'draft' | 'file'
): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (reviewType === 'draft') {
      updates.fer_review_draft_status = 0;
      updates.fer_drafter_status = 1;
    } else {
      updates.fer_review_file_status = 0;
      updates.fer_filing_status = 1;
    }

    const { error } = await supabase
      .from('fer_entries')
      .update(updates)
      .eq('id', ferEntry.id);

    if (error) {
      console.error('Error approving FER review:', error);
      throw error;
    }

    // Fetch patent info for timeline
    const { data: patent } = await supabase
      .from('patents')
      .select('id, fer_entries(*)')
      .eq('id', ferEntry.patent_id)
      .single();

    if (patent) {
      // Add timeline event
      await supabase.from('patent_timeline').insert([
        {
          patent_id: patent.id,
          event_type: `fer_${reviewType}_approved`,
          event_description: `FER #${ferEntry.fer_number} ${reviewType === 'draft' ? 'Draft' : 'Filing'} approved by admin`,
          status: 1,
          created_at: new Date().toISOString()
        }
      ]);

      // Check if all FER entries are complete and update patent status if needed
      if (patent.fer_entries && reviewType === 'file') {
        const allComplete = patent.fer_entries.every(
          (fer: FEREntry) => fer.fer_drafter_status === 1 && fer.fer_filing_status === 1
        );

        if (allComplete) {
          await supabase
            .from('patents')
            .update({
              fer_completion_status: 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', patent.id);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error approving FER review:', error);
    return false;
  }
};

// Reject patent review
export const rejectPatentReview = async (
  patent: Patent,
  reviewType: 'draft' | 'file',
  stage: 'ps' | 'cs',
  reason: string
): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (reviewType === 'draft') {
      updates[`${stage}_review_draft_status`] = 0;
    } else {
      updates[`${stage}_review_file_status`] = 0;
    }

    const { error } = await supabase
      .from('patents')
      .update(updates)
      .eq('id', patent.id);

    if (error) {
      console.error('Error rejecting patent review:', error);
      throw error;
    }

    // Add timeline event
    await supabase.from('patent_timeline').insert([
      {
        patent_id: patent.id,
        event_type: `${stage}_${reviewType}_rejected`,
        event_description: `${stage.toUpperCase()} ${reviewType === 'draft' ? 'Draft' : 'Filing'} rejected by admin. Reason: ${reason}`,
        status: 0,
        created_at: new Date().toISOString()
      }
    ]);

    return true;
  } catch (error) {
    console.error('Error rejecting patent review:', error);
    return false;
  }
};

// Fetch pending reviews for admin
export const fetchPendingReviews = async (): Promise<Patent[]> => {
  try {
    const { data: reviews, error } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .or('ps_review_draft_status.eq.1,ps_review_file_status.eq.1,cs_review_draft_status.eq.1,cs_review_file_status.eq.1');

    if (error) {
      console.error('Error fetching pending reviews:', error);
      throw error;
    }

    // Get patents with FER entries pending review
    const { data: ferPatents, error: ferError } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('fer_status', 1);

    if (ferError) {
      console.error('Error fetching FER pending reviews:', ferError);
      throw ferError;
    }

    // Filter only patents with FER entries that have pending reviews
    const ferReviewPatents = ferPatents ? ferPatents.filter(patent => 
      patent.fer_entries && patent.fer_entries.some(entry => 
        entry.fer_review_draft_status === 1 || entry.fer_review_file_status === 1
      )
    ) : [];

    // Combine both sets of pending reviews, avoiding duplicates
    const combinedReviews = [...(reviews || [])];
    
    // Add FER review patents if they're not already in the list
    for (const ferPatent of ferReviewPatents) {
      if (!combinedReviews.some(p => p.id === ferPatent.id)) {
        combinedReviews.push(ferPatent);
      }
    }

    return combinedReviews;
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return [];
  }
};
