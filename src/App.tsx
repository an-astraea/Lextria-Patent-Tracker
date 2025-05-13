
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Patents from './pages/Patents';
import Employees from './pages/Employees';
import NotFound from './pages/NotFound';
import AddEditPatent from './pages/AddEditPatent';
import AddEditEmployee from './pages/AddEditEmployee';
import PatentDetails from './pages/PatentDetails';
import Approvals from './pages/Approvals';
import ClientDashboard from './pages/ClientDashboard';
import Drafts from './pages/Drafts';
import Filings from './pages/Filings';
import BulkUpload from './pages/BulkUpload';
import Sheets from './pages/Sheets';
import EmployeeDetails from './pages/EmployeeDetails'; // Add the new page
import { Toaster } from './components/ui/toaster';
import MainLayoutWrapper from './components/layout/MainLayoutWrapper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <MainLayoutWrapper>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patents" element={<Patents />} />
            <Route path="/patents/add" element={<AddEditPatent />} />
            <Route path="/patents/edit/:id" element={<AddEditPatent />} />
            <Route path="/patents/:id" element={<PatentDetails />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/add" element={<AddEditEmployee />} />
            <Route path="/employees/edit/:id" element={<AddEditEmployee />} />
            <Route path="/employees/view/:id" element={<EmployeeDetails />} /> {/* Add new route for employee details */}
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/clients" element={<ClientDashboard />} />
            <Route path="/drafts" element={<Drafts />} />
            <Route path="/filings" element={<Filings />} />
            <Route path="/bulk-upload" element={<BulkUpload />} />
            <Route path="/sheets" element={<Sheets />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayoutWrapper>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
