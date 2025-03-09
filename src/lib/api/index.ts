
// Re-export only the functions that actually exist in the respective modules

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
  deleteEmployee
} from './employee-api';

// Drafter API exports
export {
  fetchDrafterAssignments,
  completeDrafterTask
} from './drafter-api';

// Filer API exports
export {
  fetchFilerAssignments,
  completeFilerTask
} from './filer-api';

// Review API exports
export {
  fetchPendingReviews
} from './review-api';

// Auth API exports
export {
  loginUser
} from './auth-api';

// FER actions exports
export {
  completeFERDrafterTask,
  completeFERFilerTask,
  approveFERReview
} from './fer-actions';
