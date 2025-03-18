
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";
import { toast } from "sonner";

/**
 * Authenticates a user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the authenticated user or null
 */
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: Employee }> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();
    
    if (error) {
      console.error('Error logging in:', error);
      return { success: false, message: 'Invalid credentials' };
    }
    
    if (!data) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    // Return user data (excluding password)
    const { password: _, ...user } = data;
    
    return {
      success: true,
      user: user as Employee
    };
  } catch (error: any) {
    console.error('Error logging in:', error);
    return { success: false, message: 'An error occurred during login' };
  }
};
