import { supabase } from "@/integrations/supabase/client";
import { Employee, FEREntry, FERHistory, Inventor, Patent, PatentFormData } from "./types";
import { toast } from "sonner";

// Patent Functions
export const fetchPatents = async (): Promise<Patent[]> => {
  try {
    const { data: patents, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `);

    if (error) {
      throw error;
    }

    return patents || [];
  } catch (error) {
    console.error("Error fetching patents:", error);
    toast.error("Failed to load patents");
    return [];
  }
};

export const fetchPatentById = async (id: string): Promise<Patent | null> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      // Fetch FER entries for this patent
      const { data: ferEntries, error: ferError } = await supabase
        .from("fer_entries")
        .select("*")
        .eq("patent_id", data.id)
        .order("fer_number", { ascending: true });

      if (ferError) {
        console.error("Error fetching FER entries:", ferError);
      } else {
        data.fer_entries = ferEntries;
      }
    }

    return data || null;
  } catch (error) {
    console.error("Error fetching patent:", error);
    toast.error("Failed to load patent details");
    return null;
  }
};

export const updatePatentStatus = async (
  id: string, 
  statusType: string, 
  value: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("patents")
      .update({ [statusType]: value })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error updating patent ${statusType}:`, error);
    toast.error("Failed to update patent status");
    return false;
  }
};

export const deletePatent = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("patents")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting patent:", error);
    toast.error("Failed to delete patent");
    return false;
  }
};

export const updatePatentForms = async (
  id: string,
  formData: Record<string, boolean>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("patents")
      .update(formData)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating patent forms:", error);
    toast.error("Failed to update forms");
    return false;
  }
};

// Employee Functions
export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*");

    if (error) {
      throw error;
    }

    // Cast the roles to the expected type
    return (data || []).map(employee => ({
      ...employee,
      role: employee.role as 'admin' | 'drafter' | 'filer'
    }));
  } catch (error) {
    console.error("Error fetching employees:", error);
    toast.error("Failed to load employees");
    return [];
  }
};

export const fetchEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    // Cast the role to the expected type
    return {
      ...data,
      role: data.role as 'admin' | 'drafter' | 'filer'
    };
  } catch (error) {
    console.error("Error fetching employee:", error);
    toast.error("Failed to load employee details");
    return null;
  }
};

// Auth Functions
export const loginUser = async (email: string, password: string): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      toast.error("Invalid email or password");
      return null;
    }

    // Cast the role to the expected type
    const user: Employee = {
      ...data,
      role: data.role as 'admin' | 'drafter' | 'filer'
    };

    // Store user in localStorage
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Error logging in:", error);
    toast.error("Login failed");
    return null;
  }
};

// Drafter Functions
export const fetchDrafterAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    // Get patents where drafter is assigned with status 0 (pending)
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`)
      .or('ps_drafting_status.eq.0,cs_drafting_status.eq.0,fer_drafter_status.eq.0');

    if (error) {
      throw error;
    }

    // Now we need to filter for proper queue order with approval dependencies: PS -> CS -> FER
    return (data || []).filter(patent => {
      // If assigned to PS drafting and it's not completed
      if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
        return true;
      }
      
      // If assigned to CS drafting and PS drafting is completed and approved
      if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
        // For CS drafting to be ready, PS must be completed or not required
        // If PS was required, it must be both drafted and approved
        const psCompleted = !patent.ps_drafter_assgn || 
                           (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0);
        return psCompleted;
      }
      
      // If assigned to FER drafting and previous stages are completed or not required
      if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0 && patent.fer_status === 1) {
        const psCompleted = !patent.ps_drafter_assgn || patent.ps_completion_status === 1;
        const csCompleted = !patent.cs_drafter_assgn || patent.cs_completion_status === 1;
        return psCompleted && csCompleted;
      }
      
      return false;
    });
  } catch (error) {
    console.error("Error fetching drafter assignments:", error);
    toast.error("Failed to load drafting assignments");
    return [];
  }
};

export const fetchDrafterCompletedAssignments = async (drafterName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`)
      .or('ps_drafting_status.eq.1,cs_drafting_status.eq.1,fer_drafter_status.eq.1');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching completed drafting assignments:", error);
    toast.error("Failed to load completed assignments");
    return [];
  }
};

