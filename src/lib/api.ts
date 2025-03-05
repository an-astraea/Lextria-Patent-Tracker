
import { supabase } from "@/integrations/supabase/client";
import { Employee, FERHistory, Inventor, Patent } from "./types";
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

// New function to delete a patent
export const deletePatent = async (id: string): Promise<boolean> => {
  try {
    // Delete the patent
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

// Forms Functions for CS Filing
export const updatePatentForms = async (
  id: string,
  formData: {
    form_26?: boolean;
    form_18?: boolean;
    form_18a?: boolean;
    form_9?: boolean;
    form_9a?: boolean;
    form_13?: boolean;
  }
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

    return data || [];
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

    return data || [];
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
    } else if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      updateData.cs_drafting_status = 1;
    } else if (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) {
      updateData.fer_drafter_status = 1;
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
  formData?: {
    form_26?: boolean;
    form_18?: boolean;
    form_18a?: boolean;
    form_9?: boolean;
    form_9a?: boolean;
    form_13?: boolean;
  }
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
      updateData.ps_filing_status = 1;
    } else if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
      updateData.cs_filing_status = 1;
      // Add form data for CS filing
      if (formData) {
        Object.assign(updateData, formData);
      }
    } else if (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0) {
      updateData.fer_filing_status = 1;
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
export const createEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee | null> => {
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
