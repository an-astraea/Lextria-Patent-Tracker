
// Re-export all API functions
import {
  fetchPatents,
  fetchPatentById,
  addPatent,
  updatePatent,
  deletePatent,
  createPatent,
  createInventor,
  updatePatentNotes,
  updatePatentForms,
  updatePatentStatus,
  fetchPatentTimeline,
  createFEREntry,
  updateFEREntry,
  deleteFEREntry
} from './patent-api';

import {
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  loginUser
} from './employee-api';

import {
  fetchDrafterAssignments,
  fetchDrafterCompletedAssignments,
  fetchFilerAssignments,
  fetchFilerCompletedAssignments,
  fetchFilerFERAssignments,
  completeDrafterTask,
  completeFERDrafterTask,
  completeFilerTask,
  completeFERFilerTask,
  approvePatentReview,
  approveFERReview,
  rejectPatentReview,
  fetchPendingReviews
} from './assignment-api';

export {
  fetchPatents,
  fetchPatentById,
  addPatent,
  updatePatent,
  deletePatent,
  createPatent,
  createInventor,
  updatePatentNotes,
  updatePatentForms,
  updatePatentStatus,
  fetchPatentTimeline,
  createFEREntry,
  updateFEREntry,
  deleteFEREntry,
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  loginUser,
  fetchDrafterAssignments,
  fetchDrafterCompletedAssignments,
  fetchFilerAssignments,
  fetchFilerCompletedAssignments,
  fetchFilerFERAssignments,
  completeDrafterTask,
  completeFERDrafterTask,
  completeFilerTask,
  completeFERFilerTask,
  approvePatentReview,
  approveFERReview,
  rejectPatentReview,
  fetchPendingReviews
};
