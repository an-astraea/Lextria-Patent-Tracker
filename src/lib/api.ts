
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { PatentFormData, EmployeeFormData, Inventor, FEREntry } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to fetch all patents
export async function fetchPatents() {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patents:', error);
      return { patents: [], error: error.message };
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return { patents: [], error: 'An unexpected error occurred' };
  }
}

// Function to fetch a single patent by ID
export async function fetchPatentById(id: string) {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching patent by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return null;
  }
}

// Function to fetch all employees
export async function fetchEmployees() {
    try {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching employees:', error);
            return [];
        }

        return data;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return [];
    }
}

// Function to fetch an employee by ID
export async function fetchEmployeeById(id: string) {
    try {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching employee by ID:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return null;
    }
}

// Function to create a new patent
export async function createPatent(patent: PatentFormData) {
  try {
    const { data, error } = await supabase
      .from('patents')
      .insert([patent])
      .select()
      .single();

    if (error) {
      console.error('Error creating patent:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return null;
  }
}

// Function to update an existing patent
export async function updatePatent(id: string, updates: PatentFormData) {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating patent:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to delete a patent
export async function deletePatent(id: string) {
  try {
    const { error } = await supabase
      .from('patents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting patent:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to create a new employee
export async function createEmployee(employee: EmployeeFormData) {
    try {
        const { data, error } = await supabase
            .from('employees')
            .insert([employee])
            .select()
            .single();

        if (error) {
            console.error('Error creating employee:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return null;
    }
}

// Function to update an existing employee
export async function updateEmployee(id: string, updates: EmployeeFormData) {
    try {
        const { data, error } = await supabase
            .from('employees')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating employee:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return false;
    }
}

// Function to delete an employee
export async function deleteEmployee(id: string) {
    try {
        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting employee:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return false;
    }
}

// Function to create a new inventor
export async function createInventor(inventor: Omit<Inventor, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('inventors')
      .insert([inventor])
      .select()
      .single();

    if (error) {
      console.error('Error creating inventor:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return null;
  }
}

// Function to fetch patent timeline
export async function fetchPatentTimeline(patentId: string) {
  try {
    const { data, error } = await supabase
      .from('patient_timeline')
      .select('*')
      .eq('patent_id', patentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patent timeline:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return [];
  }
}

// Function to update patent forms
export async function updatePatentForms(patentId: string, formData: Record<string, boolean>) {
  try {
    const { error } = await supabase
      .from('patents')
      .update(formData)
      .eq('id', patentId);

    if (error) {
      console.error('Error updating patent forms:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to create a new FER entry
export async function createFEREntry(
  patentId: string,
  ferNumber: number,
  ferDrafter: string | undefined,
  ferDrafterDeadline: string | undefined,
  ferFiler: string | undefined,
  ferFilerDeadline: string | undefined,
  ferDate?: string | undefined
): Promise<FEREntry | null> {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .insert([{
        patent_id: patentId,
        fer_number: ferNumber,
        fer_drafter_assgn: ferDrafter || null,
        fer_drafter_deadline: ferDrafterDeadline || null,
        fer_filer_assgn: ferFiler || null,
        fer_filer_deadline: ferFilerDeadline || null,
        fer_date: ferDate || null,
        fer_drafter_status: 0, // Set initial status to pending
        fer_filing_status: 0,   // Set initial status to pending
        fer_review_draft_status: 0, // Set initial review status to pending
        fer_review_file_status: 0, // Set initial review status to pending
        fer_completion_status: 0 // Set initial completion status to pending
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating FER entry:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return null;
  }
}

// Function to update an existing FER entry
export async function updateFEREntry(ferId: string, updates: Partial<FEREntry>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update(updates)
      .eq('id', ferId);

    if (error) {
      console.error('Error updating FER entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to delete a FER entry
export async function deleteFEREntry(ferId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .delete()
      .eq('id', ferId);

    if (error) {
      console.error('Error deleting FER entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to complete FER drafter task
export async function completeFERDrafterTask(ferEntry: FEREntry, employeeName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({ 
        fer_drafter_status: 1, // Mark as completed
        fer_review_draft_status: 1 // Mark as submitted for review
      })
      .eq('id', ferEntry.id);

    if (error) {
      console.error('Error completing FER drafter task:', error);
      return false;
    }

    // Create timeline event
    await createTimelineEvent(ferEntry.patent_id, 'FER Draft Completed', `FER draft completed by ${employeeName}`, 1, employeeName, ferEntry.fer_drafter_deadline);

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to complete FER filer task
export async function completeFERFilerTask(ferEntry: FEREntry, employeeName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({ 
        fer_filing_status: 1, // Mark as completed
        fer_review_file_status: 1 // Mark as submitted for review
      })
      .eq('id', ferEntry.id);

    if (error) {
      console.error('Error completing FER filer task:', error);
      return false;
    }

    // Create timeline event
    await createTimelineEvent(ferEntry.patent_id, 'FER Filing Completed', `FER filing completed by ${employeeName}`, 1, employeeName, ferEntry.fer_filer_deadline);

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to approve FER review
export async function approveFERReview(ferEntry: FEREntry, stage: 'draft' | 'file'): Promise<boolean> {
  try {
    let updateData: { fer_review_draft_status?: number; fer_review_file_status?: number; fer_completion_status?: number } = {};

    if (stage === 'draft') {
      updateData = { fer_review_draft_status: 2 }; // Mark draft review as approved
    } else if (stage === 'file') {
      updateData = { 
        fer_review_file_status: 2, // Mark file review as approved
        fer_completion_status: 1 // Mark FER as completed
      };

      // Check if all FER entries are complete
      const patent = await fetchPatentById(ferEntry.patent_id);
      if (patent && patent.fer_entries) {
        const allFERsComplete = patent.fer_entries.every(entry => entry.fer_completion_status === 1);

        if (allFERsComplete) {
          // Update the patent's FER completion status
          await supabase
            .from('patents')
            .update({ fer_completion_status: 1 })
            .eq('id', ferEntry.patent_id);
        }
      }
    }

    const { error } = await supabase
      .from('fer_entries')
      .update(updateData)
      .eq('id', ferEntry.id);

    if (error) {
      console.error(`Error approving FER ${stage} review:`, error);
      return false;
    }

    // Create timeline event
    await createTimelineEvent(ferEntry.patent_id, `FER ${stage} Approved`, `FER ${stage} review approved`, 2);

    return true;
  } catch (error) {
    console.error(`An unexpected error occurred while approving FER ${stage} review:`, error);
    return false;
  }
}

// Function to create a timeline event
async function createTimelineEvent(
  patentId: string,
  eventType: string,
  eventDescription: string,
  status: number,
  employeeName?: string,
  deadlineDate?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patient_timeline')
      .insert([{
        patent_id: patentId,
        event_type: eventType,
        event_description: eventDescription,
        status: status,
        employee_name: employeeName,
        deadline_date: deadlineDate
      }]);

    if (error) {
      console.error('Error creating timeline event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to fetch pending reviews
export async function fetchPendingReviews() {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .or('ps_review_draft_status.eq.1,ps_review_file_status.eq.1,cs_review_draft_status.eq.1,cs_review_file_status.eq.1,fer_review_draft_status.eq.1,fer_review_file_status.eq.1')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending reviews:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return [];
  }
}

// Function to approve patent review
export async function approvePatentReview(patent: any, reviewType: string): Promise<boolean> {
  try {
    const updateData: any = {};
    let timelineType = '';
    let timelineDescription = '';

    switch (reviewType) {
      case 'ps_draft':
        updateData.ps_review_draft_status = 2; // Mark as approved
        timelineType = 'PS Draft Approved';
        timelineDescription = 'Provisional specification draft approved';
        break;
      case 'ps_file':
        updateData.ps_review_file_status = 2; // Mark as approved
        updateData.ps_completion_status = 1; // Mark as completed
        timelineType = 'PS Filing Approved';
        timelineDescription = 'Provisional specification filing approved';
        break;
      case 'cs_draft':
        updateData.cs_review_draft_status = 2; // Mark as approved
        timelineType = 'CS Draft Approved';
        timelineDescription = 'Complete specification draft approved';
        break;
      case 'cs_file':
        updateData.cs_review_file_status = 2; // Mark as approved
        updateData.cs_completion_status = 1; // Mark as completed
        timelineType = 'CS Filing Approved';
        timelineDescription = 'Complete specification filing approved';
        break;
      case 'fer_draft':
        // Handle FER draft separately
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find((entry: any) => entry.fer_review_draft_status === 1);
          if (ferEntry) {
            return approveFERReview(ferEntry, 'draft');
          }
        }
        return false;
      case 'fer_file':
        // Handle FER filing separately
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find((entry: any) => entry.fer_review_file_status === 1);
          if (ferEntry) {
            return approveFERReview(ferEntry, 'file');
          }
        }
        return false;
      default:
        console.error('Unknown review type:', reviewType);
        return false;
    }

    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patent.id);

    if (error) {
      console.error('Error approving review:', error);
      return false;
    }

    // Create timeline event
    await createTimelineEvent(patent.id, timelineType, timelineDescription, 2);

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to reject patent review
export async function rejectPatentReview(patent: any, reviewType: string): Promise<boolean> {
  try {
    const updateData: any = {};
    let timelineType = '';
    let timelineDescription = '';
    let assigneeName = '';

    switch (reviewType) {
      case 'ps_draft':
        updateData.ps_review_draft_status = 0; // Mark as rejected/pending
        updateData.ps_drafting_status = 0; // Reset drafting status
        timelineType = 'PS Draft Rejected';
        timelineDescription = 'Provisional specification draft rejected';
        assigneeName = patent.ps_drafter_assgn;
        break;
      case 'ps_file':
        updateData.ps_review_file_status = 0; // Mark as rejected/pending
        updateData.ps_filing_status = 0; // Reset filing status
        timelineType = 'PS Filing Rejected';
        timelineDescription = 'Provisional specification filing rejected';
        assigneeName = patent.ps_filer_assgn;
        break;
      case 'cs_draft':
        updateData.cs_review_draft_status = 0; // Mark as rejected/pending
        updateData.cs_drafting_status = 0; // Reset drafting status
        timelineType = 'CS Draft Rejected';
        timelineDescription = 'Complete specification draft rejected';
        assigneeName = patent.cs_drafter_assgn;
        break;
      case 'cs_file':
        updateData.cs_review_file_status = 0; // Mark as rejected/pending
        updateData.cs_filing_status = 0; // Reset filing status
        timelineType = 'CS Filing Rejected';
        timelineDescription = 'Complete specification filing rejected';
        assigneeName = patent.cs_filer_assgn;
        break;
      case 'fer_draft':
        // Handle FER draft separately
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find((entry: any) => entry.fer_review_draft_status === 1);
          if (ferEntry) {
            const { error } = await supabase
              .from('fer_entries')
              .update({ 
                fer_review_draft_status: 0,
                fer_drafter_status: 0
              })
              .eq('id', ferEntry.id);

            if (error) {
              console.error('Error rejecting FER draft review:', error);
              return false;
            }

            await createTimelineEvent(
              patent.id, 
              'FER Draft Rejected', 
              `FER draft #${ferEntry.fer_number} rejected`, 
              3, 
              ferEntry.fer_drafter_assgn
            );

            return true;
          }
        }
        return false;
      case 'fer_file':
        // Handle FER filing separately
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find((entry: any) => entry.fer_review_file_status === 1);
          if (ferEntry) {
            const { error } = await supabase
              .from('fer_entries')
              .update({ 
                fer_review_file_status: 0,
                fer_filing_status: 0
              })
              .eq('id', ferEntry.id);

            if (error) {
              console.error('Error rejecting FER filing review:', error);
              return false;
            }

            await createTimelineEvent(
              patent.id, 
              'FER Filing Rejected', 
              `FER filing #${ferEntry.fer_number} rejected`, 
              3, 
              ferEntry.fer_filer_assgn
            );

            return true;
          }
        }
        return false;
      default:
        console.error('Unknown review type:', reviewType);
        return false;
    }

    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patent.id);

    if (error) {
      console.error('Error rejecting review:', error);
      return false;
    }

    // Create timeline event
    await createTimelineEvent(patent.id, timelineType, timelineDescription, 3, assigneeName);

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Functions for Drafter pages
export async function fetchDrafterAssignments(drafterName: string) {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching drafter assignments:', error);
      return [];
    }

    return data.filter(patent => {
      // Include patents where drafter is assigned and:
      // 1. PS drafting is not completed, or
      // 2. CS drafting is not completed, or
      // 3. FER drafting is not completed
      const psDraftPending = patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0;
      const csDraftPending = patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0;
      const ferDraftPending = patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0;
      
      // Check IDF received status for PS/CS drafts
      const idfReceived = patent.idf_received === true;
      const csDataReceived = patent.cs_data_received === true || !patent.ps_drafter_assgn; // CS data received or no PS stage
      
      // For PS stage, only need IDF received
      const psEligible = psDraftPending && idfReceived;
      
      // For CS stage, need IDF received AND cs_data_received
      const csEligible = csDraftPending && idfReceived && csDataReceived;
      
      // FER doesn't depend on IDF or CS data
      const ferEligible = ferDraftPending;
      
      return psEligible || csEligible || ferEligible;
    });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return [];
  }
}

export async function fetchDrafterCompletedAssignments(drafterName: string) {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching drafter completed assignments:', error);
      return [];
    }

    return data.filter(patent => {
      // Include patents where:
      // 1. PS drafting is completed, or
      // 2. CS drafting is completed, or
      // 3. FER drafting is completed
      const psDraftCompleted = patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 1;
      const csDraftCompleted = patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 1;
      
      // For FER need to check the fer_entries
      let ferDraftCompleted = false;
      if (patent.fer_entries && patent.fer_entries.length > 0) {
        ferDraftCompleted = patent.fer_entries.some((entry: any) => 
          entry.fer_drafter_assgn === drafterName && entry.fer_drafter_status === 1
        );
      }
      
      return psDraftCompleted || csDraftCompleted || ferDraftCompleted;
    });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return [];
  }
}

export async function completeDrafterTask(patent: any, employeeName: string): Promise<boolean> {
  try {
    const updateData: any = {};
    let timelineType = '';
    let timelineDescription = '';
    let deadline = null;

    // Determine which drafting task is being completed
    if (patent.ps_drafter_assgn === employeeName && patent.ps_drafting_status === 0) {
      updateData.ps_drafting_status = 1;
      updateData.ps_review_draft_status = 1;
      timelineType = 'PS Draft Completed';
      timelineDescription = 'Provisional specification draft completed';
      deadline = patent.ps_drafter_deadline;
    } else if (patent.cs_drafter_assgn === employeeName && patent.cs_drafting_status === 0) {
      updateData.cs_drafting_status = 1;
      updateData.cs_review_draft_status = 1;
      timelineType = 'CS Draft Completed';
      timelineDescription = 'Complete specification draft completed';
      deadline = patent.cs_drafter_deadline;
    } else if (patent.fer_drafter_assgn === employeeName && patent.fer_drafter_status === 0) {
      // For FER, need to handle FER entries
      if (patent.fer_entries && patent.fer_entries.length > 0) {
        const ferEntry = patent.fer_entries.find((entry: any) => 
          entry.fer_drafter_assgn === employeeName && entry.fer_drafter_status === 0
        );
        
        if (ferEntry) {
          return completeFERDrafterTask(ferEntry, employeeName);
        }
      }
      
      // If no FER entry found, update patent level status
      updateData.fer_drafter_status = 1;
      updateData.fer_review_draft_status = 1;
      timelineType = 'FER Draft Completed';
      timelineDescription = 'First Examination Report draft completed';
      deadline = patent.fer_drafter_deadline;
    } else {
      console.error('No pending drafting task found for employee:', employeeName);
      return false;
    }

    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patent.id);

    if (error) {
      console.error('Error completing drafting task:', error);
      return false;
    }

    // Create timeline event
    await createTimelineEvent(patent.id, timelineType, timelineDescription, 1, employeeName, deadline);

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Functions for Filer pages
export async function fetchFilerAssignments(filerName: string) {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching filer assignments:', error);
      return [];
    }

    return data.filter(patent => {
      // Only show patents where:
      // 1. PS filing is not completed and PS drafting is completed, or
      // 2. CS filing is not completed and CS drafting is completed, or
      // 3. FER filing is not completed and FER drafting is completed
      const psFileEligible = patent.ps_filer_assgn === filerName && 
                             patent.ps_filing_status === 0 && 
                             patent.ps_drafting_status === 1 &&
                             patent.ps_review_draft_status === 2; // Draft approved
      
      const csFileEligible = patent.cs_filer_assgn === filerName && 
                             patent.cs_filing_status === 0 && 
                             patent.cs_drafting_status === 1 &&
                             patent.cs_review_draft_status === 2; // Draft approved
      
      // FER should be filtered out from here and handled separately
      const ferFileEligible = patent.fer_filer_assgn === filerName && 
                              patent.fer_filing_status === 0 && 
                              patent.fer_drafter_status === 1;
      
      return psFileEligible || csFileEligible || ferFileEligible;
    });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return [];
  }
}

export async function fetchFilerCompletedAssignments(filerName: string) {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching filer completed assignments:', error);
      return [];
    }

    return data.filter(patent => {
      // Include patents where:
      // 1. PS filing is completed, or
      // 2. CS filing is completed, or
      // 3. FER filing is completed
      const psFileCompleted = patent.ps_filer_assgn === filerName && patent.ps_filing_status === 1;
      const csFileCompleted = patent.cs_filer_assgn === filerName && patent.cs_filing_status === 1;
      
      // For FER need to check the fer_entries
      let ferFileCompleted = false;
      if (patent.fer_entries && patent.fer_entries.length > 0) {
        ferFileCompleted = patent.fer_entries.some((entry: any) => 
          entry.fer_filer_assgn === filerName && entry.fer_filing_status === 1
        );
      }
      
      return psFileCompleted || csFileCompleted || ferFileCompleted;
    });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return [];
  }
}

export async function fetchFilerFERAssignments(filerName: string) {
  try {
    // First get all patents with FER entries
    const { data: patents, error: patentsError } = await supabase
      .from('patents')
      .select(`
        id,
        tracking_id,
        patent_title,
        patent_applicant
      `);

    if (patentsError) {
      console.error('Error fetching patents for FER assignments:', patentsError);
      return [];
    }

    // Get FER entries for the filer
    const { data: ferEntries, error: ferError } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('fer_filer_assgn', filerName)
      .eq('fer_filing_status', 0)
      .eq('fer_drafter_status', 1)
      .eq('fer_review_draft_status', 2);  // Only show entries where drafting is reviewed and approved

    if (ferError) {
      console.error('Error fetching FER entries for filer:', ferError);
      return [];
    }

    // Attach patent details to each FER entry
    const ferAssignments = ferEntries.map(entry => {
      const patent = patents.find(p => p.id === entry.patent_id);
      return {
        ...entry,
        patent
      };
    });

    return ferAssignments;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return [];
  }
}

export async function completeFilerTask(
  patent: any, 
  employeeName: string,
  formData?: Record<string, boolean>
): Promise<boolean> {
  try {
    const updateData: any = {};
    let timelineType = '';
    let timelineDescription = '';
    let deadline = null;

    // Determine which filing task is being completed
    if (patent.ps_filer_assgn === employeeName && patent.ps_filing_status === 0) {
      updateData.ps_filing_status = 1;
      updateData.ps_review_file_status = 1;
      timelineType = 'PS Filing Completed';
      timelineDescription = 'Provisional specification filing completed';
      deadline = patent.ps_filer_deadline;
    } else if (patent.cs_filer_assgn === employeeName && patent.cs_filing_status === 0) {
      updateData.cs_filing_status = 1;
      updateData.cs_review_file_status = 1;
      timelineType = 'CS Filing Completed';
      timelineDescription = 'Complete specification filing completed';
      deadline = patent.cs_filer_deadline;
      
      // If form data provided, update forms for CS filings
      if (formData) {
        Object.keys(formData).forEach(key => {
          updateData[key] = formData[key];
        });
      }
    } else if (patent.fer_filer_assgn === employeeName && patent.fer_filing_status === 0) {
      // For FER, need to handle FER entries
      if (patent.fer_entries && patent.fer_entries.length > 0) {
        const ferEntry = patent.fer_entries.find((entry: any) => 
          entry.fer_filer_assgn === employeeName && entry.fer_filing_status === 0
        );
        
        if (ferEntry) {
          return completeFERFilerTask(ferEntry, employeeName);
        }
      }
      
      // If no FER entry found, update patent level status
      updateData.fer_filing_status = 1;
      updateData.fer_review_file_status = 1;
      timelineType = 'FER Filing Completed';
      timelineDescription = 'First Examination Report filing completed';
      deadline = patent.fer_filer_deadline;
    } else {
      console.error('No pending filing task found for employee:', employeeName);
      return false;
    }

    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patent.id);

    if (error) {
      console.error('Error completing filing task:', error);
      return false;
    }

    // Create timeline event
    await createTimelineEvent(patent.id, timelineType, timelineDescription, 1, employeeName, deadline);

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    // Fetch user with matching email
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return { success: false, message: 'Invalid credentials' };
    }

    if (!data) {
      return { success: false, message: 'User not found' };
    }

    // Check password
    if (data.password !== password) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = data;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

export async function fetchPatentsAndEmployees() {
    try {
        const { data: patents, error: patentsError } = await supabase
            .from('patents')
            .select(`
                *,
                inventors (*),
                fer_history (*),
                fer_entries (*)
            `)
            .order('created_at', { ascending: false });

        if (patentsError) {
            console.error('Error fetching patents:', patentsError);
            return { patents: [], employees: [], error: patentsError.message };
        }

        const { data: employees, error: employeesError } = await supabase
            .from('employees')
            .select('*')
            .order('created_at', { ascending: false });

        if (employeesError) {
            console.error('Error fetching employees:', employeesError);
            return { patents: [], employees: [], error: employeesError.message };
        }

        return { patents: patents, employees: employees, error: null };
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return { patents: [], employees: [], error: 'An unexpected error occurred' };
    }
}

// Function to update a patent status field
export async function updatePatentStatus(patentId: string, field: string, value: number | string | boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ [field]: value })
      .eq('id', patentId);
    
    if (error) {
      console.error('Error updating patent status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating patent status:', error);
    return false;
  }
}

// Function to update payment information
export async function updatePatentPayment(
  patentId: string, 
  paymentAmount: number, 
  paymentReceived: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ 
        payment_amount: paymentAmount,
        payment_received: paymentReceived
      })
      .eq('id', patentId);
    
    if (error) {
      console.error('Error updating payment information:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating payment information:', error);
    return false;
  }
}

// Function to update patent notes
export async function updatePatentNotes(patentId: string, notes: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ notes: notes })
      .eq('id', patentId);
    
    if (error) {
      console.error('Error updating patent notes:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating patent notes:', error);
    return false;
  }
}
