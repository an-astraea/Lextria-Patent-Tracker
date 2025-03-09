
// Import API functions from separate modules
import {
  fetchPatents,
  fetchPatentById,
  createPatent,
  updatePatent,
  deletePatent,
  updatePatentStatus,
  updatePatentNotes,
  updatePatentForms,
  updatePatentPayment,
  fetchPatentTimeline
} from "./patent-api";

import {
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from "./employee-api";

// Export all API functions
export {
  // Patent API functions
  fetchPatents,
  fetchPatentById,
  createPatent,
  updatePatent,
  deletePatent,
  updatePatentStatus,
  updatePatentNotes,
  updatePatentForms,
  updatePatentPayment,
  fetchPatentTimeline,

  // Employee API functions
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
