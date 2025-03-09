
// Authentication APIs
import { loginUser, logoutUser, registerUser } from './auth-api';

// Patent APIs
import { 
  fetchPatentById, 
  fetchPatents, 
  createPatent, 
  updatePatent, 
  deletePatent, 
  updatePatentStatus, 
  updatePatentForms, 
  updatePatentNotes, 
  fetchPatentTimeline, 
  createFEREntry, 
  updatePatentPayment
} from './patent-api';

// Employee APIs
import { 
  fetchEmployees, 
  fetchEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} from './employee-api';

// Drafter APIs
import { 
  fetchDrafterAssignments, 
  fetchDrafterCompletedAssignments, 
  fetchDrafterFERAssignments, 
  completeDrafterTask, 
  completeFERDrafterTask 
} from './drafter-api';

// Filer APIs
import { 
  fetchFilerAssignments, 
  fetchFilerCompletedAssignments, 
  fetchFilerFERAssignments, 
  completeFilerTask, 
  completeFERFilerTask,
  completeFERFiling
} from './filer-api';

// Review APIs
import {
  fetchPendingReviews,
  approveFERReview,
  approvePatentReview,
  rejectPatentReview
} from './review-api';

// Export all APIs
export {
  // Auth
  loginUser,
  logoutUser,
  registerUser,
  
  // Patents
  fetchPatentById,
  fetchPatents,
  createPatent,
  updatePatent,
  deletePatent,
  updatePatentStatus,
  updatePatentForms,
  updatePatentNotes,
  fetchPatentTimeline,
  createFEREntry,
  updatePatentPayment,
  
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
  completeFERFiling,
  
  // Review
  fetchPendingReviews,
  approveFERReview,
  approvePatentReview,
  rejectPatentReview
};
