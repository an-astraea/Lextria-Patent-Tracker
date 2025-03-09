
// Re-export all API functions
import { loginUser, registerUser } from './auth-api';
import {
  fetchPatents,
  fetchPatentById,
  createPatent,
  updatePatent,
  deletePatent,
  fetchPatentTimeline,
  fetchFEREntries,
  createFEREntry,
  updateFEREntry
} from './patent-api';
import {
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDrafterTasks,
  completePSDrafting,
  completeCSDrawfting,
  completeFERDrafting
} from './drafter-api';
import {
  fetchFilingTasks,
  completePSFiling,
  completeCSFiling,
  completeFERFiling
} from './filer-api';
import {
  getReviewTasks,
  approvePSDrafting,
  approveCSDrawfting,
  approveFERDrafting,
  approvePSFiling,
  approveCSFiling,
  approveFERFiling
} from './review-api';

export {
  // Auth
  loginUser,
  registerUser,

  // Patents
  fetchPatents,
  fetchPatentById,
  createPatent,
  updatePatent,
  deletePatent,
  fetchPatentTimeline,
  fetchFEREntries,
  createFEREntry,
  updateFEREntry,

  // Employees
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,

  // Drafter
  getDrafterTasks,
  completePSDrafting,
  completeCSDrawfting,
  completeFERDrafting,

  // Filer
  fetchFilingTasks,
  completePSFiling,
  completeCSFiling,
  completeFERFiling,

  // Review
  getReviewTasks,
  approvePSDrafting,
  approveCSDrawfting,
  approveFERDrafting,
  approvePSFiling,
  approveCSFiling,
  approveFERFiling
};
