
// Re-export all API functions for backward compatibility
import * as patentApi from './patent-api';
import * as employeeApi from './employee-api';
import * as authApi from './auth-api';
import * as drafterApi from './drafter-api';
import * as filerApi from './filer-api';
import * as reviewApi from './review-api';

// Re-export everything to maintain the same import structure in existing files
export const {
  fetchPatents,
  fetchPatentById,
  updatePatentStatus,
  deletePatent,
  updatePatentForms,
  fetchPatentsByEmployee,
  createPatent,
  updatePatent,
  completeDrafterTask,
  completeFilerTask,
  approvePatentReview,
  updatePatentNotes
} = patentApi;

export const {
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = employeeApi;

export const {
  loginUser
} = authApi;

export const {
  fetchDrafterAssignments,
  fetchDrafterCompletedAssignments
} = drafterApi;

export const {
  fetchFilerAssignments,
  fetchFilerCompletedAssignments
} = filerApi;

export const {
  fetchPendingReviews,
  fetchPatentsAndEmployees
} = reviewApi;

// Re-export individual inventor functions for direct access
export const {
  createInventor,
  updateInventor
} = patentApi;