// Filer Functions
export const fetchFilerAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    // Get patents where filer is assigned with status 0 (pending)
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`)
      .or('ps_filing_status.eq.0,cs_filing_status.eq.0,fer_filing_status.eq.0');

    if (error) {
      throw error;
    }

    // Filter for proper queue order and dependencies with approval requirements: PS -> CS -> FER
    return (data || []).filter(patent => {
      // If assigned to PS filing and it's not completed
      // For PS filing to be ready, PS drafting must be completed and approved
      if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
        return patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0;
      }
      
      // If assigned to CS filing
      if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
        // PS must be completed or not required
        const psCompleted = !patent.ps_filer_assgn || patent.ps_completion_status === 1;
        // CS drafting must be completed and approved
        const csDraftApproved = patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0;
        return psCompleted && csDraftApproved;
      }
      
      // If assigned to FER filing
      if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0 && patent.fer_status === 1) {
        // Previous stages must be completed or not required
        const psCompleted = !patent.ps_filer_assgn || patent.ps_completion_status === 1;
        const csCompleted = !patent.cs_filer_assgn || patent.cs_completion_status === 1;
        // FER drafting must be completed and approved
        const ferDraftApproved = patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0;
        return psCompleted && csCompleted && ferDraftApproved;
      }
      
      return false;
    });
  } catch (error) {
    console.error("Error fetching filer assignments:", error);
    toast.error("Failed to load filing assignments");
    return [];
  }
};

export const fetchFilerCompletedAssignments = async (filerName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`)
      .or('ps_filing_status.eq.1,cs_filing_status.eq.1,fer_filing_status.eq.1');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching completed filing assignments:", error);
    toast.error("Failed to load completed assignments");
    return [];
  }
};

// Added function to fetch patents assigned to a specific employee
export const fetchPatentsByEmployee = async (employeeName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or(`ps_drafter_assgn.eq.${employeeName},cs_drafter_assgn.eq.${employeeName},fer_drafter_assgn.eq.${employeeName},ps_filer_assgn.eq.${employeeName},cs_filer_assgn.eq.${employeeName},fer_filer_assgn.eq.${employeeName}`);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching patents by employee:", error);
    toast.error("Failed to load patents for employee");
    return [];
  }
};

export const completeDrafterTask = async (
  patent: Patent,
  drafterName: string
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      updateData.ps_drafting_status = 1;
      updateData.ps_review_draft_status = 1; // Set for review
    } else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      updateData.cs_drafting_status = 1;
      updateData.cs_review_draft_status = 1; // Set for review
    } else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      updateData.fer_drafter_status = 1;
      updateData.fer_review_draft_status = 1; // Set for review
    } else {
      toast.error("No valid drafting task found");
      return false;
    }

    const { error } = await supabase
      .from("patents")
      .update(updateData)
      .eq("id", patent.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error completing drafting task:", error);
    toast.error("Failed to complete drafting task");
    return false;
  }
};

export const completeFilerTask = async (
  patent: Patent,
  filerName: string,
  formData?: Record<string, boolean>
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
      updateData.ps_filing_status = 1;
      updateData.ps_review_file_status = 1; // Set for review
      // Update PS completion status if both drafting and filing are done
      if (patent.ps_drafting_status === 1) {
        updateData.ps_completion_status = 1;
      }
    } else if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
      updateData.cs_filing_status = 1;
      updateData.cs_review_file_status = 1; // Set for review
      // Add form data for CS filing
      if (formData) {
        Object.assign(updateData, formData);
      }
      // Update CS completion status if both drafting and filing are done
      if (patent.cs_drafting_status === 1) {
        updateData.cs_completion_status = 1;
      }
    } else if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0) {
      updateData.fer_filing_status = 1;
      updateData.fer_review_file_status = 1; // Set for review
      // Update FER completion status if both drafting and filing are done
      if (patent.fer_drafter_status === 1) {
        updateData.fer_completion_status = 1;
      }
    } else {
      toast.error("No valid filing task found");
      return false;
    }

    const { error } = await supabase
      .from("patents")
      .update(updateData)
      .eq("id", patent.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error completing filing task:", error);
    toast.error("Failed to complete filing task");
    return false;
  }
};

