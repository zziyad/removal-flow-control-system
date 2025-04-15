
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkflowProvider } from "@/contexts/WorkflowContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Removals from "./pages/Removals";
import RemovalCreate from "./pages/RemovalCreate";
import RemovalEdit from "./pages/RemovalEdit";
import RemovalDetail from "./pages/RemovalDetail";
import Approvals from "./pages/Approvals";
import Returns from "./pages/Returns";
import Extensions from "./pages/Extensions";
import PrivateRoute from "./components/auth/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkflowProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
              
              <Route path="/removals" element={<PrivateRoute><Removals /></PrivateRoute>} />
              <Route path="/removals/create" element={<PrivateRoute permissionRequired="create_removal"><RemovalCreate /></PrivateRoute>} />
              <Route path="/removals/:id" element={<PrivateRoute><RemovalDetail /></PrivateRoute>} />
              <Route path="/removals/:id/edit" element={<PrivateRoute><RemovalEdit /></PrivateRoute>} />
              
              <Route path="/approvals" element={<PrivateRoute permissionRequired="approve_level_2"><Approvals /></PrivateRoute>} />
              <Route path="/returns" element={<PrivateRoute permissionRequired="record_return"><Returns /></PrivateRoute>} />
              <Route path="/extensions" element={<PrivateRoute permissionRequired="manage_extension"><Extensions /></PrivateRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WorkflowProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
