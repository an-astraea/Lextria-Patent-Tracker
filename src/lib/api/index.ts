
// Re-export all API functions

// Patent API functions
export {
  fetchPatentById,
  fetchPatents,
  createPatent,
  updatePatent,
  deletePatent,
  updatePatentStatus,
  updatePatentForms,
  updatePatentNotes,
  fetchPatentTimeline,
  updatePatentPayment,
  createFEREntry,
  updateFEREntry,
  deleteFEREntry
} from "./patent-api";

// Employee API functions
export {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchPatentsAndEmployees
} from "./employee-api";

// Drafter API functions
export {
  fetchDrafterAssignments,
  fetchDrafterCompletedAssignments,
  fetchDrafterFERAssignments,
  completeDrafterTask,
  completeFERDrafterTask
} from "./drafter-api";

// Filer API functions
export {
  fetchFilerAssignments,
  fetchFilerCompletedAssignments,
  fetchFilerFERAssignments,
  completeFilerTask,
  completeFERFilerTask
} from "./filer-api";

// Review API functions
export {
  fetchPendingReviews,
  approveFERReview,
  approvePatentReview,
  rejectPatentReview
} from "./review-api";

// Auth API functions
export {
  login,
  logout,
  checkAuth
} from "./auth-api";
