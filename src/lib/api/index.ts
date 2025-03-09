
// Auth API exports
import { loginUser, logoutUser } from './auth-api';

// Patent API exports
import {
  fetchPatentById,
  fetchPatents,
  createPatent,
  updatePatent,
  deletePatent,
  updatePatentStatus,
  updatePatentForms,
  updatePatentNotes,
  createFEREntry,
  fetchPatentTimeline,
  updatePatentPayment
} from './patent-api';

// Employee API exports
import {
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from './drafter-api';

// Drafter API exports
import {
  fetchDrafterAssignments,
  fetchDrafterCompletedAssignments,
  fetchDrafterFERAssignments,
  completeDrafterTask,
  completeFERDrafterTask
} from './drafter-api';

// Filer API exports
import {
  fetchFilerAssignments,
  fetchFilerCompletedAssignments,
  fetchFilerFERAssignments,
  completeFilerTask,
  completeFERFilerTask,
  completeFERFiling
} from './filer-api';

// Review API exports
import {
  fetchPendingReviews,
  approveFERReview,
  approvePatentReview,
  rejectPatentReview
} from './review-api';

// Re-export all functions
export {
  // Auth API
  loginUser,
  logoutUser,
  
  // Patent API
  fetchPatents,
  fetchPatentById,
  createPatent,
  updatePatent,
  deletePatent,
  updatePatentStatus,
  updatePatentForms,
  updatePatentNotes,
  updatePatentPayment,
  createFEREntry,
  fetchPatentTimeline,
  
  // Employee API
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  
  // Drafter API
  fetchDrafterAssignments,
  fetchDrafterCompletedAssignments,
  fetchDrafterFERAssignments,
  completeDrafterTask,
  completeFERDrafterTask,
  
  // Filer API
  fetchFilerAssignments,
  fetchFilerCompletedAssignments,
  fetchFilerFERAssignments,
  completeFilerTask,
  completeFERFilerTask,
  completeFERFiling,
  
  // Review API
  fetchPendingReviews,
  approveFERReview,
  approvePatentReview,
  rejectPatentReview
};
