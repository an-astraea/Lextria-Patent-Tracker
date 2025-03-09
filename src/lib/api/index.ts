
// Re-export all API functions from individual files

// Patent API exports
export {
  fetchPatents,
  fetchPatentById,
  fetchPatentTimeline,
  createPatent,
  updatePatent,
  deletePatent,
  updatePatentStatus,
  updatePatentForms,
  updatePatentNotes,
  createFEREntry,
  updateFEREntry,
  deleteFEREntry,
  updatePatentPayment
} from './patent-api';

// Employee API exports
export {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchPatentsAndEmployees
} from './employee-api';

// Drafter API exports
export {
  fetchDrafterAssignments,
  completeDrafterTask,
  fetchDrafterReviewRequests,
  fetchCompletedDrafts
} from './drafter-api';

// Filer API exports
export {
  fetchFilerAssignments,
  completeFilerTask,
  fetchFilerReviewRequests,
  fetchCompletedFilings
} from './filer-api';

// Review API exports
export {
  fetchPendingReviews,
  fetchCompletedReviews,
  fetchRejectedReviews,
  approvePatentStage,
  rejectPatentStage
} from './review-api';

// Auth API exports
export {
  signIn,
  signOut,
  getCurrentUser,
  resetPassword,
  updateUserProfile
} from './auth-api';

// FER actions exports
export {
  completeFERDrafterTask,
  completeFERFilerTask,
  approveFERReview
} from './fer-actions';
