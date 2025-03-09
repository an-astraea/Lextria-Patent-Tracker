
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayoutWrapper from "@/components/layout/MainLayoutWrapper";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Patents from "./pages/Patents";
import Employees from "./pages/Employees";
import Approvals from "./pages/Approvals";
import PatentDetails from "./pages/PatentDetails";
import AddEditPatent from "./pages/AddEditPatent";
import AddEditEmployee from "./pages/AddEditEmployee";
import Drafts from "./pages/Drafts";
import Filings from "./pages/Filings";
import NotFound from "./pages/NotFound";
import ClientDashboard from "./pages/ClientDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayoutWrapper>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patents" element={<Patents />} />
            <Route path="/patents/:id" element={<PatentDetails />} />
            <Route path="/patents/add" element={<AddEditPatent />} />
            <Route path="/patents/edit/:id" element={<AddEditPatent />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/add" element={<AddEditEmployee />} />
            <Route path="/employees/edit/:id" element={<AddEditEmployee />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/drafts" element={<Drafts />} />
            <Route path="/filings" element={<Filings />} />
            <Route path="/clients" element={<ClientDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayoutWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
