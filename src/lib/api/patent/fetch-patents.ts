
import { supabase } from "@/integrations/supabase/client";

// Fetch all patents with their relationships
export const fetchPatents = async () => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching patents:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchPatents:", error);
    return [];
  }
};

// Fetch a single patent by ID
export const fetchPatentById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching patent by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchPatentById:", error);
    return null;
  }
};

// Fetch patent timeline
export const fetchPatentTimeline = async (patentId: string) => {
  try {
    const { data, error } = await supabase
      .from("patent_timeline")
      .select("*")
      .eq("patent_id", patentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching patent timeline:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchPatentTimeline:", error);
    return [];
  }
};
