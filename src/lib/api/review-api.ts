
import { supabase } from "@/integrations/supabase/client";
import { Employee, Patent } from "../types";
import { toast } from "sonner";
import { normalizePatents } from "../utils/type-converters";
import { addPatentTimelineEntry } from "./timeline-api";

// Helper function to get current user
const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
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

    return normalizePatents(data || []);
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    toast.error("Failed to load pending reviews");
    return [];
  }
};

// Function to approve a patent review
export const approvePatentReview = async (patent: Patent, reviewType: string): Promise<boolean> => {
  try {
    const currentUser = getCurrentUser();
    const approverName = currentUser?.full_name || 'Unknown User';
    
    const updates: Record<string, any> = {};
    let timelineMessage = '';

    switch (reviewType) {
      case 'ps_draft':
        updates.ps_review_draft_status = 0;
        timelineMessage = `PS Draft approved by ${approverName}`;
        break;
      case 'ps_file':
        updates.ps_review_file_status = 0;
        updates.ps_completion_status = 1;
        timelineMessage = `PS Filing approved and PS marked as completed by ${approverName}`;
        break;
      case 'cs_draft':
        updates.cs_review_draft_status = 0;
        timelineMessage = `CS Draft approved by ${approverName}`;
        break;
      case 'cs_file':
        updates.cs_review_file_status = 0;
        updates.cs_completion_status = 1;
        timelineMessage = `CS Filing approved and CS marked as completed by ${approverName}`;
        break;
      case 'fer_draft':
        updates.fer_review_draft_status = 0;
        timelineMessage = `FER Draft approved by ${approverName}`;
        break;
      case 'fer_file':
        updates.fer_review_file_status = 0;
        timelineMessage = `FER Filing approved by ${approverName}`;
        break;
      default:
        console.error('Unknown review type:', reviewType);
        return false;
    }

    const { error } = await supabase
      .from("patents")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", patent.id);

    if (error) {
      console.error("Error approving review:", error);
      return false;
    }

    // Add timeline entry
    await addPatentTimelineEntry(
      patent.id,
      'review_approved',
      timelineMessage,
      1,
      approverName
    );

    return true;
  } catch (error) {
    console.error("Error in approvePatentReview:", error);
    return false;
  }
};

// Function to reject a patent review - sends it back to the assignee
export const rejectPatentReview = async (patent: Patent, reviewType: string): Promise<boolean> => {
  try {
    const currentUser = getCurrentUser();
    const rejectorName = currentUser?.full_name || 'Unknown User';
    
    const updates: Record<string, any> = {};
    let timelineMessage = '';
    let assigneeName = '';

    switch (reviewType) {
      case 'ps_draft':
        updates.ps_review_draft_status = 0;
        updates.ps_drafting_status = 0; // Reset drafting status so employee can rework
        timelineMessage = `PS Draft rejected by ${rejectorName} - sent back for rework`;
        assigneeName = patent.ps_drafter_assgn;
        break;
      case 'ps_file':
        updates.ps_review_file_status = 0;
        updates.ps_filing_status = 0; // Reset filing status so employee can rework
        timelineMessage = `PS Filing rejected by ${rejectorName} - sent back for rework`;
        assigneeName = patent.ps_filer_assgn;
        break;
      case 'cs_draft':
        updates.cs_review_draft_status = 0;
        updates.cs_drafting_status = 0; // Reset drafting status so employee can rework
        timelineMessage = `CS Draft rejected by ${rejectorName} - sent back for rework`;
        assigneeName = patent.cs_drafter_assgn;
        break;
      case 'cs_file':
        updates.cs_review_file_status = 0;
        updates.cs_filing_status = 0; // Reset filing status so employee can rework
        timelineMessage = `CS Filing rejected by ${rejectorName} - sent back for rework`;
        assigneeName = patent.cs_filer_assgn;
        break;
      case 'fer_draft':
        updates.fer_review_draft_status = 0;
        updates.fer_drafter_status = 0; // Reset drafting status so employee can rework
        timelineMessage = `FER Draft rejected by ${rejectorName} - sent back for rework`;
        assigneeName = patent.fer_drafter_assgn;
        break;
      case 'fer_file':
        updates.fer_review_file_status = 0;
        updates.fer_filing_status = 0; // Reset filing status so employee can rework
        timelineMessage = `FER Filing rejected by ${rejectorName} - sent back for rework`;
        assigneeName = patent.fer_filer_assgn;
        break;
      default:
        console.error('Unknown review type:', reviewType);
        return false;
    }

    const { error } = await supabase
      .from("patents")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", patent.id);

    if (error) {
      console.error("Error rejecting review:", error);
      return false;
    }

    // Add timeline entry with assignee information
    await addPatentTimelineEntry(
      patent.id,
      'review_rejected',
      `${timelineMessage} - assigned back to ${assigneeName}`,
      0,
      rejectorName
    );

    return true;
  } catch (error) {
    console.error("Error in rejectPatentReview:", error);
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
