
import { Patent } from '@/lib/types';

export const fetchEmployees = async () => {
  // This is a mock implementation - would call real API in production
  return {
    employees: [
      {
        id: '1',
        emp_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        ph_no: '1234567890',
        password: 'hashedpassword',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        emp_id: 'EMP002',
        full_name: 'Jane Smith',
        email: 'jane.smith@example.com',
        ph_no: '0987654321',
        password: 'hashedpassword',
        role: 'drafter',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  };
};

export const getDrafterTasks = async (userId: string): Promise<Patent[]> => {
  // Mock implementation - would call real API in production
  return [];
};

export const completePSDrafting = async (patentId: string): Promise<{ success: boolean }> => {
  // Mock implementation - would call real API in production
  return { success: true };
};

export const completeCSDrawfting = async (patentId: string): Promise<{ success: boolean }> => {
  // Mock implementation - would call real API in production
  return { success: true };
};

export const completeFERDrafting = async (ferId: string): Promise<{ success: boolean }> => {
  // Mock implementation - would call real API in production
  return { success: true };
};
