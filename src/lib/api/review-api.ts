
import { supabase } from "@/integrations/supabase/client";
import { Employee, Patent } from "../types";
import { toast } from "sonner";
import { normalizePatents } from "../utils/type-converters";

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

    return normalizePatents(data || []);
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    toast.error("Failed to load pending reviews");
    return [];
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

    // Normalize the patents data
    const patents = normalizePatents(patentsResponse.data || []);

    return {
      patents: patents,
      employees: employees
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Failed to load data");
    return { patents: [], employees: [] };
  }
};
