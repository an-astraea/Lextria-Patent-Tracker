
import { supabase } from "@/integrations/supabase/client";
import { FEREntry } from "@/lib/types";

// Update patent status fields
export const updatePatentStatus = async (
  patentId: string,
  statusData: Record<string, any>
) => {
  try {
    const { error } = await supabase
      .from("patents")
      .update(statusData)
      .eq("id", patentId);

    if (error) {
      console.error("Error updating patent status:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Patent status updated successfully" };
  } catch (error: any) {
    console.error("Error in updatePatentStatus:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};

// Update patent notes
export const updatePatentNotes = async (patentId: string, notes: string) => {
  try {
    const { error } = await supabase
      .from("patents")
      .update({ notes })
      .eq("id", patentId);

    if (error) {
      console.error("Error updating patent notes:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Patent notes updated successfully" };
  } catch (error: any) {
    console.error("Error in updatePatentNotes:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};
