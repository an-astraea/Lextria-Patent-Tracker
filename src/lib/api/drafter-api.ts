
import { supabase } from './client';
import { Patent } from '../types';
import { createTimelineEvent } from './timeline-api';

// Function to fetch drafter assignments
export const fetchDrafterAssignments = async (drafterName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        fer_entries (*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`);
    
    if (error) {
      console.error('Error fetching drafter assignments:', error);
      return [];
    }
    
    // Filter only patents where the drafter has pending tasks
    const filteredPatents = data.filter(patent => 
      (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) ||
      (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) ||
      (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 0) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_drafter_assgn === drafterName && entry.fer_drafter_status === 0
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching drafter assignments:', error);
    return [];
  }
};

// Function to fetch drafter completed assignments
export const fetchDrafterCompletedAssignments = async (drafterName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        fer_entries (*)
      `)
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName},fer_drafter_assgn.eq.${drafterName}`);
    
    if (error) {
      console.error('Error fetching drafter completed assignments:', error);
      return [];
    }
    
    // Filter only patents where the drafter has completed tasks
    const filteredPatents = data.filter(patent => 
      (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 1) ||
      (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 1) ||
      (patent.fer_drafter_assgn === drafterName && patent.fer_drafter_status === 1) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_drafter_assgn === drafterName && entry.fer_drafter_status === 1
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching drafter completed assignments:', error);
    return [];
  }
};

// Function to complete a drafter task
export const completeDrafterTask = async (patent: Patent, userName: string) => {
  try {
    const updateData: any = {};
    let timelineEventType = '';
    let timelineEventDesc = '';
    
    // Determine which drafting task to complete based on assignment
    if (patent.ps_drafter_assgn === userName && patent.ps_drafting_status === 0) {
      updateData.ps_drafting_status = 1;
      updateData.ps_review_draft_status = 1;
      timelineEventType = 'ps_draft_completed';
      timelineEventDesc = `PS Drafting completed by ${userName}`;
    } else if (patent.cs_drafter_assgn === userName && patent.cs_drafting_status === 0) {
      updateData.cs_drafting_status = 1;
      updateData.cs_review_draft_status = 1;
      timelineEventType = 'cs_draft_completed';
      timelineEventDesc = `CS Drafting completed by ${userName}`;
    } else if (patent.fer_drafter_assgn === userName && patent.fer_drafter_status === 0) {
      updateData.fer_drafter_status = 1;
      updateData.fer_review_draft_status = 1;
      timelineEventType = 'fer_draft_completed';
      timelineEventDesc = `FER Drafting completed by ${userName}`;
    } else if (patent.fer_entries && patent.fer_entries.some(fer => fer.fer_drafter_assgn === userName && fer.fer_drafter_status === 0)) {
      // Handle FER entries separately
      const ferEntry = patent.fer_entries.find(fer => fer.fer_drafter_assgn === userName && fer.fer_drafter_status === 0);
      if (ferEntry) {
        return completeFERDrafterTask(ferEntry, userName);
      }
    }
    
    // Only update if we have fields to update
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error('Error completing drafter task:', error);
        return false;
      }
      
      // Create a timeline event
      await createTimelineEvent(
        patent.id, 
        timelineEventType, 
        timelineEventDesc, 
        1, 
        userName
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error completing drafter task:', error);
    return false;
  }
};

// Function to be imported from fer-api.ts
import { completeFERDrafterTask } from './fer-api';
