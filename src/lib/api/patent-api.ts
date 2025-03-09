
import { supabase } from '../supabase';
import { Patent, PatentFormData, InventorFormData, FEREntry, TimelineEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Fetch all patents
export const fetchPatents = async (): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)');

    if (error) {
      console.error('Error fetching patents:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching patents:', error);
    return [];
  }
};

// Fetch a patent by ID
export const fetchPatentById = async (id: string): Promise<Patent | null> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, inventors(*), fer_entries(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching patent by ID:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching patent by ID:', error);
    return null;
  }
};

// Add a new patent
export const addPatent = async (patent: Patent): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('patents').insert(patent);

    if (error) {
      console.error('Error adding patent:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding patent:', error);
    return false;
  }
};

// Update a patent
export const updatePatent = async (id: string, patent: Partial<Patent>): Promise<boolean> => {
  try {
    const { error } = await supabase.from('patents').update(patent).eq('id', id);

    if (error) {
      console.error('Error updating patent:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating patent:', error);
    return false;
  }
};

// Delete a patent
export const deletePatent = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('patents').delete().eq('id', id);

    if (error) {
      console.error('Error deleting patent:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting patent:', error);
    return false;
  }
};

// Create a new patent
export const createPatent = async (formData: PatentFormData): Promise<Patent | null> => {
  try {
    const newPatent = {
      id: uuidv4(),
      tracking_id: formData.tracking_id,
      patent_applicant: formData.patent_applicant,
      client_id: formData.client_id,
      application_no: formData.application_no || null,
      date_of_filing: formData.date_of_filing,
      patent_title: formData.patent_title,
      applicant_addr: formData.applicant_addr,
      inventor_ph_no: formData.inventor_ph_no,
      inventor_email: formData.inventor_email,
      ps_drafting_status: 0,
      ps_drafter_assgn: formData.ps_drafter_assgn || null,
      ps_drafter_deadline: formData.ps_drafter_deadline || null,
      ps_review_draft_status: 0,
      ps_filing_status: 0,
      ps_filer_assgn: formData.ps_filer_assgn || null,
      ps_filer_deadline: formData.ps_filer_deadline || null,
      ps_review_file_status: 0,
      ps_completion_status: 0,
      cs_drafting_status: 0,
      cs_drafter_assgn: formData.cs_drafter_assgn || null,
      cs_drafter_deadline: formData.cs_drafter_deadline || null,
      cs_review_draft_status: 0,
      cs_filing_status: 0,
      cs_filer_assgn: formData.cs_filer_assgn || null,
      cs_filer_deadline: formData.cs_filer_deadline || null,
      cs_review_file_status: 0,
      cs_completion_status: 0,
      fer_status: formData.fer_status || 0,
      fer_drafter_status: 0,
      fer_drafter_assgn: formData.fer_drafter_assgn || null,
      fer_drafter_deadline: formData.fer_drafter_deadline || null,
      fer_review_draft_status: 0,
      fer_filing_status: 0,
      fer_filer_assgn: formData.fer_filer_assgn || null,
      fer_filer_deadline: formData.fer_filer_deadline || null,
      fer_review_file_status: 0,
      fer_completion_status: 0,
      notes: formData.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('patents').insert([newPatent]).select().single();

    if (error) {
      console.error('Error creating patent:', error);
      throw error;
    }

    // If inventors data is present, create inventors
    if (formData.inventors && formData.inventors.length > 0) {
      for (const inventor of formData.inventors) {
        await createInventor({
          tracking_id: formData.tracking_id,
          inventor_name: inventor.inventor_name,
          inventor_addr: inventor.inventor_addr
        });
      }
    }

    return data;
  } catch (error) {
    console.error('Error creating patent:', error);
    return null;
  }
};

// Create a new inventor
export const createInventor = async (inventor: { tracking_id: string; inventor_name: string; inventor_addr: string }): Promise<boolean> => {
  try {
    const newInventor = {
      id: uuidv4(),
      tracking_id: inventor.tracking_id,
      inventor_name: inventor.inventor_name,
      inventor_addr: inventor.inventor_addr
    };

    const { error } = await supabase.from('inventors').insert([newInventor]);

    if (error) {
      console.error('Error creating inventor:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error creating inventor:', error);
    return false;
  }
};

// Update patent notes
export const updatePatentNotes = async (id: string, notes: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating patent notes:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating patent notes:', error);
    return false;
  }
};

// Update patent forms
export const updatePatentForms = async (id: string, formData: Record<string, boolean>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating patent forms:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating patent forms:', error);
    return false;
  }
};

// Update patent status
export const updatePatentStatus = async (id: string, statusField: string, newValue: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ [statusField]: newValue, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating patent status:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating patent status:', error);
    return false;
  }
};

// Fetch patent timeline
export const fetchPatentTimeline = async (id: string): Promise<TimelineEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('patent_timeline')
      .select('*')
      .eq('patent_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patent timeline:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching patent timeline:', error);
    return [];
  }
};

// Create a new FER entry
export const createFEREntry = async (
  patentId: string,
  ferNumber: number,
  ferDrafter?: string,
  ferDrafterDeadline?: string,
  ferFiler?: string,
  ferFilerDeadline?: string,
  ferDate?: string,
): Promise<FEREntry | null> => {
  try {
    const newFEREntry = {
      id: uuidv4(),
      patent_id: patentId,
      fer_number: ferNumber,
      fer_date: ferDate || null,
      fer_drafter_assgn: ferDrafter || null,
      fer_drafter_deadline: ferDrafterDeadline || null,
      fer_drafter_status: 0,
      fer_review_draft_status: 0,
      fer_filing_status: 0,
      fer_filer_assgn: ferFiler || null,
      fer_filer_deadline: ferFilerDeadline || null,
      fer_review_file_status: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('fer_entries')
      .insert([newFEREntry])
      .select()
      .single();

    if (error) {
      console.error('Error creating FER entry:', error);
      throw error;
    }

    // Update the patent's fer_status to 1 if not already set
    await supabase
      .from('patents')
      .update({ fer_status: 1, updated_at: new Date().toISOString() })
      .eq('id', patentId);

    return data;
  } catch (error) {
    console.error('Error creating FER entry:', error);
    return null;
  }
};

// Update FER entry
export const updateFEREntry = async (
  id: string,
  ferData: Partial<FEREntry>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({ ...ferData, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating FER entry:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating FER entry:', error);
    return false;
  }
};

// Delete FER entry
export const deleteFEREntry = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting FER entry:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting FER entry:', error);
    return false;
  }
};
