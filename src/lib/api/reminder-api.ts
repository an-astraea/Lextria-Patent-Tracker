
import { supabase } from '@/integrations/supabase/client';
import { PatentReminder, Patent } from '@/lib/types';
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

// Fetch stagnant patents with reminders
export const fetchStagnantPatents = async () => {
  try {
    const { data, error } = await supabase
      .from('patent_reminders')
      .select(`
        *,
        patents!inner (
          *,
          inventors (*)
        )
      `)
      .is('resolved_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stagnant patents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchStagnantPatents:', error);
    return [];
  }
};

// Mark follow-up as made
export const markFollowUpMade = async (patentId: string, notes?: string) => {
  try {
    const currentUser = getCurrentUser();
    const userName = currentUser?.full_name || 'Unknown User';

    // Update patent follow-up count and date
    const { error: updateError } = await supabase
      .from('patents')
      .update({
        follow_up_count: supabase.raw('follow_up_count + 1'),
        last_follow_up_date: new Date().toISOString().split('T')[0],
        next_reminder_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
        updated_at: new Date().toISOString()
      })
      .eq('id', patentId);

    if (updateError) {
      console.error('Error updating patent follow-up:', updateError);
      return { success: false, message: updateError.message };
    }

    // Add timeline entry
    await addPatentTimelineEntry(
      patentId,
      'follow_up_made',
      `Follow-up made by ${userName}${notes ? ': ' + notes : ''}`,
      1,
      userName
    );

    return { success: true, message: 'Follow-up marked successfully' };
  } catch (error: any) {
    console.error('Error in markFollowUpMade:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

// Put patent on hold
export const putPatentOnHold = async (patentId: string, notes?: string) => {
  try {
    const currentUser = getCurrentUser();
    const userName = currentUser?.full_name || 'Unknown User';

    // Update patent status to on_hold
    const { error: updateError } = await supabase
      .from('patents')
      .update({
        follow_up_status: 'on_hold',
        next_reminder_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
        updated_at: new Date().toISOString()
      })
      .eq('id', patentId);

    if (updateError) {
      console.error('Error putting patent on hold:', updateError);
      return { success: false, message: updateError.message };
    }

    // Add timeline entry
    await addPatentTimelineEntry(
      patentId,
      'patent_on_hold',
      `Patent put on hold by ${userName}${notes ? ': ' + notes : ''}`,
      1,
      userName
    );

    return { success: true, message: 'Patent put on hold successfully' };
  } catch (error: any) {
    console.error('Error in putPatentOnHold:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

// Resume patent from hold
export const resumePatentFromHold = async (patentId: string, notes?: string) => {
  try {
    const currentUser = getCurrentUser();
    const userName = currentUser?.full_name || 'Unknown User';

    // Update patent status back to active
    const { error: updateError } = await supabase
      .from('patents')
      .update({
        follow_up_status: 'active',
        next_reminder_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', patentId);

    if (updateError) {
      console.error('Error resuming patent from hold:', updateError);
      return { success: false, message: updateError.message };
    }

    // Add timeline entry
    await addPatentTimelineEntry(
      patentId,
      'patent_resumed',
      `Patent resumed from hold by ${userName}${notes ? ': ' + notes : ''}`,
      1,
      userName
    );

    return { success: true, message: 'Patent resumed successfully' };
  } catch (error: any) {
    console.error('Error in resumePatentFromHold:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

// Resolve reminder
export const resolveReminder = async (reminderId: string, notes?: string) => {
  try {
    const currentUser = getCurrentUser();
    const userName = currentUser?.full_name || 'Unknown User';

    const { error } = await supabase
      .from('patent_reminders')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: userName,
        notes: notes || 'Reminder resolved'
      })
      .eq('id', reminderId);

    if (error) {
      console.error('Error resolving reminder:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Reminder resolved successfully' };
  } catch (error: any) {
    console.error('Error in resolveReminder:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

// Check for stagnant patents (manual trigger)
export const checkStagnantPatents = async () => {
  try {
    const { error } = await supabase.rpc('check_stagnant_patents');

    if (error) {
      console.error('Error checking stagnant patents:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Stagnant patents check completed' };
  } catch (error: any) {
    console.error('Error in checkStagnantPatents:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

// Fetch patents grouped by follow-up status
export const fetchPatentsByFollowUpStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        patent_reminders!inner (
          *
        )
      `)
      .is('patent_reminders.resolved_at', null)
      .order('stage_updated_at', { ascending: true });

    if (error) {
      console.error('Error fetching patents by follow-up status:', error);
      return {
        active: [],
        on_hold: [],
        unresponsive: []
      };
    }

    const grouped = {
      active: data?.filter(p => p.follow_up_status === 'active') || [],
      on_hold: data?.filter(p => p.follow_up_status === 'on_hold') || [],
      unresponsive: data?.filter(p => p.follow_up_status === 'unresponsive') || []
    };

    return grouped;
  } catch (error) {
    console.error('Error in fetchPatentsByFollowUpStatus:', error);
    return {
      active: [],
      on_hold: [],
      unresponsive: []
    };
  }
};
