
// Import necessary functions from the separate API modules
import {
  fetchPatents,
  fetchPatentById,
  addPatent,
  updatePatent,
  deletePatent,
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
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
} from './api/index';

export {
  fetchPatents,
  fetchPatentById,
  addPatent,
  updatePatent,
  deletePatent,
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
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

// Helper function to fetch patents and employees for various components
export const fetchPatentsAndEmployees = async () => {
  try {
    const patents = await fetchPatents();
    const employees = await fetchEmployees();
    return { patents, employees };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { patents: [], employees: [] };
  }
};

// Function to fetch employee by ID
export const fetchEmployeeById = async (id: string) => {
  const employees = await fetchEmployees();
  return employees.find(emp => emp.id === id) || null;
};
