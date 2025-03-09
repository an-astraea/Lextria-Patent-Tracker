
// Re-export all API functions
import { loginUser, logoutUser } from './auth-api';
import {
  fetchPatents,
  fetchPatentById,
  createPatent,
  updatePatent,
  deletePatent,
  fetchPatentTimeline,
  createFEREntry,
  updateFEREntry
} from '../api'; // Import from the main API file since these functions are defined there

import {
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../api'; // Import employee functions from the main API

import {
  fetchDrafterAssignments,
  fetchDrafterCompletedAssignments,
  fetchDrafterFERAssignments,
  completeDrafterTask,
  completeFERDrafterTask
} from '../api';

import {
  fetchFilerAssignments,
  fetchFilerCompletedAssignments,
  fetchFilerFERAssignments,
  completeFilerTask,
  completeFERFilerTask
} from '../api';

import {
  fetchPendingReviews,
  approveReview,
  approveFERReview
} from '../api';

// Define completeFERFiling function that was missing
export const completeFERFiling = async (ferId: string) => {
  try {
    const { error } = await fetch(`/api/fer/${ferId}/complete-filing`, {
      method: 'POST',
    }).then(res => res.json());

    if (error) {
      return { error, success: false };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message, success: false };
  }
}

export {
  // Auth
  loginUser,
  logoutUser,

  // Patents
  fetchPatents,
  fetchPatentById,
  createPatent,
  updatePatent,
  deletePatent,
  fetchPatentTimeline,
  createFEREntry,
  updateFEREntry,

  // Employees
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,

  // Drafter
  fetchDrafterAssignments,
  fetchDrafterCompletedAssignments,
  fetchDrafterFERAssignments,
  completeDrafterTask,
  completeFERDrafterTask,

  // Filer
  fetchFilerAssignments,
  fetchFilerCompletedAssignments,
  fetchFilerFERAssignments,
  completeFilerTask,
  completeFERFilerTask,

  // Review
  fetchPendingReviews,
  approveReview,
  approveFERReview
};
