
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";
import { toast } from "sonner";

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
