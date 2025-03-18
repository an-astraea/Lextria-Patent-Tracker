
import { supabase } from "@/integrations/supabase/client";
import { FEREntry } from "@/lib/types";

// Function to update FER entry
export const updateFEREntry = async (ferEntryId: string, ferData: Partial<FEREntry>) => {
  const { data, error } = await supabase
    .from('fer_entries')
    .update(ferData)
    .eq('id', ferEntryId)
    .select();
  
  if (error) {
    console.error('Error updating FER entry:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, message: 'FER entry updated successfully' };
};
