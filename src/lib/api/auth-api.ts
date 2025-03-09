
import { supabase } from "@/integrations/supabase/client";

export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message, success: false };
    }

    if (data.user) {
      // Get user profile details from the employees table
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();

      if (employeeError) {
        return { error: employeeError.message, success: false };
      }

      return {
        success: true,
        user: {
          id: employeeData.id,
          email: employeeData.email,
          emp_id: employeeData.emp_id,
          full_name: employeeData.full_name,
          role: employeeData.role
        }
      };
    }

    return { error: "Authentication failed", success: false };
  } catch (error: any) {
    return { error: error.message, success: false };
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message, success: false };
  }
};