// Added function to create a new employee
export const createEmployee = async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .insert({
        emp_id: employee.emp_id,
        full_name: employee.full_name,
        email: employee.email,
        ph_no: employee.ph_no,
        password: employee.password,
        role: employee.role
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      role: data.role as 'admin' | 'drafter' | 'filer'
    };
  } catch (error) {
    console.error("Error creating employee:", error);
    toast.error("Failed to create employee");
    return null;
  }
};

// Added function to update an employee
export const updateEmployee = async (id: string, employee: Partial<Omit<Employee, 'id'>>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("employees")
      .update(employee)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating employee:", error);
    toast.error("Failed to update employee");
    return false;
  }
};

// Added function to delete an employee
export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting employee:", error);
    toast.error("Failed to delete employee");
    return false;
  }
};

// Optimized function to fetch both patents and employees in a single function call
export const fetchPatentsAndEmployees = async (): Promise<{patents: Patent[], employees: Employee[]}> => {
  try {
    // Make both requests in parallel using Promise.all
    const [patentsResponse, employeesResponse] = await Promise.all([
      supabase
        .from("patents")
        .select(`
          *,
          inventors(*),
          fer_history(*)
        `),
      supabase
        .from("employees")
        .select("*")
    ]);

    if (patentsResponse.error) {
      throw patentsResponse.error;
    }

    if (employeesResponse.error) {
      throw employeesResponse.error;
    }

    // Cast the roles to the expected type for employees
    const employees = (employeesResponse.data || []).map(employee => ({
      ...employee,
      role: employee.role as 'admin' | 'drafter' | 'filer'
    }));

    return {
      patents: patentsResponse.data || [],
      employees: employees
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Failed to load data");
    return { patents: [], employees: [] };
  }
};

// Add new function to create a patent
export const createPatent = async (patentData: PatentFormData): Promise<Patent | null> => {
  try {
    // Calculate initial completion statuses
    const psCompletionStatus = 0; // Will be set to 1 when both drafting and filing are done
    const csCompletionStatus = 0; // Will be set to 1 when both drafting and filing are done
    const ferCompletionStatus = 0; // Will be set to 1 when both drafting and filing are done

    const { data, error } = await supabase
      .from("patents")
      .insert({
        tracking_id: patentData.tracking_id,
        patent_applicant: patentData.patent_applicant,
        client_id: patentData.client_id,
        application_no: patentData.application_no || null,
        date_of_filing: patentData.date_of_filing || null,
        patent_title: patentData.patent_title,
        applicant_addr: patentData.applicant_addr,
        inventor_ph_no: patentData.inventor_ph_no,
        inventor_email: patentData.inventor_email,
        ps_drafter_assgn: patentData.ps_drafter_assgn || null,
        ps_drafter_deadline: patentData.ps_drafter_deadline || null,
        ps_filer_assgn: patentData.ps_filer_assgn || null,
        ps_filer_deadline: patentData.ps_filer_deadline || null,
        cs_drafter_assgn: patentData.cs_drafter_assgn || null,
        cs_drafter_deadline: patentData.cs_drafter_deadline || null,
        cs_filer_assgn: patentData.cs_filer_assgn || null,
        cs_filer_deadline: patentData.cs_filer_deadline || null,
        fer_status: patentData.fer_status,
        fer_drafter_assgn: patentData.fer_drafter_assgn || null,
        fer_drafter_deadline: patentData.fer_drafter_deadline || null,
        fer_filer_assgn: patentData.fer_filer_assgn || null,
        fer_filer_deadline: patentData.fer_filer_deadline || null,
        ps_completion_status: psCompletionStatus,
        cs_completion_status: csCompletionStatus,
        fer_completion_status: ferCompletionStatus
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (patentData.inventors && patentData.inventors.length > 0) {
      for (const inventor of patentData.inventors) {
        await createInventor({
          tracking_id: data.tracking_id,
          inventor_name: inventor.inventor_name,
          inventor_addr: inventor.inventor_addr
        });
      }
    }

    // Also update the patent's fer_status if it's not already enabled
    const { error: updateError } = await supabase
      .from("patents")
      .update({ fer_status: 1 })
      .eq("id", data.id);

    if (updateError) {
      console.error('Error updating patent FER status:', updateError);
      // Continue anyway as the FER entry was created
    }

    return data;
  } catch (error) {
    console.error("Error creating patent:", error);
    toast.error("Failed to create patent");
    return null;
  }
};

// Add function to update a patent
export const updatePatent = async (id: string, patentData: PatentFormData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("patents")
      .update({
        patent_applicant: patentData.patent_applicant,
        client_id: patentData.client_id,
        application_no: patentData.application_no || null,
        date_of_filing: patentData.date_of_filing || null,
        patent_title: patentData.patent_title,
        applicant_addr: patentData.applicant_addr,
        inventor_ph_no: patentData.inventor_ph_no,
        inventor_email: patentData.inventor_email,
        ps_drafter_assgn: patentData.ps_drafter_assgn || null,
        ps_drafter_deadline: patentData.ps_drafter_deadline || null,
        ps_filer_assgn: patentData.ps_filer_assgn || null,
        ps_filer_deadline: patentData.ps_filer_deadline || null,
        cs_drafter_assgn: patentData.cs_drafter_assgn || null,
        cs_drafter_deadline: patentData.cs_drafter_deadline || null,
        cs_filer_assgn: patentData.cs_filer_assgn || null,
        cs_filer_deadline: patentData.cs_filer_deadline || null,
        fer_status: patentData.fer_status,
        fer_drafter_assgn: patentData.fer_drafter_assgn || null,
        fer_drafter_deadline: patentData.fer_drafter_deadline || null,
        fer_filer_assgn: patentData.fer_filer_assgn || null,
        fer_filer_deadline: patentData.fer_filer_deadline || null
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    if (patentData.inventors && patentData.inventors.length > 0) {
      // Get existing inventors
      const { data: existingInventors, error: fetchError } = await supabase
        .from("inventors")
        .select("*")
        .eq("tracking_id", patentData.tracking_id);
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Update existing inventors or create new ones
      if (existingInventors && existingInventors.length > 0) {
        for (let i = 0; i < patentData.inventors.length; i++) {
          const inventor = patentData.inventors[i];
          if (i < existingInventors.length) {
            await updateInventor(existingInventors[i].id, {
              inventor_name: inventor.inventor_name,
              inventor_addr: inventor.inventor_addr
            });
          } else {
            await createInventor({
              tracking_id: patentData.tracking_id,
              inventor_name: inventor.inventor_name,
              inventor_addr: inventor.inventor_addr
            });
          }
        }
      } else {
        // No existing inventors, create all new ones
        for (const inventor of patentData.inventors) {
          await createInventor({
            tracking_id: patentData.tracking_id,
            inventor_name: inventor.inventor_name,
            inventor_addr: inventor.inventor_addr
          });
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating patent:", error);
    toast.error("Failed to update patent");
    return false;
  }
};

// Add function to create an inventor
export const createInventor = async (inventorData: { tracking_id: string, inventor_name: string, inventor_addr: string }): Promise<Inventor | null> => {
  try {
    const { data, error } = await supabase
      .from("inventors")
      .insert({
        tracking_id: inventorData.tracking_id,
        inventor_name: inventorData.inventor_name,
        inventor_addr: inventorData.inventor_addr
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating inventor:", error);
    toast.error("Failed to add inventor");
    return null;
  }
};

// Add function to update inventors
export const updateInventor = async (id: string, inventorData: { inventor_name: string, inventor_addr: string }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("inventors")
      .update({
        inventor_name: inventorData.inventor_name,
        inventor_addr: inventorData.inventor_addr
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating inventor:", error);
    toast.error("Failed to update inventor");
    return false;
  }
};

// Function to approve a patent review
export const approvePatentReview = async (
  patent: Patent,
  reviewType: 'ps_draft' | 'ps_file' | 'cs_draft' | 'cs_file' | 'fer_draft' | 'fer_file'
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {};
    
    switch (reviewType) {
      case 'ps_draft':
        updateData.ps_review_draft_status = 0; // Approve the review (reset to 0 since it's approved)
        // If PS filer is assigned but filing status is still 0, update filing status to indicate it's ready
        if (patent.ps_filer_assgn && patent.ps_filing_status === 0) {
          updateData.ps_filing_status = 0; // Keep as pending, but ready for action
        }
        break;
      case 'ps_file':
        updateData.ps_review_file_status = 0; // Approve the review
        updateData.ps_completion_status = 1; // Set PS as completed
        // Only now after PS filing is approved, enable CS drafting if CS drafter is assigned
        if (patent.cs_drafter_assgn && patent.cs_drafting_status === 0) {
          updateData.cs_drafting_status = 0; // Keep as pending, but ready for action
        }
        break;
      case 'cs_draft':
        updateData.cs_review_draft_status = 0; // Approve the review
        // If CS filer is assigned but filing status is still 0, update filing status to indicate it's ready
        if (patent.cs_filer_assgn && patent.cs_filing_status === 0) {
          updateData.cs_filing_status = 0; // Keep as pending, but ready for action
        }
        break;
      case 'cs_file':
        updateData.cs_review_file_status = 0; // Approve the review
        updateData.cs_completion_status = 1; // Set CS as completed
        // Only now after CS filing is approved, enable FER drafting if FER is enabled and drafter is assigned
        if (patent.fer_drafter_assgn && patent.fer_status === 1 && patent.fer_drafter_status === 0) {
          updateData.fer_drafter_status = 0; // Keep as pending, but ready for action
        }
        break;
      case 'fer_draft':
        updateData.fer_review_draft_status = 0; // Approve the review
        // If FER filer is assigned but filing status is still 0, update filing status to indicate it's ready
        if (patent.fer_filer_assgn && patent.fer_filing_status === 0) {
          updateData.fer_filing_status = 0; // Keep as pending, but ready for action
        }
        break;
      case 'fer_file':
        updateData.fer_review_file_status = 0; // Approve the review
        updateData.fer_completion_status = 1; // Set FER as completed
        break;
      default:
        toast.error("Invalid review type");
        return false;
    }

    const { error } = await supabase
      .from("patents")
      .update(updateData)
      .eq("id", patent.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error approving review:", error);
    toast.error("Failed to approve review");
    return false;
  }
};

// Function to reject a patent review and reset status for the assignee
export const rejectPatentReview = async (
  patent: Patent,
  reviewType: 'ps_draft' | 'ps_file' | 'cs_draft' | 'cs_file' | 'fer_draft' | 'fer_file',
  rejectionReason?: string
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {};
    let eventDescription = '';
    
    switch (reviewType) {
      case 'ps_draft':
        // Reset drafting status back to in-progress (0) and clear review status
        updateData.ps_drafting_status = 0;
        updateData.ps_review_draft_status = 0;
        eventDescription = 'PS Draft rejected by admin';
        break;
      case 'ps_file':
        // Reset filing status back to in-progress (0) and clear review status
        updateData.ps_filing_status = 0;
        updateData.ps_review_file_status = 0;
        updateData.ps_completion_status = 0; // Reset completion status
        eventDescription = 'PS Filing rejected by admin';
        break;
      case 'cs_draft':
        // Reset drafting status back to in-progress (0) and clear review status
        updateData.cs_drafting_status = 0;
        updateData.cs_review_draft_status = 0;
        eventDescription = 'CS Draft rejected by admin';
        break;
      case 'cs_file':
        // Reset filing status back to in-progress (0) and clear review status
        updateData.cs_filing_status = 0;
        updateData.cs_review_file_status = 0;
        updateData.cs_completion_status = 0; // Reset completion status
        eventDescription = 'CS Filing rejected by admin';
        break;
      case 'fer_draft':
        // Reset drafting status back to in-progress (0) and clear review status
        updateData.fer_drafter_status = 0;
        updateData.fer_review_draft_status = 0;
        eventDescription = 'FER Draft rejected by admin';
        break;
      case 'fer_file':
        // Reset filing status back to in-progress (0) and clear review status
        updateData.fer_filing_status = 0;
        updateData.fer_review_file_status = 0;
        updateData.fer_completion_status = 0; // Reset completion status
        eventDescription = 'FER Filing rejected by admin';
        break;
      default:
        toast.error("Invalid review type");
        return false;
    }

    if (rejectionReason) {
      eventDescription += `: ${rejectionReason}`;
    }

    // Update the patent status
    const { error: updateError } = await supabase
      .from("patents")
      .update(updateData)
      .eq("id", patent.id);

    if (updateError) {
      throw updateError;
    }

    // Add a timeline event for the rejection
    const { error: timelineError } = await supabase
      .from("patent_timeline")
      .insert({
        patent_id: patent.id,
        event_type: `${reviewType}_rejected`,
        event_description: eventDescription,
        status: 0
      });

    if (timelineError) {
      console.error("Error adding timeline event:", timelineError);
      // Continue anyway since the status update is more important
    }

    return true;
  } catch (error) {
    console.error("Error rejecting review:", error);
    toast.error("Failed to reject review");
    return false;
  }
};

// Function to fetch patents that need review by admins
export const fetchPendingReviews = async (): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors(*),
        fer_history(*)
      `)
      .or('ps_review_draft_status.eq.1,ps_review_file_status.eq.1,cs_review_draft_status.eq.1,cs_review_file_status.eq.1,fer_review_draft_status.eq.1,fer_review_file_status.eq.1');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    toast.error("Failed to load pending reviews");
    return [];
  }
};

// Function to update patent notes
export const updatePatentNotes = async (
  patentId: string,
  notes: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("patents")
      .update({ notes })
      .eq("id", patentId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating patent notes:", error);
    toast.error("Failed to update notes");
    return false;
  }
};

// Add function to fetch patent timeline
export const fetchPatentTimeline = async (patentId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("patent_timeline")
      .select("*")
      .eq("patent_id", patentId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching patent timeline:", error);
    toast.error("Failed to load patent timeline");
    return [];
  }
};

// Add functions for managing FER entries
export const fetchFEREntries = async (patentId: string): Promise<FEREntry[]> => {
  try {
    const { data, error } = await supabase
      .from("fer_entries")
      .select("*")
      .eq("patent_id", patentId)
      .order("fer_number", { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching FER entries:", error);
    toast.error("Failed to load FER entries");
    return [];
  }
};

export const createFEREntry = async (
  patentId: string, 
  ferNumber: number,
  drafterName?: string,
  drafterDeadline?: string,
  filerName?: string,
  filerDeadline?: string,
  ferDate?: string
): Promise<FEREntry | null> => {
  try {
    const { data, error } = await supabase
      .from("fer_entries")
      .insert({
        patent_id: patentId,
        fer_number: ferNumber,
        fer_drafter_assgn: drafterName || null,
        fer_drafter_deadline: drafterDeadline || null,
        fer_filer_assgn: filerName || null,
        fer_filer_deadline: filerDeadline || null,
        fer_date: ferDate || null,
        fer_drafter_status: 0,
        fer_filing_status: 0,
        fer_review_draft_status: 0,
        fer_review_file_status: 0,
        fer_completion_status: 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Also update the patent's fer_status if it's not already enabled
    const { error: updateError } = await supabase
      .from("patents")
      .update({ fer_status: 1 })
      .eq("id", patentId);

    if (updateError) {
      console.error('Error updating patent FER status:', updateError);
      // Continue anyway as the FER entry was created
    }

    return data;
  } catch (error) {
    console.error("Error creating FER entry:", error);
    toast.error("Failed to create FER entry");
    return null;
  }
};

export const updateFEREntry = async (
  ferId: string,
  ferData: Partial<FEREntry>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("fer_entries")
      .update(ferData)
      .eq("id", ferId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating FER entry:", error);
    toast.error("Failed to update FER entry");
    return false;
  }
};

export const deleteFEREntry = async (ferId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("fer_entries")
      .delete()
      .eq("id", ferId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting FER entry:", error);
    toast.error("Failed to delete FER entry");
    return false;
  }
};

// Add function to fetch FER entries assigned to a specific drafter
export const fetchDrafterFERAssignments = async (drafterName: string): Promise<FEREntry[]> => {
  try {
    const { data, error } = await supabase
      .from("fer_entries")
      .select(`
        *,
        patent:patent_id(*)
      `)
      .eq("fer_drafter_assgn", drafterName)
      .eq("fer_drafter_status", 0);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching drafter FER assignments:", error);
    toast.error("Failed to load FER drafting assignments");
    return [];
  }
};

// Add function to fetch FER entries assigned to a specific filer
export const fetchFilerFERAssignments = async (filerName: string): Promise<FEREntry[]> => {
  try {
    const { data, error } = await supabase
      .from("fer_entries")
      .select(`
        *,
        patent:patent_id(*)
      `)
      .eq("fer_filer_assgn", filerName)
      .eq("fer_filing_status", 0)
      .eq("fer_drafter_status", 1); // Only show FERs that have been drafted

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching filer FER assignments:", error);
    toast.error("Failed to load FER filing assignments");
    return [];
  }
};

// Add function to complete FER drafter task
export const completeFERDrafterTask = async (
  ferEntry: FEREntry,
  drafterName: string
): Promise<boolean> => {
  try {
    // Verify the drafter assignment
    if (ferEntry.fer_drafter_assgn !== drafterName) {
      toast.error("You are not assigned as the drafter for this FER");
      return false;
    }

    const { error } = await supabase
      .from("fer_entries")
      .update({
        fer_drafter_status: 1,
        fer_review_draft_status: 1 // Set for review
      })
      .eq("id", ferEntry.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error completing FER drafting task:", error);
    toast.error("Failed to complete FER drafting");
    return false;
  }
};

// Add function to complete FER filer task
export const completeFERFilerTask = async (
  ferEntry: FEREntry,
  filerName: string
): Promise<boolean> => {
  try {
    // Verify the filer assignment
    if (ferEntry.fer_filer_assgn !== filerName) {
      toast.error("You are not assigned as the filer for this FER");
      return false;
    }

    // Verify the FER is ready for filing (draft is completed and approved)
    if (ferEntry.fer_drafter_status !== 1 || ferEntry.fer_review_draft_status !== 0) {
      toast.error("FER draft must be completed and approved before filing");
      return false;
    }

    const { error } = await supabase
      .from("fer_entries")
      .update({
        fer_filing_status: 1,
        fer_review_file_status: 1 // Set for review
      })
      .eq("id", ferEntry.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error completing FER filing task:", error);
    toast.error("Failed to complete FER filing");
    return false;
  }
};

// Function to approve a FER review
export const approveFERReview = async (
  ferEntry: FEREntry,
  reviewType: 'draft' | 'file'
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (reviewType === 'draft') {
      updateData.fer_review_draft_status = 0; // Approve the review
    } else if (reviewType === 'file') {
      updateData.fer_review_file_status = 0; // Approve the review
      updateData.fer_completion_status = 1; // Set as completed
    }

    const { error } = await supabase
      .from("fer_entries")
      .update(updateData)
      .eq("id", ferEntry.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error approving FER review:", error);
    toast.error("Failed to approve FER review");
    return false;
  }
};

// Add function to fetch FER reviews pending approval
export const fetchPendingFERReviews = async (): Promise<FEREntry[]> => {
  try {
    const { data, error } = await supabase
      .from("fer_entries")
      .select(`
        *,
        patent:patent_id(*)
      `)
      .or("fer_review_draft_status.eq.1,fer_review_file_status.eq.1");

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching pending FER reviews:", error);
    toast.error("Failed to load pending FER reviews");
    return [];
  }
};
