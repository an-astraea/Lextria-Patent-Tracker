
import { Patent } from '@/lib/types';

export const getReviewTasks = async (): Promise<Patent[]> => {
  // Mock implementation - would call real API in production
  return [];
};

export const approvePSDrafting = async (patentId: string): Promise<{ success: boolean }> => {
  // Mock implementation - would call real API in production
  return { success: true };
};

export const approveCSDrawfting = async (patentId: string): Promise<{ success: boolean }> => {
  // Mock implementation - would call real API in production
  return { success: true };
};

export const approveFERDrafting = async (ferId: string): Promise<{ success: boolean }> => {
  // Mock implementation - would call real API in production
  return { success: true };
};

export const approvePSFiling = async (patentId: string): Promise<{ success: boolean }> => {
  // Mock implementation - would call real API in production
  return { success: true };
};

export const approveCSFiling = async (patentId: string): Promise<{ success: boolean }> => {
  // Mock implementation - would call real API in production
  return { success: true };
};

export const approveFERFiling = async (ferId: string): Promise<{ success: boolean }> => {
  // Mock implementation - would call real API in production
  return { success: true };
};
