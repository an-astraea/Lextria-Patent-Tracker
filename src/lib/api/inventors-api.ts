
import { supabase } from '@/integrations/supabase/client';
import { addPatentTimelineEntry } from '@/lib/api/timeline-api';

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

export const updateInventor = async (inventorId: string, inventorData: { inventor_name: string; inventor_addr: string }, patentId?: string) => {
  try {
    const currentUser = getCurrentUser();
    const updaterName = currentUser?.full_name || 'Unknown User';

    const { data, error } = await supabase
      .from('inventors')
      .update(inventorData)
      .eq('id', inventorId)
      .select();

    if (error) {
      console.error('Error updating inventor:', error);
      return { success: false, message: error.message };
    }

    // Add timeline entry if patent ID is available
    if (patentId && data && data[0]) {
      await addPatentTimelineEntry(
        patentId,
        'inventor_updated',
        `Inventor "${inventorData.inventor_name}" updated by ${updaterName}`,
        1,
        updaterName
      );
    }

    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Error in updateInventor:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

export const addInventor = async (inventorData: { tracking_id: string; inventor_name: string; inventor_addr: string }, patentId?: string) => {
  try {
    const currentUser = getCurrentUser();
    const updaterName = currentUser?.full_name || 'Unknown User';

    const { data, error } = await supabase
      .from('inventors')
      .insert([inventorData])
      .select();

    if (error) {
      console.error('Error adding inventor:', error);
      return { success: false, message: error.message };
    }

    // Add timeline entry if patent ID is available
    if (patentId && data && data[0]) {
      await addPatentTimelineEntry(
        patentId,
        'inventor_added',
        `New inventor "${inventorData.inventor_name}" added by ${updaterName}`,
        1,
        updaterName
      );
    }

    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Error in addInventor:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

export const deleteInventor = async (inventorId: string, patentId?: string) => {
  try {
    const currentUser = getCurrentUser();
    const updaterName = currentUser?.full_name || 'Unknown User';

    // Get inventor info before deletion
    const { data: inventorData } = await supabase
      .from('inventors')
      .select('inventor_name')
      .eq('id', inventorId)
      .single();

    const { error } = await supabase
      .from('inventors')
      .delete()
      .eq('id', inventorId);

    if (error) {
      console.error('Error deleting inventor:', error);
      return { success: false, message: error.message };
    }

    // Add timeline entry if patent ID is available
    if (patentId && inventorData) {
      await addPatentTimelineEntry(
        patentId,
        'inventor_deleted',
        `Inventor "${inventorData.inventor_name}" removed by ${updaterName}`,
        1,
        updaterName
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteInventor:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
