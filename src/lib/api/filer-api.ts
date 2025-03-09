
import { supabase } from './client';
import { Patent, FEREntry } from '../types';
import { createTimelineEvent } from './timeline-api';
import { completeFERFilerTask } from './fer-api';

// Function to fetch filer assignments
export const fetchFilerAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        fer_entries (*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`);
    
    if (error) {
      console.error('Error fetching filer assignments:', error);
      return [];
    }
    
    // Filter only patents where the filer has pending tasks
    const filteredPatents = data.filter(patent => 
      // PS filer task is ready when PS drafting is complete
      (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1) ||
      // CS filer task is ready when CS drafting is complete
      (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1) ||
      // FER filer task is ready when FER drafting is complete
      (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 0 && patent.fer_drafter_status === 1)
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching filer assignments:', error);
    return [];
  }
};

// Function to fetch filer FER assignments
export const fetchFilerFERAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .select(`
        *,
        patent:patent_id (*)
      `)
      .eq('fer_filer_assgn', filerName)
      .eq('fer_filing_status', 0)
      .eq('fer_drafter_status', 1);
    
    if (error) {
      console.error('Error fetching filer FER assignments:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching filer FER assignments:', error);
    return [];
  }
};

// Function to fetch filer completed assignments
export const fetchFilerCompletedAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        fer_entries (*)
      `)
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName},fer_filer_assgn.eq.${filerName}`);
    
    if (error) {
      console.error('Error fetching filer completed assignments:', error);
      return [];
    }
    
    // Filter only patents where the filer has completed tasks
    const filteredPatents = data.filter(patent => 
      (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 1) ||
      (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 1) ||
      (patent.fer_filer_assgn === filerName && patent.fer_filing_status === 1) ||
      // Also check FER entries
      (patent.fer_entries && patent.fer_entries.some(
        entry => entry.fer_filer_assgn === filerName && entry.fer_filing_status === 1
      ))
    );
    
    return filteredPatents;
  } catch (error) {
    console.error('Error fetching filer completed assignments:', error);
    return [];
  }
};

// Function to complete a filer task
export const completeFilerTask = async (patent: Patent, userName: string, formData?: Record<string, boolean>) => {
  try {
    const updateData: any = {};
    let timelineEventType = '';
    let timelineEventDesc = '';
    
    // Determine which filing task to complete based on assignment
    if (patent.ps_filer_assgn === userName && patent.ps_filing_status === 0) {
      updateData.ps_filing_status = 1;
      updateData.ps_review_file_status = 1;
      timelineEventType = 'ps_filing_completed';
      timelineEventDesc = `PS Filing completed by ${userName}`;
    } else if (patent.cs_filer_assgn === userName && patent.cs_filing_status === 0) {
      updateData.cs_filing_status = 1;
      updateData.cs_review_file_status = 1;
      timelineEventType = 'cs_filing_completed';
      timelineEventDesc = `CS Filing completed by ${userName}`;
      
      // If form data is provided for CS filing, include it
      if (formData) {
        Object.assign(updateData, formData);
      }
    } else if (patent.fer_filer_assgn === userName && patent.fer_filing_status === 0) {
      updateData.fer_filing_status = 1;
      updateData.fer_review_file_status = 1;
      timelineEventType = 'fer_filing_completed';
      timelineEventDesc = `FER Filing completed by ${userName}`;
    } else if (patent.fer_entries && patent.fer_entries.some(fer => fer.fer_filer_assgn === userName && fer.fer_filing_status === 0)) {
      // Handle FER entries separately
      const ferEntry = patent.fer_entries.find(fer => fer.fer_filer_assgn === userName && fer.fer_filing_status === 0);
      if (ferEntry) {
        return completeFERFilerTask(ferEntry, userName);
      }
    }
    
    // Only update if we have fields to update
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error('Error completing filer task:', error);
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
    console.error('Error completing filer task:', error);
    return false;
  }
};
